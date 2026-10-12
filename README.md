# Folio — BA × Design Engineer portfolio

Astro static site. Deploys to Vercel with no backend.

## Routes
- `/` — hero + work grid (from `src/content/work/*.mdx`)
- `/work/horizon` — Horizon case study (content collection)
- `/about` — skills matrix derived from Horizon meta
- `#contact` — footer on all pages (mailto only in v1)

## Add work (broad now, deep later)
Add `src/content/work/my-study.mdx` with frontmatter:
```md
---
title: "Title"
summary: "One-liner"
date: "2026"
role: "BA / PO"
tags: ["BA"]
---
```
It appears on home + gets `/work/my-study` via `src/pages/work/[...slug].astro`. No layout rework.

## Dev
```bash
npm install
npm run dev
npm run build
```

## Vercel
- New project from `folio/` dir
- Build: `npm run build`, output `dist/`
- `vercel.json` uses cleanUrls. No env vars.

## TODO before publish
- Replace `hello@example.com` in `Base.astro` + `about.astro`
- Add LinkedIn/GitHub URLs in footer
- Swap `.ph` placeholders in `horizon.mdx` for images
- Verify: monthly cost, quote permission, payment reasons, security figures, dates
- Add `public/resume.pdf` + link on About
- Add `public/og.png` + set in Base if needed
