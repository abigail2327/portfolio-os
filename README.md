# Portfolio OS

A gamified portfolio site — a desktop OS simulation in the browser, inspired by
[daedalOS](https://github.com/DustinBrett/daedalOS), themed with a personal
Game Boy Color twist.

## Features

- Full window manager: drag, resize, minimize/maximize, taskbar, Start Menu
- File Explorer with projects synced live from the [GitHub API](https://github.com/abigail2327)
- Project viewer that renders each repo's actual README as formatted markdown
- About Me app with real bio, background, and a travel photo gallery
- A Game Boy Color-styled app hosting three original mini-games (STAX, Ember & Tide, Barrel Bound)
- Original Paint app with real drawing tools (pencil, fill, shapes, eyedropper)
- Settings app (wallpaper picker, audio toggle, reset), persisted per-visitor via localStorage
- Terminal easter egg
- Keyboard shortcuts (Alt+Tab window cycling, Escape to close)
- Full touch/mobile support

## Tech stack

React, Vite, Zustand, Framer Motion, Web Audio API synthesis for chiptune SFX,
`marked` + `DOMPurify` for safe README rendering.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs a static build to `dist/` — deployable to any static host (Vercel, Netlify, GitHub Pages).

## Security notes

- All rendered README markdown is sanitized with DOMPurify before injection
- Security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy) are set via `vercel.json`
- No secrets or API keys are used — GitHub API calls are unauthenticated public reads with a static-data fallback if rate-limited
- `npm audit` reports zero known vulnerabilities as of the last dependency update
