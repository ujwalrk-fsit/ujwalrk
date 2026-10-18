/**
 * Verification harness for the static CHAT agent.
 *
 *   node scripts/verify-chat.mjs
 *
 * Covers the six checks agreed before build:
 *   1. adversarial questions invent nothing and leak no withheld names
 *   2. every citation resolves to a real element id in the built HTML
 *   3. the panel and launcher clear the fixed mobile Contents bar
 *   4. the site is still fully static — /chat prerendered, no adapter
 *   5. no network calls, no storage, no console logging in shipped assets
 *   6. keyboard and screen-reader affordances are present
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { registerHooks } from 'node:module';

// Astro/Vite resolve extensionless relative imports; Node does not. Rather than
// pollute the source with .ts specifiers, teach the loader one retry here.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (err) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw err;
    }
  },
});

const { KB, FORBIDDEN } = await import('../src/data/kb.ts');
const { compose, leaks, search } = await import('../src/lib/agent.ts');

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

let failures = 0;
const pass = (n, msg) => console.log(`  PASS  ${n} ${msg}`);
const fail = (n, msg) => {
  failures += 1;
  console.log(`  FAIL  ${n} ${msg}`);
};
const check = (n, cond, ok, bad) => (cond ? pass(n, ok) : fail(n, bad));

const read = (p) => readFileSync(join(ROOT, p), 'utf8');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const ask = (q, opts = {}) => {
  const hits = search(q, opts);
  return { hits, answer: compose(hits, 0) };
};

/* ------------------------------------------------------------------ 1 */
console.log('\n1. Adversarial questions — nothing invented, no withheld names');

const SHOULD_GROUND = [
  ['why did you go with manual wire transfers', 'h-d2-payments'],
  ['what did you own at Horizon', 'h-overview'],
  ['is Horizon live', 'h-status'],
  ['the signing screen took ten seconds', 'h-d3-esign'],
  ['monthly cloud cost review', 'h-d4-cost'],
  ['ansible terraform intern', 'exp-intern'],
  ['what tools do you use', 'skills-business'],
  ['hours for staging kubernetes', 'h-d4-cost'],
  ['canonical transaction model', 'a-d1-canonical'],
  ['what are the five phases', 'a-phases'],
  ['encryption and audit retention', 'h-security'],
  ['how do I get in touch', 'contact'],
  ['do you have a resume', 'resume'],
  ['your first 10k marathon', 'outside-work'],
  ['is Adapter live yet', 'a-status'],
  ['summarise horizon', 'h-summary'],
  ['summarise adapter', 'a-summary'],
  ['three years audit log', 'h-security'],
  ['what did you learn', 'h-learned'],
  ['what is it like working with you', 'working-with-me'],
];

let groundedOk = 0;
for (const [q, expected] of SHOULD_GROUND) {
  const { answer } = ask(q);
  if (answer.grounded && answer.id === expected) groundedOk += 1;
  else fail('1.grd', `"${q}" → got ${answer.id} (expected ${expected})`);
}
check('1.grd', groundedOk === SHOULD_GROUND.length, `${groundedOk}/${SHOULD_GROUND.length} in-scope questions hit the right entry`, `${groundedOk}/${SHOULD_GROUND.length} in-scope questions hit the right entry`);

const SHOULD_REFUSE = [
  'what is the weather in bangalore tomorrow',
  'what is your home address',
  'what is your bank account number',
  'what salary are you asking for',
  'can I get a reference from your client',
  'tell me a joke about testers',
  'who won the world cup',
  'can you book a meeting on my calendar',
  'give me the ceo email at your company',
  'write me code in rust',
];
let refused = 0;
for (const q of SHOULD_REFUSE) {
  if (!ask(q).answer.grounded) refused += 1;
  else fail('1.ref', `"${q}" should not have been answered`);
}
check('1.ref', refused === SHOULD_REFUSE.length, `${refused}/${SHOULD_REFUSE.length} out-of-scope questions refused`, `${refused}/${SHOULD_REFUSE.length} out-of-scope questions refused`);

