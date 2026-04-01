# YOUR_SHA256_HASH_HERE
<!-- Replace the line above with: echo -n "YOUR_GITHUB_USERNAME" | sha256sum -->

# 📝 Notely – Notes App

> **Frontend Internship Take-Home Challenge**

🔗 **Live Demo:** [https://YOUR_USERNAME.github.io/notes-app](https://YOUR_USERNAME.github.io/notes-app)  
🐙 **GitHub:** [https://github.com/YOUR_USERNAME/notes-app](https://github.com/YOUR_USERNAME/notes-app)

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and add your mockapi.io URL
cp .env.example .env
# Edit .env → set VITE_API_BASE_URL=https://YOUR_PROJECT.mockapi.io/api/v1

# 3. Dev server
npm run dev

# 4. Build for production
npm run build

# 5. Lint
npm run lint

# 6. Type-check
npm run check
```

## 🌐 Deploying

The project uses `@sveltejs/adapter-static` and can be deployed to any static host.

**GitHub Pages:**
```bash
npm run build
# Push the `build/` folder to the `gh-pages` branch
```

**Vercel / Netlify:** Connect your repo and set the build command to `npm run build` and publish directory to `build`.

---

## 🧭 Approach

I structured the project around three concerns:

1. **API layer** (`src/lib/api/notes.ts`) — a single, typed wrapper module so all fetch calls live in one place. Swapping the backend means touching one file.

2. **State as stores** — `theme.ts`, `offline.ts`, and `toast.ts` are tiny Svelte stores that handle cross-cutting concerns (dark mode persistence, offline queueing, toast notifications) without prop-drilling.

3. **Optimistic UI everywhere** — create, edit, delete, and pin all update local state immediately before the API call resolves, giving instant feedback. Failures roll back to the previous state.

---

## 💡 Additional Feature: Note Pinning

I added the ability to pin notes so they always float to the top of the list, regardless of the active sort order. Pinned notes are visually distinguished with a 📌 badge and can be toggled via a button on each card.

**Why:** In a real notes app, users often have a small set of "always-relevant" notes (a grocery list, a daily standup template). Pinning is the simplest way to surface them without building a full folder/tag system.

The `pinned` field is stored on the note resource in mockapi and synced via `PUT /notes/:id`.

---

## ⚖️ Trade-offs & Assumptions

- **mockapi.io `search` param** – mockapi's built-in `search` filters on all string fields. I limit this to the title via UI labelling; a real backend would expose a `title_like` query param.
- **Offline queue** – pending ops are replayed in order on reconnect, but there's no conflict resolution. If two sessions edit the same note while offline, last-write-wins.
- **Soft delete timeout** – the 10-second undo window uses `setTimeout` in the browser. If the user refreshes during that window, the deletion runs immediately on next load (the pending-op queue fires). This is acceptable for the scope of the challenge.
- **Static adapter** – using `adapter-static` + `fallback: '404.html'` means the 404 page is served by the host for unknown routes. This requires the host to support custom 404 pages (GitHub Pages, Netlify, Vercel all do).

---

## 📦 Additional Dependencies

| Package | Reason |
|---|---|
| `@sveltejs/adapter-static` | Deploy to GitHub Pages / Netlify / Vercel as a static site |

All other packages (`svelte`, `sveltekit`, `tailwindcss`, `typescript`, `eslint`) are per the challenge requirements.

---

## 🔮 What I'd Do With More Time

- **Tests** — add Vitest unit tests for the API wrapper and Playwright e2e tests for the CRUD flows
- **Optimistic conflict resolution** — detect version mismatches when syncing offline ops
- **Rich text content** — integrate a lightweight editor (e.g. tiptap) for formatted notes
- **Tags / folders** — a tagging system for organising notes beyond pinning
- **PWA** — add a service worker so the app is installable and works fully offline without any network at all

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+N` / `⌘N` | Open "New Note" modal |
| `Esc` | Close any open modal |
