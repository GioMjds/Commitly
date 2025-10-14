# Commitly — Track your daily progress with automated GitHub sync

Commitly is a small productivity app built with Expo + React Native that helps you track daily "commits" (tasks/mini-retros) and optionally syncs coding activity from GitHub into daily commit entries.

This repository contains the mobile app and client-side logic. It integrates with Firebase (Realtime Database + Firestore) for user data, settings, and syncing.

Highlights

- File-based Expo Router (app/ directory)
- GitHub sync with SHA-based duplicate detection
- "Call it a Day" flow to mark a day complete (with optional automatic GitHub sync)
- Light/dark theming and local stores for auth, commits, and theme

## Quick start

Prerequisites

- Node.js (16+ recommended)
- npm or yarn
- Expo CLI (optional but useful): `npm install -g expo-cli`

1) Install dependencies

```powershell
npm install
```

2) Start the dev server

```powershell
npx expo start
```

Open the project in Expo Go, a simulator, or a development build.

3) Environment

Create a `.env` file (the repo contains `.env` used for development). Key variables used by the app:

- EXPO_PUBLIC_FIREBASE_API_KEY
- EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
- EXPO_PUBLIC_FIREBASE_PROJECT_ID
- EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
- EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- EXPO_PUBLIC_FIREBASE_APP_ID
- EXPO_PUBLIC_FIREBASE_DATABASE_URL
- EXPO_PUBLIC_GITHUB_CLIENT_ID
- EXPO_PUBLIC_GITHUB_CLIENT_SECRET
- EXPO_PUBLIC_GITHUB_CALLBACK_URL

The project uses `configs/firebase.ts` to initialize Firebase using these values.

## Project structure (important files)

- `app/` — Expo Router pages and screens
  - `(screens)/commits.tsx` — Commits screen, Call it a Day button and UI
  - `(screens)/index.tsx` — Dashboard
- `hooks/` — Custom hooks
  - `useCallItADay.tsx` — Contains `callItADay()`, `canCallItADay()` and a testing `resetCallItADay()` function
  - `useGithubCommits.tsx` — GitHub sync logic (fetches commits, dedupes by SHA, creates/updates daily commit entries)
  - `useCommit.tsx` — Local commit management and fetch logic
  - `useAuth.tsx` — Authentication helpers
- `store/` — Zustand/other stores for `AuthStore`, `CommitStore`, `ThemeStore`
- `types/` — Shared TypeScript types (`Commit.types.ts`, `GithubSettings.types.ts`, ...)
- `configs/firebase.ts` — Firebase initialization (Realtime DB + Firestore)

## How GitHub sync works (important)

1. `useGithubCommits.syncGithubCommits()` does the heavy lifting:
    - Reads the user's GitHub token (SecureStore)
    - Fetches recent commits using the GitHub API (a 7-day lookback is used)
    - Uses SHA-based deduplication by checking Firestore existing commits' `githubCommits` SHAs
    - Creates or updates daily commit documents in Firestore. If a commit for a date already exists, new GitHub commits for that date are appended.

2. Why 7 days? GitHub's search API may take a few minutes to index new pushes. The app uses a 7-day window to reduce missed commits due to indexing delays.

3. Important limitation: GitHub search/indexing can be delayed (5–10 minutes). If you push and immediately try to sync, the new commit may not appear yet. Possible mitigations:

- Add UI messaging to tell users to wait a minute after pushing
- Provide a manual "Sync Now" button

## "Call it a Day" flow

- When the user taps "Call it a Day":
   1. If signed in with GitHub, the app attempts a GitHub sync first
   2. It then writes a `callItADay` status for the user in Realtime Database with `lastCalledDate`
   3. The button is disabled for the rest of the day (based on local date comparison)

For testing there's a temporary `resetCallItADay()` helper and a small refresh icon added to the "Day Complete" banner that clears the status (remove before production).

## Resetting & testing

- Quick manual reset (client): On the Commits screen, when the "Day Complete" banner is visible there's a small refresh icon — tapping that will call `resetCallItADay()` and allow you to re-test the Call it a Day flow.
- Scripted reset (server-side): You can also reset via an admin script using Firebase Admin SDK by clearing `users/{uid}/callItADay`.

Example reset script (not committed with service-account in repo):

```powershell
# node scripts/resetCallItADay.js
# Edit the script to set USER_ID and point to your service account key
node scripts/resetCallItADay.js
```

## Troubleshooting

- If GitHub sync shows no new commits but you have pushed recently, wait 5–10 minutes and try again. The GitHub index can be delayed.
- Use the app logs (React Native console) — `useGithubCommits` now logs fetched commits, SHAs, and duplicate checks.
- If the Call it a Day button appears disabled even after reset, ensure you are logged in and that your Realtime Database rules allow the operation.

## Developer notes

- Lint / Type checking: this is a TypeScript project — run your editor's TypeScript checks and `npm run lint` if configured.
- Tests: There are no unit tests at the moment. Adding tests for `useGithubCommits` and `useCallItADay` is a high-value next step.

## Contributing

If you'd like to contribute:

1. Fork the repo and create a feature branch
2. Run the app locally and reproduce the issue or feature
3. Open a PR with a clear description and testing steps

## Notes before production

- Remove the `resetCallItADay()` helper and the test-only refresh UI element
- Reduce verbose debug logs to only warnings/errors in production
- Consider rate-limiting sync calls and exposing a manual sync control for users

---

If you want, I can also generate a short CONTRIBUTING.md, or add a dedicated troubleshooting page that lists the exact console messages and what they mean. Which would you prefer next?
