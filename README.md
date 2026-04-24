# FlowDesk

Mobile-first freelance management app built with Expo (React Native) + Supabase. Manage your kanban board, finances, and client CRM — all in one dark-themed app.

---

## Features

- **Kanban Board** — 4 default columns (Por hacer / En proceso / COBROS / Entregado) with drag-to-reorder, color tags, priority label banners, and a "¿Cobrado?" prompt when moving tasks to Entregado
- **Finances Dashboard** — monthly summary cards, income/expense lists, 6-month bar chart, and credit card tracker with installment breakdown
- **Client CRM** — searchable client list with WhatsApp quick-link, linked tasks, and income history

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 51 + Expo Router v3 |
| Language | TypeScript (strict) |
| Styling | NativeWind v4 (Tailwind CSS) |
| Animation | React Native Reanimated 3 |
| Backend | Supabase (auth + postgres + realtime + RLS) |
| Icons | Lucide React Native |
| Fonts | DM Sans via @expo-google-fonts |

---

## Prerequisites

- Node.js 18+
- Expo CLI (`npm i -g expo-cli`)
- EAS CLI (`npm i -g eas-cli`) — for builds
- A Supabase project (free tier works)

---

## Environment Variables

Create a `.env.local` file in the project root (never commit this):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase dashboard → Settings → API.

---

## Database Setup

1. Open your Supabase project's SQL editor
2. Copy the contents of `supabase/migrations/001_initial.sql`
3. Run the SQL — it creates all tables, RLS policies, and triggers

---

## Running Locally

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

---

## Building with EAS

### First-time setup

```bash
eas login
eas build:configure
```

Update `app.json` → `expo.extra.eas.projectId` with your EAS project ID.

### Build commands

```bash
# iOS (requires Apple Developer account)
npm run build:ios

# Android APK/AAB
npm run build:android

# Both platforms
npm run build:all
```

### Submit to stores

```bash
npm run submit:ios
```

---

## Project Structure

```
app/
├── (auth)/          Login & Register screens
├── (tabs)/          Kanban, Finances, Clients tabs
├── modals/          Bottom-sheet modals
└── _layout.tsx      Root layout with auth guard

components/
├── kanban/          Board, Column, TaskCard, PriorityLabel
├── finance/         SummaryCards, Lists, CreditCardTracker
└── ui/              Button, Input, Badge, Card, Modal

lib/
├── supabase.ts      Supabase client
├── hooks/           useTasks, useColumns, useFinances, useClients
└── utils/           formatCurrency, dates

supabase/
└── migrations/      001_initial.sql — full schema with RLS
```

---

## Design System

Dark theme throughout. Colors defined in `constants/theme.ts`:

| Token | Value |
|---|---|
| `bg` | `#0f0f14` |
| `surface` | `#1a1a24` |
| `accent` | `#00d4ff` |
| `success` | `#22c55e` |
| `warning` | `#f59e0b` |
| `danger` | `#ef4444` |

Font: **DM Sans** (Regular 400 / Medium 500 / Bold 700)

---

## App Store Configuration

- **Bundle ID (iOS):** `com.flowdesk.app`
- **Package (Android):** `com.flowdesk.app`
- **iOS Deployment Target:** 15.0+
- **Orientation:** Portrait only
- **Status bar:** Light content on dark background

---

## Contributing

1. Fork and clone
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test on simulator
4. Submit a PR with a clear description
