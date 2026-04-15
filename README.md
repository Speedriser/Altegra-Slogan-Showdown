# Altegra · Slogan Showdown

A real-time multiplayer bracket tournament for picking the best company tagline.
Built for ~15-person teams on a video call: host creates a room, everyone
submits a couple of slogans anonymously, a single-elimination bracket is
generated, and the room votes round by round until one slogan wins.

- **Stack** — Vite + React + TypeScript + Tailwind CSS + Framer Motion
- **Backend** — Firebase Realtime Database (no custom server)
- **Auth** — Anonymous (stable per-device IDs, zero login friction)
- **Deploy** — Static site on Vercel

## Setup

### 1. Create a Firebase project

1. Go to <https://console.firebase.google.com> and create a new project.
2. In **Build → Authentication → Sign-in method**, enable **Anonymous**.
3. In **Build → Realtime Database**, create a database (pick the region
   closest to your users, e.g. `us-central1`).
4. Open **Project settings → General → Your apps**, register a Web app, and
   copy the config values into a local `.env` file (start from
   `.env.example`):

   ```bash
   cp .env.example .env
   ```

   Fill in every `VITE_FIREBASE_*` value. `VITE_FIREBASE_DATABASE_URL`
   usually looks like `https://<project-id>-default-rtdb.<region>.firebasedatabase.app`.

### 2. Apply the security rules

Copy the contents of [`database.rules.json`](./database.rules.json) into
the **Realtime Database → Rules** tab of the Firebase console, or deploy
them with the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use <your-project-id>
firebase deploy --only database
```

The rules allow anonymous read/write on `rooms/*` (so the app works with
no backend) but validate every field's shape — room codes are 4 uppercase
letters from a safe alphabet, slogans are ≤ 80 chars, names ≤ 30 chars,
and the `phase` field is restricted to the five valid states.

### 3. Install and run

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. To test multiplayer on your machine, open
a second browser window (or a private tab) and join with the room code
shown on the host screen.

### 4. Deploy to Vercel

The app is a pure static SPA — any Vite-compatible host works.

1. Push this repo to GitHub.
2. Import the repo in Vercel (framework preset: **Vite**).
3. Add the seven `VITE_FIREBASE_*` environment variables in
   **Project → Settings → Environment Variables**.
4. Deploy. Vercel will run `npm run build` and serve `dist/`.

The included [`vercel.json`](./vercel.json) rewrites all routes to `/`
so deep-links like `/?r=ABCD` resolve to the SPA.

## Game flow (host cheat-sheet)

1. **Lobby** — share the room code or link. Hit *Start submissions* once
   the team is in.
2. **Submissions** — each player can post as many slogans as they like
   (max 80 chars each). Counter shows progress. Host closes submissions
   when ready.
3. **Bracket preview** — the app shuffles submissions into a
   single-elimination bracket (top seeds get byes if the count isn't a
   power of 2). Host presses *Begin next matchup* to start voting.
4. **Voting** — one matchup at a time, shown to everyone. Live vote bars
   update as each person taps a card. No timer — the host watches the
   "X of Y voted" counter and presses *Close voting* when the room is
   ready. Winner is decided by majority; ties go to the left slot
   (already shuffled). Host then presses *Begin next matchup* to advance.
5. **Winner** — confetti, the winning slogan huge on screen, author
   revealed after a beat, then the full tournament recap.

## Project layout

```
src/
├── App.tsx                # phase router + AnimatePresence
├── firebase.ts            # initializeApp, getDatabase, signInAnon
├── types.ts               # Room, Player, Submission, Bracket types
├── components/            # one file per screen/widget
├── hooks/                 # useRoom, usePlayer
└── lib/                   # bracket logic, code generation, storage, rtdb
```

## Notes & limitations

- **Reconnect** — a player's `{code, uid, name}` is stored in
  `localStorage`. Refreshing reconnects silently. Close the tab for a long
  time and Firebase will also mark them `online: false` via
  `onDisconnect`.
- **Host-paced voting** — there is no countdown timer. The host closes
  voting manually when the room has had enough time to read and decide.
  This is important because groups over ~10 need a real beat to consider
  both options, and the host can see the live vote counter to judge
  when the room has settled.
- **Host disconnects** — this is a 15-person office game, not a public
  service. If the host closes their tab mid-round, the room will pause
  on the current matchup. Another player can rejoin as themselves via
  the code; a full host-handoff flow is out of scope.
- **Security** — rules enforce shape validation but, as requested, allow
  anyone with a room code to read/write. Don't use this for anything
  sensitive.

## License

MIT — have fun.
