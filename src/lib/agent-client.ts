/**
 * DOM layer for the CHAT agent. Mounted as an ES module by Astro, so it has its
 * own scope and cannot collide with the other inline scripts on the page.
 *
 * Two states, per the reference layout:
 *   empty        centred greeting, composer, suggestion chips
 *   conversation slim header, transcript, composer in a footer with a disclaimer
 */

import type { Scope } from '../data/kb';
import { PROFILE, SUGGESTIONS } from '../data/kb';
import { compose, leaks, search, type Answer } from './agent';

const DRAFT_INTENTS = ['draft an intro email', 'draft an email', 'write an email', 'intro email', 'email me'];

/** Quick commands for the overlay — plain navigation, no retrieval needed. */
const COMMANDS: { label: string; href?: string; ask?: string }[] = [
  { label: 'Read the Horizon case study', href: '/work/horizon' },
  { label: 'Read the Adapter case study', href: '/work/adapter' },
  { label: 'What results did he ship?', ask: 'What results did Horizon produce' },
  { label: 'Experience and skills', ask: 'What tools and skills do you have' },
  { label: 'How he works', ask: 'What is it like working with you' },
  { label: 'Download resume', href: PROFILE.resume },
  { label: 'Email Ujwal', href: `mailto:${PROFILE.email}` },
];

