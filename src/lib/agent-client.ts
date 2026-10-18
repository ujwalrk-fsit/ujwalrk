/**
 * DOM layer for the CHAT agent. Mounted as an ES module by Astro, so it has its
 * own scope and cannot collide with the other inline scripts on the page.
 */

import type { Audience, Scope } from '../data/kb';
import { PROFILE, SUGGESTIONS } from '../data/kb';
import {
  MODE_LABEL,
  MODE_NOTE,
  compose,
  leaks,
  search,
  suggestionsFor,
  type Answer,
} from './agent';

const MODES: Audience[] = ['recruiter', 'peer', 'client'];
const SCOPES: { id: Scope | null; label: string }[] = [
  { id: null, label: 'Everything' },
  { id: 'horizon', label: 'Horizon' },
  { id: 'adapter', label: 'Adapter' },
];

const DRAFT_INTENTS = ['draft an intro email', 'draft an email', 'write an email', 'intro email', 'email me'];

const DIAMOND = `<svg class="ico-mark" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
  <path d="M8 0.6 15.4 8 8 15.4 0.6 8Z" fill="currentColor"/>
  <path d="M8 4.2 11.8 8 8 11.8 4.2 8Z" fill="#fff"/>
</svg>`;

const CLOSE_SVG = `<svg class="ico-x" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
  <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

const CLOSE = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 4l8 8M12 4l-8 8"/></svg>`;

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