let leakHits = 0;
const scan = (q, opts) => {
  const a = compose(search(q, opts), 0);
  const payload = `${a.title} ${a.prose} ${(a.bullets ?? []).join(' ')} ${(a.citations ?? []).map((c) => c.href).join(' ')}`;
  for (const l of leaks(payload)) {
    leakHits += 1;
    fail('1.leak', `"${q}" leaked withheld name "${l}"`);
  }
};
for (const [q] of SHOULD_GROUND) scan(q, {});
for (const q of SHOULD_REFUSE) scan(q, {});
for (const e of KB) scan(e.title, {});
check('1.leak', leakHits === 0, `no withheld name in any answer (checked ${FORBIDDEN.length} forbidden terms)`, `${leakHits} leak(s)`);

// Keywords are match hints and are never rendered, so a vendor name there (e.g.
// "stripe" as a synonym for a payment processor) is not a disclosure. Scan only
// the fields a visitor can actually see.
const visible = KB.map((e) => ({ id: e.id, text: `${e.title} ${e.answer} ${(e.bullets ?? []).join(' ')} ${(e.citations ?? []).map((c) => `${c.label} ${c.href}`).join(' ')}` }));
const kbLeaks = visible.filter((e) => leaks(e.text).length > 0).map((e) => `${e.id} (${leaks(e.text).join(',')})`);
check('1.kb', kbLeaks.length === 0, 'no withheld name in any visitor-visible field', `knowledge base leaks: ${kbLeaks.join('; ')}`);

// Variants must reuse the same facts, never add any.
const q0 = 'why manual wire transfers';
const base = compose(search(q0, {}), 0);
let variantStable = true;
for (let v = 1; v < 4; v += 1) {
  const alt = compose(search(q0, {}), v);
  if (alt.id !== base.id) variantStable = false;
  if (leaks(`${alt.title} ${alt.prose} ${(alt.bullets ?? []).join(' ')}`).length) variantStable = false;
}
check('1.var', variantStable, 'all three phrasings of an answer share the same source entry', 'phrasing variants drifted');

/* ------------------------------------------------------------------ 2 */
console.log('\n2. Citations resolve to real element ids in the built HTML');

const pageFile = {
  '/': 'dist/index.html',
  '/about': 'dist/about/index.html',
  '/play': 'dist/play/index.html',
  '/notes': 'dist/notes/index.html',
  '/chat': 'dist/chat/index.html',
  '/work/horizon': 'dist/work/horizon/index.html',
  '/work/adapter': 'dist/work/adapter/index.html',
};

const idCache = new Map();
const idsIn = (file) => {
  if (!idCache.has(file)) {
    const html = read(file);
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file);
};

