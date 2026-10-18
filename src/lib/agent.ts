/**
 * Static retrieval + answer composition for the CHAT agent.
 *
 * No model, no network. A question is tokenised and scored against the
 * keywords of each knowledge-base entry; the best entries above threshold are
 * composed into a grounded answer with citations.
 *
 * Pure module: no DOM, no globals. scripts/verify-chat.mjs imports it directly.
 */

import type { Audience, KbEntry, Scope } from '../data/kb';
import { FORBIDDEN, KB, SUGGESTIONS } from '../data/kb';

export interface Options {
  audience?: Audience;
  scope?: Scope | null;
  limit?: number;
  threshold?: number;
}

export interface Hit {
  entry: KbEntry;
  score: number;
}

export interface Answer {
  id: string;
  title: string;
  prose: string;
  bullets: string[];
  citations: { label: string; href: string }[];
  followUps: string[];
  sources: string[];
  grounded: boolean;
  contact: boolean;
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'am', 'do', 'does', 'did',
  'i', 'me', 'my', 'you', 'your', 'yours', 'he', 'she', 'it', 'we', 'they', 'them', 'his', 'her',
  'and', 'or', 'but', 'if', 'then', 'else', 'of', 'to', 'in', 'on', 'at', 'by', 'for', 'with',
  'about', 'into', 'from', 'up', 'down', 'out', 'over', 'under', 'again', 'can', 'could',
  'would', 'should', 'will', 'shall', 'may', 'might', 'must', 'have', 'has', 'had', 'having',
  'there', 'here', 'when', 'where', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose',
  'any', 'all', 'some', 'such', 'no', 'nor', 'not', 'only', 'same', 'so', 'than', 'too',
  'very', 'just', 'know', 'want', 'need',
]);

