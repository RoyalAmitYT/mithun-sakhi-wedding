# Mithun & Sakhi Wedding Website

A bespoke, ultra-premium, cinematic Indian Hindu wedding website and digital invitation experience for the marriage of **Mithun Gorain** and **Sakhi Gorain** in Purulia, West Bengal (19–22 November 2026).

---

## Current Status: Phase P-01 (Application Foundation)

This repository is currently at **Phase P-01 (Application Foundation)**.
The Next.js App Router, TypeScript, Tailwind CSS, ESLint, and quality check tooling have been established.

> [!NOTE]
> The current homepage is an explicitly temporary engineering foundation placeholder. The bespoke cinematic visual experience, design system, and animations will be developed in subsequent phases according to the master roadmap.

---

## Technology Stack

* **Framework:** Next.js 16 (App Router, Server Components)
* **Language:** TypeScript 5 (Strict type-checking)
* **UI & Styling:** React 19, Tailwind CSS 4
* **Tooling:** ESLint 9 (`eslint-config-next`), TypeScript (`tsc --noEmit`)
* **Future Planned Backend:** Supabase (PostgreSQL, Supabase Auth, Storage, Row Level Security)
* **Future Planned Animation:** Motion for React (`motion/react`)

---

## Project Documentation

Authoritative project planning documents created in Phase P-00 are maintained in the [`docs/`](./docs/) directory:

* [`docs/PROJECT_BRIEF.md`](./docs/PROJECT_BRIEF.md) — Product vision, personas, scope boundaries, and constraints.
* [`docs/PHASE_ROADMAP.md`](./docs/PHASE_ROADMAP.md) — 17-phase master roadmap (P-00 through P-16).
* [`docs/DESIGN_BIBLE.md`](./docs/DESIGN_BIBLE.md) — Luminous Champagne Luxury visual system and tokens.
* [`docs/ARCHITECTURE_AND_SECURITY.md`](./docs/ARCHITECTURE_AND_SECURITY.md) — Schema, RLS, RSVP deadlines, and security model.
* [`docs/CONTENT_AND_EVENT_DATA.md`](./docs/CONTENT_AND_EVENT_DATA.md) — Confirmed ceremony data, venues, and contact numbers.
* [`docs/ACCEPTANCE_CRITERIA.md`](./docs/ACCEPTANCE_CRITERIA.md) — Testable verification criteria across all domains.

---

## Prerequisites

* **Node.js:** v18.18+ (tested on Node v24+)
* **Package Manager:** npm (v10+ / v11+)

---

## Setup & Development Scripts

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Type Checking
```bash
npm run typecheck
```
Executes `tsc --noEmit` using strict TypeScript configuration.

### 4. Linting
```bash
npm run lint
```
Executes ESLint with Next.js core web vitals and TypeScript rules.

### 5. Production Build
```bash
npm run build
```
Creates an optimized production build in `.next/`.

### 6. Start Production Server
```bash
npm run start
```
Starts the production server after building.