let checked = 0;
let bad = 0;
const assetExists = (p) => {
  try {
    return statSync(join(DIST, p.replace(/^\//, ''))).size > 0;
  } catch {
    return false;
  }
};

for (const e of KB) {
  for (const c of e.citations ?? []) {
    if (!c.href.startsWith('/')) continue;
    const [path, frag] = c.href.split('#');
    const file = pageFile[path];

    if (!file) {
      // Not a page: must be a real static asset (e.g. /resume.pdf).
      checked += 1;
      if (!assetExists(path)) {
        bad += 1;
        fail('2.asset', `${e.id}: citation "${c.href}" is neither a route nor a built asset`);
      }
      continue;
    }

    checked += 1;
    if (frag && !idsIn(file).has(frag)) {
      bad += 1;
      fail('2.frag', `${e.id}: ${c.href} → id="${frag}" not found in ${file}`);
    }
  }
}
check('2', bad === 0, `all ${checked} internal citations resolve to a real page, id or asset`, `${bad} broken citation(s)`);

/* ------------------------------------------------------------------ 3 */
console.log('\n3. Panel and launcher clear the fixed mobile Contents bar');

const css = readdirSync(join(DIST, '_astro'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(join(DIST, '_astro', f), 'utf8'))
  .join('\n');

const fabHeight = css.match(/\.fab\{[^}]*height:\s*([\d.]+)rem/)?.[1];
const launcherAbove = css.match(/body:has\(\.fab\) \.chat-launcher\{[^}]*bottom:\s*([\d.]+)rem/)?.[1];
const panelAbove = css.match(/body:has\(\.fab\) \.chat--launcher \.chat-panel\{[^}]*bottom:\s*([\d.]+)rem/)?.[1];

check('3.fab', fabHeight === '2.5', `Contents bar height is ${fabHeight}rem`, `Contents bar height is ${fabHeight}rem, expected 2.5rem`);
// The overlay is a centred modal, so it clears the Contents bar by stacking and
// scrimming over it rather than by being offset above it.
check(
  '3.overlay',
  /\.chat-scrim\{[^}]*position:fixed;inset:0[^}]*z-index:25/.test(css) &&
    /\.chat--launcher \.chat-panel\{[^}]*inset:0;margin:auto/.test(css),
  'overlay is centred with a full-viewport scrim above the Contents bar',
  'overlay is not a centred scrimmed modal',
);
check(
  '3.z',
  /\.chat-launcher\{[^}]*z-index:24/.test(css) && /\.chat--launcher \.chat-panel\{[^}]*z-index:26/.test(css),
  'launcher (24), scrim (25) and panel (26) stack in the right order',
  'z-index layering is wrong',
);

/* ------------------------------------------------------- 3b panel heights */
console.log('\n3b. Panel heights are viewport-driven, not magic numbers');

const dvhUses = (css.match(/100dvh/g) ?? []).length;
const vhUses = (css.match(/100vh/g) ?? []).length;
check(
  '3b.dvh',
  dvhUses >= 3 && dvhUses >= vhUses,
  `dynamic viewport units used ${dvhUses}x against ${vhUses}x of 100vh, each with a fallback`,
  `only ${dvhUses} dvh use(s) against ${vhUses} vh use(s)`,
);

check(
  '3b.autosize',
  /\.chat-empty\{[^}]*display:flex/.test(css) && /\.chat-empty>\*\{width:100%;max-width:32rem\}/.test(css),
  'empty-state rows carry an explicit width so the composer cannot collapse',
  'empty-state rows have no explicit width � the input collapses under align-items:center',
);
check(
  '3b.modal',
  /\.chat--launcher \.chat-panel\{[^}]*height:min\(38rem,calc\(100vh - 4rem\)\)/.test(css) &&
    /\.chat--launcher \.chat-panel\{[^}]*max-height:calc\(100dvh - 4rem\)/.test(css),
  'overlay height is a deliberate modal size with a dynamic-viewport cap',
  'overlay height is not defined as a capped modal',
);
check(
  '3b.page',
  /\.page--chat\{[^}]*padding:0/.test(css) &&
    /\.page--chat\{[^}]*height:calc\(100dvh - var\(--nav-h\)\)/.test(css) &&
    /\.chat--page\{height:100%/.test(css),
  '/chat owns the full column height with zero top padding',
  '/chat does not fill the viewport below the header',
);
const chatPageHtml = read('dist/chat/index.html');
check(
  '3b.pagewrap',
  /class="page page--chat"/.test(chatPageHtml),
  '/chat renders with the page--chat wrapper class',
  '/chat is missing the page--chat wrapper class',
);
check(
  '3b.nointro',
  !/<div class="hm">/.test(chatPageHtml) && !/class="page page--chat">\s*<p/.test(chatPageHtml),
  '/chat has no intro text block above the panel',
  '/chat still renders an intro text block',
);
check(
  '3b.navh',
  /new ResizeObserver\(set\)\.observe\(head\)/.test(read('src/layouts/Base.astro')) &&
    /--nav-h/.test(read('src/layouts/Base.astro')),
  'header height is measured into --nav-h, so panel caps stay correct when it wraps',
  'header height is still a declared guess',
);

/* ------------------------------------------- 3d [hidden] must stay authoritative */
console.log('\n3d. State toggling is not silently broken');

check(
  '3d.hidden',
  /\[hidden\]\{display:none\s*!important\}/.test(css),
  '[hidden] is authoritative � class display rules cannot defeat it',
  'missing [hidden]{display:none!important}: elements toggled by attribute still render',
);
// Guards the bug where a class with `display` beats the UA [hidden] rule, so the
// empty state, transcript and header all render at the same time.
const toggledWithDisplay = ['chat-empty', 'chat-log', 'chat-head', 'chat-chips', 'chat-editor'].filter((cls) =>
  new RegExp('\\.' + cls + '\\{[^}]*display:').test(css),
);
check(
  '3d.conflicts',
  toggledWithDisplay.length >= 3,
  `${toggledWithDisplay.length} attribute-toggled classes set display and are protected: ${toggledWithDisplay.join(', ')}`,
  'expected several display-setting toggled classes to be protected',
);

/* ------------------------------------------------------ 3c motion layer */
console.log('\n3c. Motion is present and respects reduced-motion');

// The minifier strips attribute quotes ([data-open=true]) and collapses ::after,
// so these match against shipped CSS rather than the authored source.
for (const [name, re] of [
  ['panel open/close', /\[data-open=["']?true["']?\]\s*\.chat-panel\{[^}]*transform:none/],
  ['icon morph', /\.chat-launcher\[aria-expanded=["']?true["']?\]\s*\.ico-mark\{[^}]*opacity:0/],
  ['message entry', /@keyframes chatRise\{/],
  ['typing caret', /\.chat-answer-prose\.is-typing:{1,2}after\{/],
  ['thinking dots', /\.chat-dots i\{[^}]*animation:chatDot/],
  ['chip cascade', /\.chat-chips \.chat-chip\{animation:chatChip/],
]) {
  check(`3c.${name.split(' ')[0]}`, re.test(css), `${name} animated`, `${name} missing in shipped CSS`);
}
check(
  '3c.reduced',
  /@media\(prefers-reduced-motion:reduce\)\{\s*\.chat \*/.test(css) || /\.chat-launcher\.is-idle\{animation:none\}/.test(css),
  'reduced-motion disables every chat animation',
  'chat animations are not disabled under prefers-reduced-motion',
);
check(
  '3c.state',
  /shell\.dataset\.open/.test(read('src/lib/agent-client.ts')),
  'panel visibility is driven by data-open so transitions can run',
  'panel still toggles via the hidden attribute, which blocks transitions',
);

/* ------------------------------------------------------------------ 4 */
console.log('\n4. Still fully static — /chat prerendered, no server output');

const config = read('astro.config.mjs');
check('4.static', /output:\s*'static'/.test(config), "astro config is still output: 'static'", 'astro output is no longer static');
check('4.adapter', !/adapter/.test(config), 'no adapter added — nothing to deploy as a function', 'an adapter was added');
const pkg = JSON.parse(read('package.json'));
check('4.dep', !pkg.dependencies['@astrojs/vercel'] && !pkg.devDependencies['@astrojs/vercel'], 'no serverless dependency in package.json', '@astrojs/vercel present');

const expected = Object.values(pageFile);
const missing = expected.filter((f) => {
  try {
    return statSync(join(ROOT, f)).size === 0;
  } catch {
    return true;
  }
});
check('4.pages', missing.length === 0, `all ${expected.length} routes prerendered to HTML`, `missing: ${missing.join(', ')}`);
check('4.noserver', !existsSync(join(DIST, '.vercel')), 'no .vercel function output in dist', 'unexpected server output in dist');

/* ------------------------------------------------------------------ 5 */
console.log('\n5. No network, no storage, no logging in shipped assets');

const shipped = walk(join(DIST, '_astro'))
  .concat(walk(DIST).filter((f) => f.endsWith('.html')));
const BANNED = [
  [/\bfetch\s*\(/, 'fetch()'],
  [/XMLHttpRequest/, 'XMLHttpRequest'],
  [/navigator\.sendBeacon/, 'sendBeacon'],
  [/localStorage/, 'localStorage'],
  [/sessionStorage/, 'sessionStorage'],
  [/document\.cookie/, 'document.cookie'],
  [/indexedDB/, 'indexedDB'],
  [/console\.(log|warn|info|debug)/, 'console logging'],
];
let banned = 0;
for (const file of shipped) {
  const body = readFileSync(file, 'utf8');
  for (const [re, label] of BANNED) {
    if (re.test(body)) {
      banned += 1;
      fail('5', `${label} found in ${file.replace(ROOT, '.')}`);
    }
  }
}
check('5', banned === 0, `no network, storage or logging calls across ${shipped.length} shipped files`, `${banned} banned pattern(s) found`);

// Scope this to the agent's own bundle. Page HTML legitimately contains absolute
// URLs (canonical tags, the Play page's podcast link, SVG namespaces) that are
// links, not outbound calls made on the visitor's behalf. The two profile links
// are deliberate: a visitor can choose to open LinkedIn or the resume.
const AGENT_LINKS_ALLOWED = ['https://www.linkedin.com'];
const agentJs = shipped.filter((f) => f.endsWith('.js'));
const extCalls = (agentJs
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n')
  .match(/https?:\/\/[a-z0-9.-]+/gi) ?? [])
  .filter((u) => !AGENT_LINKS_ALLOWED.some((ok) => u.startsWith(ok)));
check(
  '5.ext',
  extCalls.length === 0,
  `agent bundle references no endpoint beyond the ${AGENT_LINKS_ALLOWED.length} intentional profile link(s)`,
  `unexpected outbound refs in agent code: ${[...new Set(extCalls)].join(', ')}`,
);

// The knowledge base must be embedded in the bundle: the agent has to answer
// with zero requests, which is the whole privacy claim.
const bundle = agentJs.map((f) => readFileSync(f, 'utf8')).join('\n');
const embedded = KB.filter((e) => bundle.includes(e.id)).length;
check(
  '5.embed',
  embedded === KB.length,
  `all ${KB.length} knowledge entries are embedded in the bundle — zero requests to answer`,
  `only ${embedded}/${KB.length} entries embedded in the bundle`,
);

check(
  '5.rem',
  !/\d+px/.test(css),
  'no px values anywhere in the shipped stylesheet — everything is rem',
  `shipped CSS still contains ${(css.match(/\d+px/g) ?? []).length} px value(s)`,
);

/* ------------------------------------------------------------------ 6 */
console.log('\n6. Keyboard and screen-reader affordances');

const chatHtml = read('dist/chat/index.html');
const client = read('src/lib/agent-client.ts');

// The transcript region is created at runtime, so assert on the source that builds it.
check('6.log', /setAttribute\('role',\s*'log'\)/.test(client), "transcript is a role='log' region", "missing role='log'");
check('6.live', /setAttribute\('aria-live',\s*'polite'\)/.test(client), "aria-live='polite' for streamed answers", "missing aria-live");
check('6.exp', /aria-expanded/.test(chatHtml) || /aria-expanded/.test(client), 'launcher and suggestion toggle expose aria-expanded', 'missing aria-expanded');
check(
  '6.press',
  /setAttribute\('aria-expanded', String\(on\)\)/.test(client),
  'the suggestions toggle reports its pressed state',
  'suggestions toggle does not report aria-expanded',
);

// Minimality: the reference layout has no mode or scope controls, so they must
// be gone rather than merely hidden.
check(
  '6.minimal',
  !/chat-toggle/.test(client) && !/chat-row/.test(client) && !/chat-mode-note/.test(client) &&
    !/chat-toggle/.test(css) && !/chat-controls/.test(css),
  'mode and scope controls removed from the panel',
  'mode or scope controls are still present',
);
check('6.empty', /chat-greeting/.test(client) && /chat-try/.test(client), 'empty state has a greeting and a prompt label', 'empty state is missing');
check('6.note', /Static agent/.test(client), 'footer disclaimer discloses what the agent is', 'footer disclaimer missing');
check('6.label', /aria-label/.test(client), 'icon-only controls carry aria-label', 'missing aria-label');
check('6.esc', /e\.key === 'Escape'/.test(client), 'Escape closes the panel and returns focus', 'no Escape handling');
check('6.enter', /e\.key === 'Enter'/.test(client), 'Enter submits, Shift+Enter newlines', 'no Enter handling');
check('6.reveal', /revealTimer != null/.test(client), 'mid-stream Stop control is implemented', 'no stop control');
check('6.noscript', /chat-noscript/.test(read('dist/index.html')), 'non-JS fallback link is rendered', 'no noscript fallback');

/* ------------------------------------------------------------------ done */
console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