export function mountChat(root: HTMLElement): void {
  const variant = root.dataset.variant === 'page' ? 'page' : 'launcher';

  let mode: Audience = 'recruiter';
  let scope: Scope | null = null;
  let turns: { q: string; a: Answer }[] = [];
  let variantIndex = 0;
  let revealTimer: number | null = null;

  /* ------------------------------------------------------------- structure */
  const shell = el('div', `chat chat--${variant}`);

  const launcher = el('button', 'chat-launcher');
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Open chat');
  launcher.setAttribute('aria-controls', 'chat-panel');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = DIAMOND + CLOSE_SVG;

  const panel = el('section', 'chat-panel');
  panel.id = 'chat-panel';
  panel.setAttribute('aria-label', 'Chat with Ujwal');

  const head = el('header', 'chat-head');
  const headLabel = el('div', 'chat-head-label');
  const headTitle = el('span', 'chat-title', 'Chat');
  const disclosure = el(
    'span',
    'chat-disclosure',
    'Static agent · no model · nothing you type leaves this browser',
  );
  headLabel.append(headTitle, disclosure);
  const headActions = el('div', 'chat-head-actions');
  const clearBtn = el('button', 'chat-icon-btn', 'Clear');
  clearBtn.type = 'button';
  clearBtn.title = 'Clear conversation';
  const closeBtn = el('button', 'chat-icon-btn');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close chat');
  closeBtn.innerHTML = CLOSE;
  // On /chat there is nothing to close — the panel is the page.
  if (variant === 'page') closeBtn.hidden = true;
  headActions.append(clearBtn, closeBtn);
  head.append(headLabel, headActions);

  const controls = el('div', 'chat-controls');
  const modeRow = el('div', 'chat-row');
  modeRow.setAttribute('role', 'group');
  modeRow.setAttribute('aria-label', 'Answer focus');
  const scopeRow = el('div', 'chat-row');
  scopeRow.setAttribute('role', 'group');
  scopeRow.setAttribute('aria-label', 'Scope answers to');
  const modeNote = el('p', 'chat-mode-note', MODE_NOTE.recruiter);
  controls.append(modeRow, scopeRow, modeNote);

  const log = el('div', 'chat-log');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');
  log.setAttribute('aria-relevant', 'additions text');

  const chips = el('div', 'chat-chips');

  const composer = el('form', 'chat-composer');
  const input = el('textarea', 'chat-input');
  input.rows = 1;
  input.placeholder = 'Ask about my work…';
  input.setAttribute('aria-label', 'Your question');
  const sendBtn = el('button', 'chat-send', 'Ask');
  sendBtn.type = 'submit';
  const stopBtn = el('button', 'chat-stop', 'Stop');
  stopBtn.type = 'button';
  stopBtn.hidden = true;
  composer.append(input, stopBtn, sendBtn);

  panel.append(head, controls, log, chips, composer);
  if (variant === 'launcher') shell.append(launcher, panel);
  else shell.append(panel);
  root.append(shell);

  /* ----------------------------------------------------------------- state */
  /* No persistence of any kind: no localStorage, no cookies, no history. A
     shared machine must not leak a transcript, and the privacy answer in the
     knowledge base promises exactly this. */

  function clearTranscript(): void {
    stopReveal();
    turns = [];
    variantIndex = 0;
    log.textContent = '';
    greet();
  }

  /* --------------------------------------------------------------- render */
  function addUser(text: string): void {
    const wrap = el('div', 'chat-msg chat-msg--you is-new');
    wrap.append(el('p', null, text));
    log.append(wrap);
    scroll();
  }

  function addAgent(answer: Answer, opts: { animate?: boolean } = {}): HTMLElement {
    const wrap = el('article', `chat-msg chat-msg--ai${opts.animate ? ' is-new' : ''}`);

    const title = el('h2', 'chat-answer-title', answer.title);
    wrap.append(title);

    const prose = el('div', 'chat-answer-prose');
    wrap.append(prose);

    if (answer.bullets.length) {
      const ul = el('ul', 'chat-bullets');
      for (const b of answer.bullets) ul.append(el('li', null, b));
      wrap.append(ul);
    }

    if (answer.citations.length) {
      const cites = el('p', 'chat-cites');
      cites.append(el('span', 'chat-cites-label', 'Source:'));
      answer.citations.forEach((c, i) => {
        if (i) cites.append(document.createTextNode(' · '));
        const a = el('a', 'chat-cite', c.label);
        a.href = c.href;
        if (c.href.startsWith('/')) {
          a.setAttribute('aria-label', `${c.label} — opens on this site`);
        } else {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        cites.append(a);
      });
      wrap.append(cites);
    }

    if (answer.grounded && answer.sources.length > 1) {
      const det = el('details', 'chat-sources');
      det.append(el('summary', null, `Also drew on ${answer.sources.length - 1} more page section(s)`));
      const ul = el('ul');
      for (const s of answer.sources) ul.append(el('li', null, s));
      det.append(ul);
      wrap.append(det);
    }

    const actions = el('div', 'chat-actions');
    if (answer.grounded) {
      const again = el('button', 'chat-mini', 'Another phrasing');
      again.type = 'button';
      again.title = 'Same facts, different order — there is no model generating this';
      again.addEventListener('click', () => {
        const last = turns[turns.length - 1];
        if (!last) return;
        variantIndex += 1;
        const next = compose(search(last.q, { audience: mode, scope }), variantIndex);
        turns[turns.length - 1] = { q: last.q, a: next };
        wrap.remove();
        addAgent(next, { animate: true });
      });
      actions.append(again);
    }
    if (answer.contact || !answer.grounded) {
      const mail = el('a', 'chat-mini', 'Email me instead');
      mail.href = `mailto:${PROFILE.email}`;
      actions.append(mail);
    }
    if (actions.childElementCount) wrap.append(actions);

    log.append(wrap);
    scroll();

    if (opts.animate) typeInto(prose, answer.prose);
    else prose.textContent = answer.prose;

    return wrap;
  }

  /** Three-dot indicator shown for a beat before the first characters arrive. */
  function showTypingDots(): HTMLElement {
    const wrap = el('article', 'chat-msg chat-msg--ai is-new');
    wrap.append(el('div', 'chat-dots', '<i></i><i></i><i></i>'));
    log.append(wrap);
    stopBtn.hidden = false;
    sendBtn.disabled = true;
    scroll();
    return wrap;
  }

  function typeInto(node: HTMLElement, text: string): void {
    stopReveal();
    node.textContent = '';
    node.classList.add('is-typing');
    let i = 0;
    stopBtn.hidden = false;
    sendBtn.disabled = true;
    const tick = (): void => {
      node.textContent = text.slice(0, (i += 2));
      scroll();
      if (i >= text.length) {
        stopReveal();
        node.textContent = text;
        node.classList.remove('is-typing');
      }
    };
    revealTimer = window.setInterval(tick, 12);
  }

  function stopReveal(): void {
    if (revealTimer != null) {
      window.clearTimeout(revealTimer);
      window.clearInterval(revealTimer);
      revealTimer = null;
    }
    // A cancelled reply leaves nothing behind: drop the thinking dots too.
    log.querySelectorAll('.chat-dots').forEach((n) => n.parentElement?.remove());
    log.querySelectorAll('.chat-answer-prose.is-typing').forEach((n) => n.classList.remove('is-typing'));
    stopBtn.hidden = true;
    sendBtn.disabled = false;
  }

  function scroll(): void {
    log.scrollTop = log.scrollHeight;
  }

  function renderChips(): void {
    chips.textContent = '';
    const list = suggestionsFor(turns.length ? turns[turns.length - 1].a : null, scope);
    for (const ask of list.slice(0, 5)) {
      const b = el('button', 'chat-chip', ask);
      b.type = 'button';
      b.addEventListener('click', () => {
        input.value = ask;
        composer.requestSubmit();
      });
      chips.append(b);
    }
  }

  function greet(): void {
    const answer: Answer = {
      id: 'greeting',
      title: 'Ask me about my work',
      prose:
        "I'm a static agent built from this site's own pages — I match your question to a written answer and show you the section it came from. There's no language model here, so I can only speak to what's published: Horizon, Adapter, my experience and skills. If something isn't covered I'll say so rather than invent it.",
      bullets: [],
      citations: [],
      followUps: [],
      sources: [],
      grounded: false,
      contact: true,
    };
    turns = [];
    addAgent(answer);
    renderChips();
  }

  /* ------------------------------------------------------- draft-email flow */
  function wantsDraft(q: string): boolean {
    const t = q.toLowerCase();
    return DRAFT_INTENTS.some((d) => t.includes(d));
  }

  function draftFlow(node: HTMLElement): void {
    const wrap = el('div', 'chat-draft');
    const plan = el('div', 'chat-band');
    plan.append(el('span', 'chat-band-label', 'Action plan'));
    const ol = el('ol', 'chat-plan');
    for (const step of [
      'Summarise who you are and why you are emailing',
      "Draft it in your own tone — you edit every word",
      'Nothing is sent from this site; you send it yourself',
    ]) {
      ol.append(el('li', null, step));
    }
    plan.append(ol);

    const row = el('div', 'chat-actions');
    const confirm = el('button', 'chat-mini', 'Confirm and draft');
    confirm.type = 'button';
    const cancel = el('button', 'chat-mini', 'Cancel');
    cancel.type = 'button';
    row.append(confirm, cancel);

    const editor = el('div', 'chat-editor');
    editor.hidden = true;

    plan.append(row, editor);
    node.append(plan);

    cancel.addEventListener('click', () => plan.remove());

    confirm.addEventListener('click', () => {
      row.remove();
      const body = el('textarea', 'chat-draft-text');
      body.value =
        "Subject: Quick question about your BA work\n\nHi Ujwal,\n\nI came across your portfolio and I'm trying to understand how you work.\n\n[Add who you are and what you're hiring for — one or two lines is plenty.]\n\nThe part I'd most like to hear about is [a decision you made, a trade-off you navigated, or how you run a client conversation].\n\nIf you have 20 minutes, would [two times that suit you] work?\n\nThanks,\n[Your name]";
      const send = el('a', 'chat-mini', 'Open in your mail app');
      send.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
        'Quick question about your BA work',
      )}&body=${encodeURIComponent(body.value)}`;
      const note = el('p', 'chat-band-note', 'Draft only — nothing is sent until you press send in your mail app.');
      const actions = el('div', 'chat-actions');
      actions.append(send);
      editor.append(body, actions, note);
      editor.hidden = false;
    });
  }

  /* ------------------------------------------------------------- answering */
  function ask(question: string): void {
    const q = question.trim();
    if (!q) return;
    addUser(q);
    renderChips();

    if (wantsDraft(q)) {
      const wrap = el('article', 'chat-msg chat-msg--ai');
      wrap.append(el('h2', 'chat-answer-title', 'Drafting an intro email'));
      const prose = el('div', 'chat-answer-prose');
      prose.textContent =
        "I can lay out the draft for you. Nothing is sent from this site — you review it and send it yourself from your own mail app.";
      wrap.append(prose);
      log.append(wrap);
      scroll();
      draftFlow(wrap);
      return;
    }

    const hits = search(q, { audience: mode, scope });
    const answer = compose(hits, variantIndex);

    // Belt-and-braces: never emit a withheld name, even if the KB drifts.
    const payload = `${answer.title} ${answer.prose} ${answer.bullets.join(' ')}`;
    if (leaks(payload).length) {
      addAgent(compose([], 0));
      return;
    }

    turns.push({ q, a: answer });

    if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
      addAgent(answer);
      return;
    }

    // Brief thinking indicator, then the answer types in — reads the way every
    // chat agent does, and gives the Stop control something to interrupt.
    const dots = showTypingDots();
    revealTimer = window.setTimeout(() => {
      if (revealTimer != null) window.clearTimeout(revealTimer);
      dots.remove();
      addAgent(answer, { animate: true });
    }, 420);
  }

  /* -------------------------------------------------------------- controls */
  for (const m of MODES) {
    const b = el('button', 'chat-toggle', MODE_LABEL[m]);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(m === mode));
    b.dataset.mode = m;
    b.addEventListener('click', () => {
      mode = m;
      for (const other of modeRow.children) {
        other.setAttribute('aria-pressed', String((other as HTMLElement).dataset.mode === m));
      }
      modeNote.textContent = MODE_NOTE[m];
      input.focus();
    });
    modeRow.append(b);
  }

  for (const s of SCOPES) {
    const b = el('button', 'chat-chip', s.label);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(s.id === scope));
    b.dataset.scope = s.id ?? '';
    b.addEventListener('click', () => {
      scope = s.id;
      for (const other of scopeRow.children) {
        other.setAttribute('aria-pressed', String(((other as HTMLElement).dataset.scope || null) === scope));
      }
      renderChips();
      input.focus();
    });
    scopeRow.append(b);
  }

  composer.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = '';
    input.style.height = 'auto';
    variantIndex = 0;
    ask(v);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      composer.requestSubmit();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  });

  stopBtn.addEventListener('click', () => {
    const last = turns[turns.length - 1];
    stopReveal();
    if (!last) return;
    const prose = log.querySelector('.chat-msg--ai:last-child .chat-answer-prose');
    if (prose) {
      // Stopped mid-reveal: show the full text rather than a truncated answer.
      prose.textContent = last.a.prose;
    } else {
      // Stopped during the thinking phase, so no answer was rendered yet.
      addAgent(last.a);
    }
    scroll();
  });

  clearBtn.addEventListener('click', clearTranscript);

  /* ----------------------------------------------------------- open / close */
  function setOpen(open: boolean): void {
    shell.dataset.open = String(open);
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    launcher.classList.remove('is-idle');
    if (open) {
      // Focus is moved into the panel only once it is visible, otherwise the
      // browser scrolls a still-hidden element into view.
      window.setTimeout(() => {
        renderChips();
        scroll();
        input.focus({ preventScroll: true });
      }, 60);
    } else {
      stopReveal();
      launcher.focus({ preventScroll: true });
    }
  }

  launcher.addEventListener('click', () => setOpen(shell.dataset.open !== 'true'));
  closeBtn.addEventListener('click', () => setOpen(false));

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && variant === 'launcher' && shell.dataset.open === 'true') {
      setOpen(false);
    }
    if (e.key === 'Tab' && variant === 'launcher' && shell.dataset.open === 'true') {
      // Keep focus inside the panel while it is open.
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], textarea, input, summary, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }
  });

  if (variant === 'page') {
    document.title = 'Chat · Ujwal Ramesh Karajgikar';
  }

  greet();
  shell.dataset.open = variant === 'page' ? 'true' : 'false';

  // One gentle hint that the launcher is there, then never again.
  if (variant === 'launcher' && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    window.setTimeout(() => {
      if (shell.dataset.open === 'false') launcher.classList.add('is-idle');
    }, 6000);
  }
}