const ICON = {
  diamond: `<svg width="9" height="9" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 0.6 15.4 8 8 15.4 0.6 8Z" fill="currentColor"/></svg>`,
  x: `<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  back: `<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  send: `<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 13V3.5M8 3.5 4 7.5M8 3.5l4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  plus: `<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 3.5v9M3.5 8h9" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  copy: `<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`,
};

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
  const isPage = variant === 'page';

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
  launcher.innerHTML =
    `<svg class="ico-mark" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 0.6 15.4 8 8 15.4 0.6 8Z" fill="currentColor"/><path d="M8 4.2 11.8 8 8 11.8 4.2 8Z" fill="#fff"/></svg>${ICON.x}`;

  const panel = el('section', 'chat-panel');
  panel.id = 'chat-panel';
  panel.setAttribute('aria-label', 'Chat with Ujwal');

  const scrim = el('div', 'chat-scrim');

  /* header — conversation state only */
  const head = el('header', 'chat-head');
  head.hidden = true;
  const backBtn = el('button', 'chat-back');
  backBtn.type = 'button';
  backBtn.setAttribute('aria-label', 'Clear conversation');
  backBtn.innerHTML = ICON.back;
  const headTitle = el('span', 'chat-head-title', 'Chat');
  head.append(backBtn, headTitle);

  /* empty state */
  const empty = el('div', 'chat-empty');
  empty.append(el('h2', 'chat-greeting', 'Hey, I’m Ujwal. What can I help you with?'));
  const tryLabel = el('p', 'chat-try', 'Try one of these questions');
  const chips = el('div', 'chat-chips');
  empty.append(tryLabel, chips);

  /* transcript */
  const log = el('div', 'chat-log');
  log.hidden = true;
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');
  log.setAttribute('aria-relevant', 'additions text');

  /* footer */
  const foot = el('div', 'chat-foot');

  const composer = el('form', 'chat-composer');
  const plusBtn = el('button', 'chat-plus');
  plusBtn.type = 'button';
  plusBtn.setAttribute('aria-label', 'Show example questions');
  plusBtn.setAttribute('aria-expanded', 'true');
  plusBtn.setAttribute('aria-controls', 'chat-chips');
  plusBtn.innerHTML = ICON.plus;
  const input = el('textarea', 'chat-input');
  input.rows = 1;
  input.placeholder = 'Ask a question';
  input.setAttribute('aria-label', 'Your question');
  const sendBtn = el('button', 'chat-send');
  sendBtn.type = 'submit';
  sendBtn.setAttribute('aria-label', 'Send');
  sendBtn.innerHTML = ICON.send;
  const stopBtn = el('button', 'chat-stop', 'Stop');
  stopBtn.type = 'button';
  stopBtn.hidden = true;
  composer.append(plusBtn, input, stopBtn, sendBtn);

  const note = el(
    'p',
    'chat-note',
    'Static agent — no language model, so it can be wrong. Answers come from this site; nothing you type is sent anywhere.',
  );

  panel.append(head, empty, log, foot);
  if (isPage) foot.append(composer, note);
  shell.append(...(isPage ? [panel] : [scrim, launcher, panel]));
  root.append(shell);

  /* ------------------------------------------------------------------ state */
  /** One composer, two homes: under the greeting when empty, in the footer once talking. */
  function renderState(): void {
    const talking = turns.length > 0;
    empty.hidden = talking;
    log.hidden = !talking;
    head.hidden = !talking;
    if (talking) foot.prepend(composer);
    else empty.insertBefore(composer, tryLabel);
  }

  function scroll(): void {
    log.scrollTop = log.scrollHeight;
  }

  function stopReveal(): void {
    if (revealTimer != null) {
      window.clearTimeout(revealTimer);
      window.clearInterval(revealTimer);
      revealTimer = null;
    }
    log.querySelectorAll('.chat-dots').forEach((n) => n.parentElement?.remove());
    log.querySelectorAll('.chat-answer-prose.is-typing').forEach((n) => n.classList.remove('is-typing'));
    stopBtn.hidden = true;
    sendBtn.disabled = false;
  }

  /* ---------------------------------------------------------------- render */
  function renderChips(): void {
    chips.textContent = '';
    for (const s of SUGGESTIONS.slice(0, 5)) {
      const b = el('button', 'chat-chip');
      b.type = 'button';
      b.innerHTML = ICON.diamond;
      b.append(el('span', null, s.label));
      b.addEventListener('click', () => {
        input.value = s.ask;
        composer.requestSubmit();
      });
      chips.append(b);
    }
  }

  /** Command rows sit under the suggestions — overlay only, so /chat stays plain. */
  function renderCommands(): void {
    if (isPage) return;
    const wrap = el('div', 'chat-commands');
    wrap.id = 'chat-commands-list';
    wrap.append(el('p', 'chat-commands-label', 'Commands'));
    for (const c of COMMANDS) {
      const row = el(c.ask ? 'button' : 'a', 'chat-command');
      if (c.ask) {
        (row as HTMLButtonElement).type = 'button';
        row.addEventListener('click', () => {
          input.value = c.ask as string;
          composer.requestSubmit();
        });
      } else {
        const a = row as HTMLAnchorElement;
        a.href = c.href as string;
        if (!c.href!.startsWith('/')) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
      }
      row.append(el('span', null, c.label));
      row.insertAdjacentHTML('beforeend', ICON.back.replace('<svg', '<svg style="transform:rotate(180deg)"'));
      wrap.append(row);
    }
    empty.append(wrap);
  }

  function typeInto(node: HTMLElement, text: string): void {
    stopReveal();
    node.textContent = '';
    node.classList.add('is-typing');
    let i = 0;
    stopBtn.hidden = false;
    sendBtn.disabled = true;
    revealTimer = window.setInterval(() => {
      node.textContent = text.slice(0, (i += 2));
      scroll();
      if (i >= text.length) {
        stopReveal();
        node.textContent = text;
        node.classList.remove('is-typing');
      }
    }, 12);
  }

  function showTypingDots(): HTMLElement {
    const wrap = el('article', 'chat-msg chat-msg--ai is-new');
    wrap.append(el('div', 'chat-dots', '<i></i><i></i><i></i>'));
    log.append(wrap);
    stopBtn.hidden = false;
    sendBtn.disabled = true;
    scroll();
    return wrap;
  }

  function addUser(text: string): void {
    const wrap = el('div', 'chat-msg chat-msg--you is-new');
    wrap.append(el('p', null, text));
    log.append(wrap);
    scroll();
  }

  /** Follow-up questions sit under the answer they came from, as in the reference. */
  function addFollowUps(answer: Answer): void {
    if (!answer.followUps.length) return;
    const wrap = el('div', 'chat-followups');
    for (const q of answer.followUps.slice(0, 3)) {
      const b = el('button', 'chat-chip');
      b.type = 'button';
      b.append(el('span', null, q));
      b.addEventListener('click', () => {
        input.value = q;
        composer.requestSubmit();
      });
      wrap.append(b);
    }
    log.append(wrap);
    scroll();
  }

  function addAgent(answer: Answer, opts: { animate?: boolean } = {}): HTMLElement {
    const wrap = el('article', `chat-msg chat-msg--ai${opts.animate ? ' is-new' : ''}`);
    wrap.append(el('h3', 'chat-answer-title', answer.title));

    const prose = el('div', 'chat-answer-prose');
    wrap.append(prose);

    if (answer.bullets.length) {
      const ul = el('ul', 'chat-bullets');
      for (const b of answer.bullets) ul.append(el('li', null, b));
      wrap.append(ul);
    }

    if (answer.citations.length) {
      const cites = el('p', 'chat-cites');
      answer.citations.forEach((c, i) => {
        if (i) cites.append(document.createTextNode(' · '));
        const a = el('a', 'chat-cite', c.label);
        a.href = c.href;
        if (c.href.startsWith('/')) a.setAttribute('aria-label', `${c.label} — opens on this site`);
        else {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        cites.append(a);
      });
      wrap.append(cites);
    }

    if (answer.grounded && answer.sources.length > 1) {
      const det = el('details', 'chat-sources');
      det.append(el('summary', null, `${answer.sources.length - 1} more page sections used`));
      const ul = el('ul');
      for (const s of answer.sources) ul.append(el('li', null, s));
      det.append(ul);
      wrap.append(det);
    }

    const actions = el('div', 'chat-actions');
    const copy = el('button', 'chat-icon-action');
    copy.type = 'button';
    copy.title = 'Copy this answer';
    copy.setAttribute('aria-label', 'Copy this answer');
    copy.innerHTML = ICON.copy;
    copy.addEventListener('click', async () => {
      const text = `${answer.title}\n\n${answer.prose}${answer.bullets.length ? `\n\n- ${answer.bullets.join('\n- ')}` : ''}`;
      try {
        await navigator.clipboard.writeText(text);
        copy.classList.add('is-done');
      } catch {
        copy.classList.add('is-failed');
      }
    });
    actions.append(copy);

    if (answer.grounded) {
      const again = el('button', 'chat-text-action', 'Another phrasing');
      again.type = 'button';
      again.title = 'Same facts, reworded — nothing is generated';
      again.addEventListener('click', () => {
        const last = turns[turns.length - 1];
        if (!last) return;
        variantIndex += 1;
        const next = compose(search(last.q, { scope }), variantIndex);
        turns[turns.length - 1] = { q: last.q, a: next };
        wrap.remove();
        addAgent(next, { animate: true });
      });
      actions.append(again);
    }
    if (answer.contact || !answer.grounded) {
      const mail = el('a', 'chat-text-action', 'Email me instead');
      mail.href = `mailto:${PROFILE.email}`;
      actions.append(mail);
    }
    wrap.append(actions);

    log.append(wrap);
    addFollowUps(answer);
    scroll();

    if (opts.animate) typeInto(prose, answer.prose);
    else prose.textContent = answer.prose;
    return wrap;
  }

  /* ---------------------------------------------------------- draft-email flow */
  function wantsDraft(q: string): boolean {
    const t = q.toLowerCase();
    return DRAFT_INTENTS.some((d) => t.includes(d));
  }

  function draftFlow(node: HTMLElement): void {
    const band = el('div', 'chat-band');
    band.append(el('span', 'chat-band-label', 'Before I draft this'));
    const ol = el('ol', 'chat-plan');
    for (const step of [
      'Summarise who you are and why you are emailing',
      'Draft it in your own tone — you edit every word',
      'Nothing is sent from here; you send it yourself',
    ]) {
      ol.append(el('li', null, step));
    }
    band.append(ol);

    const row = el('div', 'chat-actions');
    const confirm = el('button', 'chat-text-action', 'Draft it');
    confirm.type = 'button';
    const cancel = el('button', 'chat-text-action', 'Cancel');
    cancel.type = 'button';
    row.append(confirm, cancel);

    const editor = el('div', 'chat-editor');
    editor.hidden = true;
    band.append(row, editor);
    node.append(band);

    cancel.addEventListener('click', () => band.remove());

    confirm.addEventListener('click', () => {
      row.remove();
      const body = el('textarea', 'chat-draft-text');
      body.value =
        'Subject: Quick question about your BA work\n\nHi Ujwal,\n\nI came across your portfolio and I am trying to understand how you work.\n\n[One or two lines on who you are and what you are hiring for.]\n\nThe part I would most like to hear about is [a decision you made, a trade-off you navigated, or how you run a client conversation].\n\nIf you have 20 minutes, would [two times that suit you] work?\n\nThanks,\n[Your name]';
      const send = el('a', 'chat-text-action', 'Open in your mail app');
      send.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent('Quick question about your BA work')}&body=${encodeURIComponent(body.value)}`;
      const hint = el('p', 'chat-band-note', 'Draft only. Nothing is sent until you press send in your own mail app.');
      editor.append(body, send, hint);
      editor.hidden = false;
    });
  }

  /* ------------------------------------------------------------- answering */
  function ask(question: string): void {
    const q = question.trim();
    if (!q) return;
    addUser(q);

    if (wantsDraft(q)) {
      renderState();
      const wrap = el('article', 'chat-msg chat-msg--ai is-new');
      wrap.append(el('h3', 'chat-answer-title', 'Drafting an intro email'));
      const prose = el('div', 'chat-answer-prose');
      prose.textContent = 'I can lay out the draft. Nothing is sent from here — you review it and send it yourself.';
      wrap.append(prose);
      log.append(wrap);
      scroll();
      draftFlow(wrap);
      return;
    }

    const answer = compose(search(q, { scope }), variantIndex);

    // Belt-and-braces: never emit a withheld name, even if the knowledge base drifts.
    const payload = `${answer.title} ${answer.prose} ${answer.bullets.join(' ')}`;
    if (leaks(payload).length) {
      addAgent(compose([], 0));
      return;
    }

    turns.push({ q, a: answer });
    renderState();

    if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
      addAgent(answer);
      return;
    }

    const dots = showTypingDots();
    revealTimer = window.setTimeout(() => {
      if (revealTimer != null) window.clearTimeout(revealTimer);
      dots.remove();
      addAgent(answer, { animate: true });
    }, 400);
  }

  /* ----------------------------------------------------------------- wiring */
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

  plusBtn.addEventListener('click', () => {
    const on = chips.hidden;
    chips.hidden = !on;
    tryLabel.hidden = !on;
    plusBtn.setAttribute('aria-expanded', String(on));
  });

  stopBtn.addEventListener('click', () => {
    const last = turns[turns.length - 1];
    stopReveal();
    if (!last) return;
    const prose = log.querySelector('.chat-msg--ai:last-child .chat-answer-prose');
    if (prose) prose.textContent = last.a.prose;
    else addAgent(last.a);
    scroll();
  });

  backBtn.addEventListener('click', () => {
    stopReveal();
    turns = [];
    variantIndex = 0;
    log.textContent = '';
    renderState();
    input.focus({ preventScroll: true });
  });

  function setOpen(open: boolean): void {
    shell.dataset.open = String(open);
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    launcher.classList.remove('is-idle');
    if (open) {
      window.setTimeout(() => {
        scroll();
        input.focus({ preventScroll: true });
      }, 60);
    } else {
      stopReveal();
    }
  }

  scrim.addEventListener('click', () => setOpen(false));
  launcher.addEventListener('click', () => setOpen(shell.dataset.open !== 'true'));

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !isPage && shell.dataset.open === 'true') {
      setOpen(false);
      launcher.focus({ preventScroll: true });
      return;
    }
    if (e.key === 'Tab' && !isPage && shell.dataset.open === 'true') {
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

  renderChips();
  renderCommands();
  renderState();
  shell.dataset.open = isPage ? 'true' : 'false';
  if (isPage) {
    foot.append(composer, note);
    document.title = 'Chat · Ujwal Ramesh Karajgikar';
    window.setTimeout(() => input.focus({ preventScroll: true }), 40);
  } else {
    // One gentle hint that the launcher is there, then never again.
    if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
      window.setTimeout(() => {
        if (shell.dataset.open === 'false') launcher.classList.add('is-idle');
      }, 6000);
    }
  }
}