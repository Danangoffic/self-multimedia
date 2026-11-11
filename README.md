# Self Multimedia - Personal Entertainment Center

Next.js custom client for Jellyfin media server.

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env.local` and set your Jellyfin URL
3. Install dependencies:
   ```bash
   npm install
   # or pnpm install
   ```
4. Run development server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000

## Features

- Login to Jellyfin server
- Display libraries
- Show recently added items
- Modern dark UI

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS (optional styling)

## Notes

This is a custom frontend client. Jellyfin server must be running separately (default port 8096).
