#  REEL Cinema — High-Throughput Real-Time Cinema Ticketing Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-14.9-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**REEL** is an enterprise-grade, high-concurrency cinema ticket booking engine and client application. Engineered to withstand high-volume box office traffic surges ("ticket drops"), the platform features distributed atomic seat locking with Redis, unidirectional real-time state synchronization via Server-Sent Events (SSE), payment idempotency handling, and an immersive, micro-UX-driven cinematic interface with 3D gestural card decks.

---

##  Table of Contents

1. [System Architecture & Engineering Design](#-system-architecture--engineering-design)
   - [High-Level System Topology](#high-level-system-topology)
   - [Distributed Concurrency & Seat Locking (`SETNX`)](#distributed-concurrency--seat-locking-setnx)
   - [Real-Time Seat Status Broadcast (Redis Pub/Sub + SSE)](#real-time-seat-status-broadcast-redis-pubsub--sse)
   - [Relational Data Modeling (PostgreSQL ACID Compliance)](#relational-data-modeling-postgresql-acid-compliance)
   - [Payment Webhook & Idempotency Strategy](#payment-webhook--idempotency-strategy)
   - [Frontend Micro-UX Patterns](#frontend-micro-ux-patterns)
   - [Cinematic Design System & Theme Foundations](#cinematic-design-system--theme-foundations)
2. [End-to-End Walkthrough & User Journey](#-end-to-end-walkthrough--user-journey)
   - [Page 1: Landing Premiere & 3D Stacked Card Deck](#page-1-landing-premiere--3d-stacked-card-deck)
   - [Page 2: Movie Discovery & Catalog Matrix](#page-2-movie-discovery--catalog-matrix)
   - [Page 3: Show Selection Matrix](#page-3-show-selection-matrix)
   - [Page 4: Real-Time Seat Selection Grid](#page-4-real-time-seat-selection-grid)
   - [Page 5: Payment Dispatch & Digital Pass](#page-5-payment-dispatch--digital-pass)
3. [Repository Directory Structure](#-repository-directory-structure)
4. [Getting Started & Local Setup](#-getting-started--local-setup)
   - [Prerequisites](#prerequisites)
   - [Client Setup (Frontend)](#client-setup-frontend)
   - [Server Setup (Backend)](#server-setup-backend)
   - [Environment Variables](#environment-variables)
   - [Production Build & Typecheck](#production-build--typecheck)
5. [Contribution Guidelines & Engineering Principles](#-contribution-guidelines--engineering-principles)
   - [Karpathy Engineering Principles](#karpathy-engineering-principles)
   - [Git Branching & Workflow](#git-branching--workflow)
   - [Conventional Commits Specification](#conventional-commits-specification)
   - [Pull Request Checklist](#pull-request-checklist)

---

##  System Architecture & Engineering Design

### High-Level System Topology

```mermaid
flowchart TD
    subgraph Clients["Active Clients"]
        U1["User 1 (Active Booker)"]
        U2["User 2..N (Browsing Seat Map)"]
    end

    subgraph CDN_Gateway["Edge & Load Balancer"]
        Edge["CDN / Reverse Proxy (Static Asset & Catalog Caching)"]
    end

    subgraph AppCluster["API Application Cluster (Node.js / Express)"]
        API1["API Node A"]
        API2["API Node B"]
    end

    subgraph InMem["In-Memory Concurrency Layer (Redis Cluster)"]
        LockDB[("Redis Key-Value<br/>SETNX Distributed Lock<br/>TTL: 300s")]
        PubSub["Redis Pub/Sub Channel<br/>show:{id}:events"]
    end

    subgraph PersistentDB["Relational Source of Truth (PostgreSQL)"]
        PG[("PostgreSQL ACID DB<br/>Theatres, Screens, Seats,<br/>Shows, Bookings, Payments")]
    end

    Clients --> Edge
    Edge --> AppCluster

    U1 -- "POST /api/shows/{id}/hold" --> API1
    API1 -- "SETNX hold:show_{id}:seat_{id} EX 300" --> LockDB
    LockDB -- "Publish Seat Locked Event" --> PubSub
    PubSub --> API1
    PubSub --> API2

    API1 -- "SSE text/event-stream" --> U1
    API2 -- "SSE text/event-stream" --> U2

    U1 -- "POST /api/payments/checkout (Idempotency Key)" --> API1
    API1 -- "BEGIN TRANSACTION<br/>INSERT payments ON CONFLICT<br/>INSERT bookings<br/>COMMIT" --> PG
    API1 -- "DEL hold:show_{id}:seat_{id}" --> LockDB
    API1 -- "Publish Seat Booked Event" --> PubSub
```

---

### Distributed Concurrency & Seat Locking (`SETNX`)

During high-demand ticket releases, thousands of concurrent requests attempt to reserve the same optimal seats. Direct database writes under this load create database lock contention, serialized queue stalls, and double-booking bugs.

REEL isolates the primary relational database from lock contention by moving seat holding into Redis:
- **Lock Key Pattern**: `hold:show_{show_id}:seat_{seat_id}`
- **Atomic Acquisition**:
  ```bash
  SET hold:show_101:H14 user_847 NX EX 300
  ```
  - `NX`: Set only if key does not exist. Returns `OK` to the first requester; subsequent concurrent attempts immediately return `null`/`0`.
  - `EX 300`: Automatically expires after 5 minutes (300 seconds), releasing abandoned holds with zero cron-job overhead.
- **Conflict Handling**: If lock acquisition fails, the server responds with `409 Conflict`. The client uses optimistic rollback to instantly restore the seat state in the UI.

---

### Real-Time Seat Status Broadcast (Redis Pub/Sub + SSE)

Rather than having thousands of browsers poll `/api/shows/:id/seats` repeatedly, REEL pushes status updates via a unidirectional Server-Sent Events stream:
1. When any seat lock is acquired, released, or finalized, the handling API server publishes an event to Redis Pub/Sub:
   ```json
   {
     "type": "SEAT_HELD",
     "showId": "101",
     "seatId": "H14",
     "userId": "user_847"
   }
   ```
2. Every active API node subscribes to `show:{show_id}:events` and multiplexes updates down active client connections over `Content-Type: text/event-stream`.
3. Other users viewing the same seat map see seat `H14` turn to the occupied red crosshatch within milliseconds, preventing duplicate lock attempts before they even occur.

---

### Relational Data Modeling (PostgreSQL ACID Compliance)

PostgreSQL serves as the Single Source of Truth (SSOT), ensuring ACID compliance for bookings, auditability, and financial reconciliation:

```
[Theatres] 1 ──── ∞ [Screens] 1 ──── ∞ [Seats]
   │
   └── 1 ──── ∞ [Shows] 1 ──── ∞ [Bookings] 1 ──── 1 [Payments]
```

- **`theatres`**: `theatre_id` (PK), `name`, `city`, `location`
- **`screens`**: `screen_id` (PK), `theatre_id` (FK), `screen_name`, `total_seats`
- **`seats`**: `seat_id` (PK), `screen_id` (FK), `seat_number`, `row_identifier`, `seat_type` (Standard, Premium, VIP)
- **`movies`**: `movie_id` (PK), `title`, `description`, `duration_minutes`, `language`, `genre`, `backdrop_url`, `poster_url`
- **`shows`**: `show_id` (PK), `movie_id` (FK), `screen_id` (FK), `start_time`, `end_time`, `price`
- **`bookings`**: `booking_id` (PK), `user_id`, `show_id` (FK), `seat_id` (FK), `status` (`BOOKED`, `CANCELLED`), `created_at`
- **`payments`**: `payment_id` (PK), `booking_id` (FK), `idempotency_key` (UNIQUE INDEX), `amount`, `status`, `provider_transaction_id`, `created_at`

---

### Payment Webhook & Idempotency Strategy

To prevent double billing caused by payment provider network retries or accidental double-clicking:
1. The client generates a unique UUIDv4 `idempotency_key` before dispatching the payment request.
2. The transaction inserts the payment record using PostgreSQL's uniqueness constraint:
   ```sql
   INSERT INTO payments (idempotency_key, booking_id, amount, status)
   VALUES ('idemp_9f2e...', 'bk_1042', 18.50, 'SUCCESS')
   ON CONFLICT (idempotency_key) DO NOTHING;
   ```
3. If a duplicate request arrives, the server detects the conflict, avoids re-charging, and immediately returns the existing booking confirmation (`200 OK`).
4. Upon successful payment commit:
   - The booking record status is updated to `BOOKED`.
   - The temporary Redis lock `hold:show_{id}:seat_{id}` is deleted.
   - A `SEAT_BOOKED` event is published via Redis Pub/Sub to inform all active viewers.

---

### Frontend Micro-UX Patterns

The frontend implements 14 advanced micro-UX engineering patterns designed to eliminate layout shifts, provide instant feedback, and optimize mobile touch ergonomics:

| Pattern | Implementation Description |
| :--- | :--- |
| **1. Skeleton Loaders** | Pulse-animated placeholder components matching the exact geometry of movie cards, showtime pills, and seat grids to achieve zero Cumulative Layout Shift (CLS). |
| **2. Optimistic Updates** | Seats toggle to "Held by You" instantly upon touch. If the backend reports a lock conflict (`409`), the UI rolls back gracefully with an inline alert. |
| **3. Command Menu (`Cmd+K`)** | Global keyboard-driven command palette (`cmdk`) enabling keyboard navigation between movies, theaters, cities, and booking history. |
| **4. Undo Toasts** | Transient 4-second notification toasts for non-stateful user choices (e.g. deselected seat), excluded from backend-committed states. |
| **5. Pre-rendering & Prefetching** | Hovering or focusing a movie card prefetches showtime matrices; hovering a showtime pill prefetches seat map topologies before click navigation. |
| **6. Blurhash Placeholders** | Decodes compact Blurhash string previews into lightweight `<canvas>` elements before high-res movie posters load over slower networks. |
| **7. View Transitions** | Native browser View Transitions API smoothly morphs movie cards from Page 2 into the summary banner header on Page 3. |
| **8. Swipe-to-Dismiss Sheets** | Drawer overlays and auth modals (`vaul`) support responsive touch drag-to-dismiss gestures with spring dampening. |
| **9. Interruptible Animations** | Physics-based spring animations (`framer-motion`) allow immediate user interruption without locking the UI thread. |
| **10. Hit Slop ($12\text{px}$)** | Expand touchable boundaries on dense seat grid items by at least $12\text{px}$ of transparent padding to eliminate mis-taps on mobile devices. |
| **11. Safe Area Insets** | Fixed docks and sticky banners declare `padding-bottom: env(safe-area-inset-bottom)` to protect content from screen notches and gesture bars. |
| **12. Balanced Text** | All headings and titles enforce `text-wrap: balance` to prevent awkward typographic single-word line wraps. |
| **13. Continuous Corners** | Button and modal corners utilize squircle geometry matching modern native OS interface standards. |
| **14. 3D Gestural Card Deck** | Underlying stacked card carousel with physics-based drag-to-swipe, velocity detection, and dual-touch pinch-to-zoom responses. |

---

### Cinematic Design System & Theme Foundations

The visual styling is anchored in a high-contrast dark aesthetic combining deep charcoal, rich forest greens, and vivid crimson accents:

| Token / Class | Hex Code | Strategic Purpose |
| :--- | :--- | :--- |
| `--color-charcoal-deep` | `#0F1115` | Core application canvas, backdrop layer, deep surfaces |
| `--color-charcoal-card` | `#16191E` | Elevated cards, container borders, input backgrounds |
| `--color-forest-deep` | `#1B3B2B` | Subtle green ambient backdrops, active date pills |
| `--color-forest-vibrant` | `#2D6A4F` | Primary active states, confirmed seat holds, filter tags |
| `--color-forest-emerald` | `#10B981` | Success badges, real-time indicators, glowing accents |
| `--color-crimson-primary`| `#E63946` | High-urgency CTAs ("Book Tickets Now"), occupied seats |
| `--color-crimson-vibrant`| `#FF4D5E` | Premiere highlight badges, timer countdown banner |

---

##  End-to-End Walkthrough & Route Architecture

The application is structured into distinct, deep-linkable client routes powered by React Router:

### Route 1: `/home` — Landing Premiere & Movie Discovery
* **Cinematic Hero**: Full-viewport marquee featuring high-res movie backdrops, dynamic format badges (IMAX, 3D, Dolby Atmos), and crimson primary CTAs.
* **3D Stacked Card Deck**:
  - Displays a layered deck of up to 4 upcoming movies behind the active card with depth scaling (`scale: 1 - index * 0.055`) and vertical stacking (`y: index * 18px`).
  - **Drag-to-Swipe Physics**: Drag left or right with mouse or touch. When drag offset exceeds $65\text{px}$ or velocity exceeds $250\text{px/s}$, cards transition to the next or previous movie.
  - **Pinch-to-Zoom**: Two-finger pinch gesture on mobile devices smoothly zooms the active card.
  - **Interactive Badges**: Real-time `"NEXT"` and `"PREV"` direction pills reveal dynamically during drag maneuvers.
* **Experience Highlights**: Glassmorphic cards highlighting screen format, spatial audio, plush recliners, and encrypted payment guarantees.
* **Catalog Matrix**: Debounced search and genre filter pills (`Sci-Fi`, `Action`, `Cyberpunk`, `Mystery`, `Drama`) with hover prefetching.

### Route 2: `/booking` — Showtimes & Real-Time Seat Selection Grid
* **Movie Summary Banner**: Compact top summary card displaying movie duration, language, genre, and rating.
* **Horizontal 7-Day Date Selector**: Scrollable date strip with day names, day numbers, and month indicators; the active day is highlighted in forest green.
* **Theater Proximity Accordion**: Shows grouped by local theater venues with distance indicators (e.g. `1.8 km away`) and screen format pills.
* **Interactive 4-State Seat Grid**:
  1. **Available**: Forest green border with charcoal fill.
  2. **Held by You**: Solid emerald/forest green with glowing outline.
  3. **Held by Others**: Crimson red outline with occupied pattern (broadcast via SSE).
  4. **Booked**: Inactive charcoal blending into the backdrop.
* **5-Minute Hold Countdown**: Sticky timer banner tracking the active Redis hold TTL.
* **Touch Hit Slop**: $12\text{px}$ expanded touch zones preventing mis-clicks on mobile touchscreens.

### Route 3: `/payment` — Order Summary & Digital Gate Pass
* **Order Summary Card**: Itemized invoice displaying ticket count, seat designations (e.g., `VIP-F11`, `VIP-F12`), cinema tax, convenience fees, and total due.
* **Payment Dispatcher**: Credit card simulation, Apple Pay, and Google Pay with unique `idempotency_key` tracking.
* **Digital Boarding Pass**:
  - Printable cinema pass complete with customer QR code for gate admission.
  - Movie details, hall number, screen type, and showtime schedule.
  - Print/download action to export or share pass details.

### Route 4: `/login` (and `/signup`) — Authentication & Mock Credentials
* **Sign In & Sign Up Tabs**: Tabbed interface with email, password, and cinema city preferences.
* **Mock Credentials Panel (1-Click Fill)**:
  - **VIP Cinephile Member**: `vip@reelcinema.com` / `reel2026`
  - **Standard Cinephile**: `demo@reelcinema.com` / `cinema123`
* **Guest Access**: Immediate bypass option allowing instant exploration without creating an account.
* **Session Persistence**: User profile and tier stored locally and synchronized across navigation bars and booking flows.

---

##  Repository Directory Structure

```
reel/
├── .agent/                      # AI pair-programming and Karpathy engineering guidelines
│   ├── claude.md                # Agent rules and behavior guidelines
│   └── guidelines.md            # Karpathy simplicity and surgical change principles
├── client/                      # React 19 + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Authentication gesture sheets and modal dialogs
│   │   │   │   └── AuthSheet.tsx
│   │   │   ├── booking/         # Real-time seat selection & checkout components
│   │   │   │   ├── SeatGrid.tsx
│   │   │   │   ├── SeatItem.tsx
│   │   │   │   └── TimerBanner.tsx
│   │   │   ├── catalog/         # Movie browsing, carousel, and stacked deck
│   │   │   │   ├── HeroCarousel.tsx
│   │   │   │   ├── MovieCard.tsx
│   │   │   │   ├── ShowtimePill.tsx
│   │   │   │   └── StackedCardDeck.tsx
│   │   │   ├── layout/          # Cinematic flowing background and navigation
│   │   │   │   ├── CinematicBackground.tsx
│   │   │   │   └── Navbar.tsx
│   │   │   ├── shared/          # Universal shared micro-UX components
│   │   │   │   ├── CommandMenu.tsx
│   │   │   │   ├── SkeletonLoader.tsx
│   │   │   │   └── UndoToast.tsx
│   │   │   └── ui/              # Primitive headless UI components (Drawers, etc.)
│   │   │       └── Drawer.tsx
│   │   ├── context/             # Global booking and auth state provider
│   │   │   └── BookingContext.tsx
│   │   ├── hooks/               # Custom React hooks (SSE, Optimistic holds, Prefetch)
│   │   │   ├── useOptimisticSeat.ts
│   │   │   ├── usePrefetch.ts
│   │   │   └── useSSE.ts
│   │   ├── pages/               # Multi-route page views
│   │   │   ├── HomePage.tsx     # /home: Hero premiere and catalog discovery
│   │   │   ├── BookingPage.tsx  # /booking: Show selection and interactive seat grid
│   │   │   ├── PaymentPage.tsx  # /payment: Order summary and digital admission pass
│   │   │   └── LoginPage.tsx    # /login: Sign in/up with mock credentials
│   │   ├── services/            # API client and mock data layer
│   │   │   ├── api.ts
│   │   │   └── streamService.ts
│   │   ├── styles/              # Design tokens and theme styling
│   │   │   └── theme.css
│   │   ├── utils/               # Class utilities (cn)
│   │   │   └── cn.ts
│   │   ├── App.tsx              # Router orchestrator and layout wrapper
│   │   ├── env.d.ts             # CSS and asset module declarations
│   │   ├── index.css            # Tailwind CSS v4 root import
│   │   └── main.tsx             # Application DOM entry point with BrowserRouter
│   ├── index.html               # HTML document template
│   ├── package.json             # Frontend dependencies & scripts
│   ├── tsconfig.json            # Client TypeScript configuration
│   └── vite.config.ts           # Vite + TailwindCSS build configuration
├── server/                      # Node.js + Express + Redis + PostgreSQL backend
│   ├── db/
│   │   └── schema.sql           # PostgreSQL relational DDL schema
│   ├── src/
│   │   ├── config/              # Redis and PostgreSQL pool clients
│   │   │   ├── db.ts
│   │   │   └── redis.ts
│   │   ├── routes/              # Express API route handlers
│   │   │   ├── payments.ts
│   │   │   ├── seats.ts
│   │   │   └── shows.ts
│   │   ├── services/            # SSE and Pub/Sub event distributors
│   │   │   └── sseService.ts
│   │   └── index.ts             # Server entry point
│   ├── .env.example             # Server environment variables template
│   ├── package.json             # Server dependencies & scripts
│   └── tsconfig.json            # Server TypeScript configuration
├── SPEC/                        # System architecture and UI engineering specifications
│   ├── ARCHITECTURE.md          # Backend distributed systems and database specification
│   └── frontend_ui_architecture.md # Frontend micro-UX specifications
└── README.md                    # Project documentation & guide
```

---

##  Getting Started & Local Setup

### Prerequisites

Ensure you have the following installed on your workstation:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)
- **Redis**: `v7.0+` (optional for local mock mode; required for live backend locking)
- **PostgreSQL**: `v15+` (optional for local mock mode)

---

### Client Setup (Frontend)

1. Open a terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

### Server Setup (Backend)

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure your local `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Start the server in watch mode:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`.

---

### Environment Variables

Configure the following variables in `server/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/cinema_db
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

---

### Production Build & Typecheck

To verify type safety and generate an optimized production bundle:

```bash
# In the client directory:
cd client

# Run TypeScript type check:
npx tsc --noEmit

# Compile production bundle:
npm run build

# Preview production build locally:
npm run preview
```

---

##  Contribution Guidelines & Engineering Principles

We welcome contributions! To maintain code cleanliness, reliability, and architectural consistency across the repository, all contributors must adhere to the following principles.

### Karpathy Engineering Principles

Derived from [Andrej Karpathy's coding observations](https://x.com/karpathy/status/2015883857489522876), our codebase follows strict behavioral rules:

1. **Think Before Coding**:
   - State assumptions explicitly. If uncertain about design or edge cases, ask questions before implementing.
   - Surface architectural tradeoffs early rather than making silent decisions.
2. **Simplicity First**:
   - Write the minimum code that solves the problem cleanly. Avoid speculative abstractions, unused flexibility, or premature configurability.
   - If a feature can be solved with 50 lines of clean code, do not write 200 lines.
3. **Surgical Changes**:
   - Touch only the lines directly related to your task.
   - Do not reformat adjacent unrelated code, modify unaffected comments, or introduce styling refactors unless explicitly requested.
   - Clean up any unused imports or variables introduced by your modifications.
4. **Goal-Driven Execution**:
   - Define concrete, verifiable success criteria before starting.
   - Verify every change with automated tests or strict compiler checks (`tsc --noEmit`).

---

### Git Branching & Workflow

1. **Fork or Branch**: Create a feature branch originating from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```
2. **Make Atomic Commits**: Keep commits focused and logically isolated.
3. **Verify Locally**: Ensure `npm run build` and `npx tsc --noEmit` pass with 0 errors before pushing.
4. **Push & Open PR**: Push your branch to GitHub and create a Pull Request detailing the changes and verification steps.

---

### Conventional Commits Specification

Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short imperative summary>
```

#### Allowed Types:
- `feat`: A new user-facing feature or capability
- `fix`: A bug fix or patch
- `style`: Changes in CSS, themes, colors, or visual styling
- `refactor`: Code reorganization without functional changes
- `docs`: Documentation updates or additions
- `test`: Adding or updating test cases
- `chore`: Dependency updates, tooling, or build configuration

#### Examples:
```bash
feat(carousel): create 3D StackedCardDeck component with layered card depth
feat(carousel): add touch and mouse drag-to-swipe physics with pinch response
style(theme): enrich Forest Green color tokens and emerald glow utilities
fix(booking): resolve lock timeout race condition in seat matrix
docs(readme): add system architecture, walkthrough, and contribution guide
```

---

### Pull Request Checklist

Before opening a PR, ensure the following checks are complete:
- [ ] Code builds without errors (`npm run build`).
- [ ] TypeScript compiler checks pass without warnings (`npx tsc --noEmit`).
- [ ] No extraneous debug logs, commented-out dead code, or temporary artifacts left behind.
- [ ] Commit history is clean and follows the Conventional Commits format.

---

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
