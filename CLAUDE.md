# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development
npm start                  # Expo dev server
npm run ios                # Run on iOS simulator
npm run android            # Run on Android emulator
npm run web                # Run in browser

# With dev client (after native build)
npm run start:client

# Type checking & linting
npm run ts:check           # tsc --noEmit
npm run lint               # expo lint

# EAS builds
npm run build:dev          # Development build (iOS)
npm run build:ios-simulator
```

Convex backend runs separately — start it with `npx convex dev` (watches `/convex/` and pushes schema/function changes).

## Architecture

### Routing (`/src/app/`)

Expo Router file-based routing. The root `_layout.tsx` wraps everything in `ConvexAuthProvider` and branches on auth state (Authenticated/Unauthenticated). Main structure:

- `(tabs)/` — Home (groups+DMs), Plans, Chats, Settings
- `group/[id]/(tabs)/` — Per-group tabs: overview, chat, plans
- Modals: `AddGroup`, `JoinGroup`, `NewChat`, `AddPlan`, `plans/[id]`, `chats/[id]`

### Backend (`/convex/`)

All backend logic lives here as Convex queries/mutations. Key files:

- `schema.ts` — Source of truth for all table definitions and indexes
- `groups.ts`, `plans.ts`, `chat.ts`, `conversations.ts`, `users.ts` — Domain modules
- `push.ts` — Push notification delivery (called from mutations, not directly)
- `_generated/` — Auto-generated types; never edit manually

### Data Model

- `groups` + `groupMembers` (join table) — many-to-many groups/users
- `conversations` — unified table for both group chats (`type: "group"`) and DMs (`type: "dm"`); DMs use a `dmKey` (lexicographically sorted user IDs) to prevent duplicates
- `conversationMembers` — DM membership join table
- `chat` — messages with reactions, tied to a conversation
- `plans` — plans within groups, with attendees
- `pushTokens` — indexed by `token` and `userId` for O(1) lookups

### Key Patterns

- **Convex queries in components**: `useQuery(api.module.functionName)` — reactive, auto-updates
- **Auth**: `getAuthUserId(ctx)` from `@convex-dev/auth/server` in every mutation/query that needs the current user
- **Platform storage**: SecureStore on native, localStorage on web — configured in root `_layout.tsx`
- **Path alias**: `@/*` maps to the repo root (e.g. `@/lib/...`, `@/convex/...`)
- **App variants**: `APP_VARIANT` env var distinguishes development/preview/production builds (bundle IDs differ)

The native tabs are of liquid glass ios26 type of tabs.

### Environment Variables

See `.env.example`. Required: `CONVEX_DEPLOYMENT`, `EXPO_PUBLIC_CONVEX_URL`. The `EXPO_PUBLIC_` prefix makes vars available client-side.
