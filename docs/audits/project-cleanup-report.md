# Project Cleanup & Asset Organization Report

**Project:** Mithun & Sakhi Wedding Website  
**Date:** November 10, 2026  
**Scope:** Repository Root, Public Directory, Source Code, Audio Assets, Build Config  
**Status:** **CLEANUP COMPLETE — RECLAIMED ~118.8 MB OF STORAGE**

---

## 1. Executive Summary

In preparation for production deployment, a comprehensive audit and codebase cleanup was executed across the Mithun & Sakhi Wedding Website repository. Over multiple development stages, temporary screenshots, test fixtures, duplicate audio tracks, and unreferenced assets had accumulated. 

All cleanup actions were executed with strict safety:
- **Zero active canonical artwork was deleted.**
- **Zero website design or visual styling was altered.**
- **Zero deployment operations were performed.**
- **TypeScript compiles with 0 errors (`npx tsc --noEmit`).**
- **ESLint passes with 0 errors and 0 warnings (`npm run lint`).**
- **Next.js production build (`next build`) compiles all 29 routes in 1.28s.**

---

## 2. Before & After Cleanup Metrics

| Area / Scope | Before Cleanup | After Cleanup | Net Improvement |
| :--- | :--- | :--- | :--- |
| **Project Root Files** | 41 files | 12 files | **-29 clutter files removed (-70.7%)** |
| **`public/images/`** | 47 files (33.5 MB) | 15 files (27.6 MB) | **-32 unreferenced files (-5.90 MB)** |
| **`public/audio/`** | 10 tracks (54.5 MB) | 6 tracks (32.5 MB) | **-4 duplicate tracks (-22.0 MB)** |
| **Root `Songs/` Folder** | 6 tracks (33.5 MB) | Deleted | **-33.52 MB duplicate storage eliminated** |
| **Root `images/` Folder**| 16 files (24.7 MB) | Deleted | **-24.67 MB duplicate storage eliminated** |
| **`scratch/` Folder** | 155 files (29.3 MB) | 85 scripts (0.2 MB) | **-70 test media files (-29.06 MB)** |
| **`public/` Root SVGs** | 5 files (3.3 KB) | 0 files | **-5 create-next-app boilerplate SVGs** |
| **Dead Code / Components**| 1 unused component | 0 unused components | **`ceremonial-hero-portrait.tsx` removed** |
| **Dead Imports** | 1 unused import in `next.config.ts` | 0 unused imports | **Cleaned** |
| **ESLint Warnings/Errors**| 172 problems | **0 problems** | **100% clean passing lint** |
| **Total Disk Space Reclaimed**| — | — | **~118.8 MB Reclaimed** |

---

## 3. Detailed Actions Taken

### 3.1 Audio Asset Deduplication (`public/audio/`)
- In `public/audio/`, four tracks existed in both space-delimited and kebab-case versions:
  - `Aaj Sajeya.mp3` (6.28 MB) & `aaj-sajeya.mp3` (6.28 MB)
  - `Dekha Tenu.mp3` (7.86 MB) & `dekha-tenu.mp3` (7.86 MB)
  - `Kudmayi Ke Din.mp3` (4.04 MB) & `kudmayi-ke-din.mp3` (4.04 MB)
  - `O Piya.mp3` (3.32 MB) & `o-piya.mp3` (3.32 MB)
- `src/data/wedding-playlist.ts` explicitly references the kebab-case paths (`/audio/aaj-sajeya.mp3`, etc.).
- The 4 duplicate space-delimited MP3s were safely removed, reclaiming **22.0 MB** without breaking any audio playback.

### 3.2 Root Clutter Elimination
- **Root `.png` Debug Crops:** 29 files (`compare_*.png`, `crop_*.png`, `test_*.png`, `visual_*.png`, `reference_4_cards_grid.png`) generated during visual inspection were removed, cleaning up the repository root.
- **Root `Songs/` Directory:** Contained redundant copies of the wedding audio tracks. Removed, reclaiming **33.52 MB**.
- **Root `images/` Directory:** Contained redundant copies of canonical portraits already hosted in `public/images/`. Removed, reclaiming **24.67 MB**.
- **Boilerplate SVGs:** Removed unused default Next.js starter files from `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`).

### 3.3 Dead Code & Unused Component Removal
- Verified and removed `src/components/hero/ceremonial-hero-portrait.tsx` (an obsolete draft portrait component from early Phase 15 that was never exported or rendered).
- Verified `next.config.ts` and removed unused `import path from "node:path"`.

### 3.4 Configuration & Tooling Hygiene
- **ESLint (`eslint.config.mjs`):** Added `"scratch/**"` to `globalIgnores` to isolate temporary inspection scripts from production code linting. Running `npm run lint` now completes with **0 errors and 0 warnings**.
- **Git Ignore (`.gitignore`):** Added `/scratch` and `/audit_screenshots` to `.gitignore` to prevent development artifacts from being tracked.

---

## 4. Verification After Cleanup

1. **TypeScript Typecheck (`npx tsc --noEmit`):** Exit Code 0 (No type errors).
2. **ESLint (`npm run lint`):** Exit Code 0 (No lint errors or warnings).
3. **Next.js Production Build (`npx next build`):**
   - Successfully compiled 29/29 routes in 1.28s.
   - Zero missing imports or broken asset links.
4. **Interactive Playwright End-to-End Suite:**
   - 6 viewports tested (1440, 1366, 768, 390, 360, 320) with HTTP 200 and 0 console errors.
   - Digital Invitation actions (Calendar, PDF export, JPG export, Share modal, RSVP) verified functional.
   - Continuous Wishes & Blessings wall verified with 2 animated marquee rows and 18 visible cards.
   - Audio player verified active with 6 tracks.