/** Lowercase, strip punctuation, drop stopwords, and lightly stem. */
export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.-]/g, ' ')
    .split(/[\s#.]+/)
    .map((t) => t.replace(/^[-.]+|[-.]+$/g, ''))
    .filter(Boolean)
    .map(stem)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Crude but predictable suffix folding so "wire"/"wires" and "cost"/"costs" agree. */
function stem(t: string): string {
  return t
    .replace(/(ations|ation|ing|edly|ed|es|s)$/i, (m, g: string) => (g === 'ing' || g === 'ed' ? '' : m))
    .replace(/(ss|us|is)$/i, '');
}

function keywordTokens(kw: string): string[] {
  return kw.split(/[\s-]+/).map((t) => t.trim()).filter(Boolean);
}

/**
 * Score one entry against a tokenised question.
 * Exact keyword tokens score 1.25, so two hits clear the bar; multi-word keyword
 * phrases score 4 when the whole phrase appears in the raw question, which is how
 * short phrasings like "get in touch" still reach the right entry. A nudge for
 * question words appearing in the prose can never reach the threshold alone,
 * so a single weak match still falls through to the refusal.
 */
export function scoreEntry(rawQuery: string, qTokens: Set<string>, entry: KbEntry): number {
  let score = 0;
  const haystack = `${entry.answer} ${entry.title} ${(entry.keywords || []).join(' ')}`.toLowerCase();

  for (const kw of entry.keywords) {
    if (kw.includes(' ')) {
      if (rawQuery.includes(kw)) score += 4;
    } else if (qTokens.has(stem(kw))) {
      score += 1.25;
    }
  }

  // Nudge for question words that appear in the prose but not the keyword list.
  let nudge = 0;
  for (const t of qTokens) if (t.length > 3 && haystack.includes(t)) nudge += 0.25;
  return score + Math.min(nudge, 1);
}

export function search(query: string, opts: Options = {}): Hit[] {
  const { audience, scope = null, limit = 3, threshold = 2 } = opts;
  const raw = query.trim().toLowerCase();
  if (!raw) return [];
  const tokens = tokenize(raw);
  if (!tokens.length) return [];
  const qTokens = new Set(tokens);

  const scored: Hit[] = [];
  for (const entry of KB) {
    if (scope && entry.scope !== scope) continue;
    let score = scoreEntry(raw, qTokens, entry);
    if (audience && entry.audience.length && !entry.audience.includes(audience)) score *= 0.4;
    if (score > 0) scored.push({ entry, score });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit).filter((h) => h.score >= threshold);
}

export interface Fallback {
  title: string;
  prose: string;
  bullets: string[];
  citations: { label: string; href: string }[];
  followUps: string[];
  sources: string[];
  grounded: false;
  contact: boolean;
}

export const OUT_OF_SCOPE: Fallback = {
  title: "I don't have anything grounded on that",
  prose:
    "I only know what's published on this site — Horizon, Adapter, my experience and my skills — so I'd rather say I don't know than guess. A few things I can help with instead:",
  bullets: [
    'What I owned on Horizon, and the decisions behind it',
    'Why we shipped manual wire transfers, and the e-signature build',
    'How Adapter works and where it stands',
    'My skills, experience, and how I work',
  ],
  citations: [
    { label: 'Horizon case study', href: '/work/horizon' },
    { label: 'Adapter case study', href: '/work/adapter' },
    { label: 'About', href: '/about' },
  ],
  followUps: SUGGESTIONS.slice(0, 3).map((s) => s.ask),
  sources: [],
  grounded: false,
  contact: true,
};

/**
 * Compose the visible answer. `variant` cycles phrasing so the "another phrasing"
 * control returns the same grounded facts in a different order, never new facts.
 */
export function compose(hits: Hit[], variant = 0): Answer | Fallback {
  if (!hits.length) return OUT_OF_SCOPE;
  const primary = hits[0].entry;
  const extras = hits.slice(1);
  const v = ((variant % 3) + 3) % 3;

  let prose = primary.answer;
  let bullets = primary.bullets ? [...primary.bullets] : [];

  if (v === 1 && bullets.length) {
    prose = primary.answer.split(/(?<=\.)\s+/)[0] ?? primary.answer;
    bullets = [...bullets, ...extras.map((h) => h.entry.title)];
  } else if (v === 2) {
    const lead = extras[0];
    prose = lead
      ? `${primary.answer}\n\nRelated: ${lead.entry.title} — ${lead.entry.answer}`
      : primary.answer;
  }

  const citations = [...(primary.citations ?? [])];
  for (const h of extras) for (const c of h.entry.citations ?? []) {
    if (!citations.some((x) => x.href === c.href)) citations.push(c);
  }

  const sources = [primary, ...extras.map((h) => h.entry)].map((e) => e.title);

  return {
    id: primary.id,
    title: primary.title,
    prose,
    bullets,
    citations: citations.slice(0, 4),
    followUps: primary.followUps ?? [],
    sources,
    grounded: true,
    contact: false,
  };
}

/** Live cross-reference prompts, filtered to what was just answered. */
export function followUpsFor(answer: Answer): string[] {
  const own = answer.followUps.length ? answer.followUps : [];
  const fillers = SUGGESTIONS.map((s) => s.ask);
  return [...own, ...fillers].filter((q, i, arr) => arr.indexOf(q) === i).slice(0, 4);
}

/** Suggestion chips: entry suggestions first, then general ones, never repeating. */
export function suggestionsFor(answer: Answer | null, scope: Scope | null): string[] {
  const scoped = KB.filter((e) => (scope ? e.scope === scope : true)).length;
  const general = SUGGESTIONS.map((s) => s.ask);
  if (!answer) return general.slice(0, scope ? 4 : 6);
  const fromFollow = followUpsFor(answer);
  const out = [...fromFollow, ...general].filter((q, i, arr) => arr.indexOf(q) === i);
  return out.slice(0, Math.min(4, scope ? 5 : 6));
}

/** Guard: refuse to emit anything containing a withheld name. */
export function leaks(text: string): string[] {
  const t = text.toLowerCase();
  return FORBIDDEN.filter((f) => t.includes(f));
}

export const MODE_LABEL: Record<Audience, string> = {
  recruiter: 'Recruiter view',
  peer: 'Peer view',
  client: 'Client view',
};

export const MODE_NOTE: Record<Audience, string> = {
  recruiter: 'Role, scope and results first.',
  peer: 'Trade-offs and process detail first.',
  client: 'Decisions, constraints and delivery first.',
};