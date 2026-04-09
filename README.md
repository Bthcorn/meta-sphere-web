# Metasphere

A virtual co-working platform that brings remote teams together in a shared 3D campus. Move your avatar around, see who's online, drop into meeting rooms, and collaborate in real time — no scheduling required.

## Features

- **3D Virtual Campus** — Navigate a persistent shared space with a common room and library zone using WASD controls
- **Avatar Customization** — Personalize skin color, shirt, glasses, and hat
- **Meeting Rooms** — Dedicated spaces with voice chat, a collaborative whiteboard, screen sharing, and file sharing
- **Real-time Chat** — Zone and session-scoped messaging with typing indicators and reactions
- **Spatial Audio** — Voice volume adjusts based on avatar proximity via LiveKit
- **Friends & Presence** — Friend requests, online/offline status, and live session invites

## Tech Stack

| Category      | Libraries                           |
| ------------- | ----------------------------------- |
| Framework     | React 19, TypeScript, Vite          |
| Routing       | TanStack Router (file-based)        |
| 3D / Physics  | Three.js, React Three Fiber, Rapier |
| Real-time     | Socket.io, LiveKit                  |
| State         | Zustand                             |
| Data Fetching | TanStack Query, Axios               |
| Forms         | React Hook Form, Zod                |
| Styling       | Tailwind CSS v4, shadcn/ui          |
| Testing       | Vitest, Testing Library             |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run with coverage
pnpm test:coverage

# Open Vitest UI
pnpm test:ui
```

## Project Structure

```
src/
├── api/          # API client functions
├── components/   # UI and 3D scene components
│   ├── meta-sphere-3d/   # 3D scene (avatars, particles, connections)
│   ├── space/            # Campus and zone scenes
│   ├── whiteboard/       # Collaborative whiteboard
│   ├── chat/             # Chat UI
│   ├── friend/           # Friends panel
│   └── avatar/           # Avatar customization
├── hooks/        # Custom React hooks
├── lib/          # Utility functions
├── routes/       # File-based routes (TanStack Router)
├── store/        # Zustand stores
└── types/        # TypeScript types
```

## Code Quality

Linting and formatting run automatically on staged files via Husky + lint-staged:

```bash
pnpm lint
```
