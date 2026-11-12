# IMAGE OPTIMIZATION BEFORE-AUDIT REPORT
**Project:** Mithun & Sakhi Wedding Website  
**Date:** 11 November 2026  
**Auditor:** Pre-Deployment Engineering Team  
**Scope:** Complete Asset Inventory & Performance Baseline Prior to Optimization  

---

## 1. Executive Summary

A full audit of all image assets in `public/` and throughout the Next.js application codebase was conducted.

### Key Baseline Findings
- **Total Public Raster Assets:** 24 images (15 in `public/images/`, 9 in `public/media/temporary/`).
- **Total Asset Weight on Disk:** ~24,534 KB (24.0 MB).
- **Primary Bottleneck:** 9 photographic PNG assets in `public/images/` total **21,803 KB (21.3 MB)** alone. They are uncompressed RGB photographs without alpha channels saved as `.png`.
- **Eager Loading Inefficiencies:** Multiple below-the-fold components (including all four fullscreen ceremony backgrounds, celebrations cards, Our Story groom/bride portraits, and gallery preview items) have `priority` flags enabled, forcing the browser to preload over 19 MB of images during initial page load!
- **Display vs Resolution Discrepancy:**
  - Groom & Bride portraits (1086 × 1448 px, ~2.5 MB each) are displayed inside compact arched cards of just **160px – 192px** CSS width.
  - Ceremony cards (1672 × 941 px, ~2.4 MB each) are displayed in 25vw grid cards (~300px width).
  - Invitation photo panels (1100–1536 px wide) are displayed in ~300px wide crescent cutouts.

---

## 2. Complete Asset Inventory

| # | Filename | Format | File Size | Original Dimensions | Displayed Dimensions | References | Website Section(s) | Responsive Variant Needed? | Preserves Alpha? |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `images/hero-portrait.png` | PNG | 2,479.4 KB | 1672 × 941 | 100vw × 100vh (desktop/mobile) | 2 | Hero section, Gallery Preview ("Eternal Union") | Yes (Desktop 1672w, Mobile 800w, Card 480w) | No |
| 2 | `images/bride-portrait.png` | PNG | 2,581.3 KB | 1086 × 1448 | 160–192px CSS width (Card), 25vw (Gallery) | 3 | Our Story, Family section, Gallery Preview | Yes (Card 480w, Lightbox 1086w) | No |
| 3 | `images/groom-portrait.png` | PNG | 2,478.2 KB | 1086 × 1448 | 160–192px CSS width (Card), 25vw (Gallery) | 3 | Our Story, Family section, Gallery Preview | Yes (Card 480w, Tall Card 600w, Lightbox 1086w) | No |
| 4 | `images/haldi-portrait.png` | PNG | 2,202.2 KB | 1672 × 941 | ~300 × 200px (Card), 25vw (Gallery) | 2 | Celebrations Overview, Gallery Preview | Yes (Card 640w, Lightbox 1672w) | No |
| 5 | `images/haldi-section-bg-portrait.png` | PNG | 2,304.1 KB | 1672 × 941 | 100vw × 100vh (Ceremony 1) | 1 | Haldi Fullscreen Ceremony panel | Yes (Desktop 1672w, Mobile 800w) | No |
| 6 | `images/mehendi-portrait.png` | PNG | 2,470.7 KB | 1672 × 941 | ~300 × 200px (Card), 100vw (Ceremony 2), 25vw (Gallery) | 3 | Celebrations Overview, Mehndi Fullscreen, Gallery Preview | Yes (Card 640w, Desktop 1672w, Mobile 800w) | No |
| 7 | `images/the-sacred-wedding.png` | PNG | 2,356.0 KB | 1672 × 941 | ~300 × 200px (Card), 100vw (Ceremony 3), 25vw (Gallery) | 4 | Celebrations Overview, Wedding Fullscreen, Gallery Preview, Video fallback | Yes (Card 640w, Desktop 1672w, Mobile 800w) | No |
| 8 | `images/reception-portrait.png` | PNG | 2,441.7 KB | 1672 × 941 | ~300 × 200px (Card), 25vw (Gallery) | 2 | Celebrations Overview, Gallery Preview | Yes (Card 640w, Lightbox 1672w) | No |
| 9 | `images/reception-section-bg-portrait.png` | PNG | 2,488.8 KB | 1672 × 941 | 100vw × 100vh (Ceremony 4) | 1 | Reception Fullscreen Ceremony panel | Yes (Desktop 1672w, Mobile 800w) | No |
| 10 | `images/invitationcard-topleftcorner-overlay.webp` | WebP | 110.5 KB | 1032 × 851 | ~197 × 162px (Card), 492 × 405px (Export) | 1 | Digital Invitation card | Yes (Display 516w, Export 1032w) | **YES (Alpha)** |
| 11 | `images/invitationcard-bottomrightcorner-overlay.webp` | WebP | 83.1 KB | 1100 × 733 | ~231 × 154px (Card), 577 × 385px (Export) | 1 | Digital Invitation card | Yes (Display 550w, Export 1100w) | **YES (Alpha)** |
| 12 | `images/invitationcard-haldi-image.webp` | WebP | 171.6 KB | 1536 × 1024 | ~300 × 80px (Panel), 750 × 200px (Export) | 1 | Digital Invitation card | Yes (Display 600w, Export 1536w) | No |
| 13 | `images/invitationcard-mehndi-image.webp` | WebP | 184.4 KB | 1100 × 733 | ~300 × 80px (Panel), 750 × 200px (Export) | 1 | Digital Invitation card | Yes (Display 600w, Export 1100w) | No |
| 14 | `images/invitationcard-wedding-image.webp` | WebP | 189.3 KB | 1100 × 733 | ~300 × 80px (Panel), 750 × 200px (Export) | 1 | Digital Invitation card | Yes (Display 600w, Export 1100w) | No |
| 15 | `images/invitationcard-reception-image.webp` | WebP | 175.1 KB | 1100 × 733 | ~300 × 80px (Panel), 750 × 200px (Export) | 1 | Digital Invitation card | Yes (Display 600w, Export 1100w) | No |
| 16 | `media/temporary/photos/hero_couple_portrait.jpg` | JPEG | 529.0 KB | 1600 × 2169 | Unused in live UI | 0 | Temporary placeholder registry | Retain archive | No |
| 17 | `media/temporary/photos/ceremony_haldi.jpg` | JPEG | 427.5 KB | 1400 × 2100 | Unused in live UI | 0 | Temporary placeholder registry | Retain archive | No |
| 18 | `media/temporary/photos/wedding_decor_flowers.jpg` | JPEG | 393.5 KB | 1400 × 1750 | Unused in live UI | 0 | Temporary placeholder registry | Retain archive | No |
| 19 | `media/temporary/photos/ceremony_mehndi.jpg` | JPEG | 331.9 KB | 1400 × 2100 | Unused in live UI | 0 | Temporary placeholder registry | Retain archive | No |
| 20 | `media/temporary/photos/poster_haldi_film.jpg` | JPEG | 175.5 KB | 800 × 1200 | Unused in live UI | 0 | Temporary placeholder registry | Retain archive | No |
| 21 | `media/temporary/photos/ceremony_reception.jpg` | JPEG | 166.0 KB | 1400 × 935 | Unused in live UI | 0 | Temporary placeholder registry | Retain archive | No |
| 22 | `media/temporary/photos/groom_solo_portrait.jpg` | JPEG | 150.1 KB | 1200 × 1800 | Unused in live UI | 0 | Temporary placeholder registry | Retain archive | No |
| 23 | `media/temporary/photos/bride_solo_portrait.jpg` | JPEG | 99.6 KB | 1200 × 800 | Unused in live UI | 0 | Temporary placeholder registry | Retain archive | No |
| 24 | `media/temporary/posters/poster_bridal_film.jpg` | JPEG | 54.3 KB | 800 × 533 | Unused in live UI | 0 | Temporary placeholder registry | Retain archive | No |

---

## 3. Detailed Component & Section Analysis

### 1. Hero Section (`src/components/hero/hero-section.tsx`)
- **Asset:** `/images/hero-portrait.png`
- **Current Size:** 2,479.4 KB.
- **Problem:** Full desktop resolution (1672 × 941) is delivered unconditionally to all devices, including 360–390px mobile screens. Lossless PNG compression is 10x larger than necessary.
- **Action:**
  - Create desktop variant (1672 × 941) in AVIF (Q62) and WebP (Q80) (~180–220 KB).
  - Create mobile variant (800 × 450) in AVIF (Q60) and WebP (Q78) (~55–75 KB).
  - Retain `priority={true}` exclusively on Hero as the single true above-the-fold LCP image.

### 2. Our Story Section (`src/components/sections/our-story-section.tsx`)
- **Assets:** `/images/groom-portrait.png`, `/images/bride-portrait.png`.
- **Current Size:** 5,059.5 KB total.
- **Problem:** Delivered at 1086 × 1448 px for an arched frame that renders at max 192px CSS width. Both have `priority={true}` despite being well below the fold.
- **Action:**
  - Create card display variants (480 × 640) in AVIF and WebP (~35–50 KB each).
  - Remove `priority` so they load lazily as the user scrolls toward Our Story.

### 3. Wedding Celebrations Cards (`src/components/sections/celebrations-overview-section.tsx`)
- **Assets:** `haldi-portrait.png`, `mehendi-portrait.png`, `the-sacred-wedding.png`, `reception-portrait.png`.
- **Current Size:** 9,470.6 KB total.
- **Problem:** All four card images are 1672 × 941 PNGs loaded eagerly with `priority={true}` into 25vw cards.
- **Action:**
  - Create card variants (640 × 360) in AVIF (Q58) and WebP (Q78) (~35–48 KB each).
  - Remove `priority` from all four cards.

### 4. Ceremony Fullscreen Panels (`src/components/sections/ceremony-fullscreen-sections.tsx`)
- **Assets:** `haldi-section-bg-portrait.png`, `mehendi-portrait.png`, `the-sacred-wedding.png`, `reception-section-bg-portrait.png`.
- **Current Size:** 9,620.6 KB total.
- **Problem:** All four ceremony panels have `priority={true}` in `ceremony-fullscreen-sections.tsx:768`.
- **Action:**
  - Create cinematic desktop fullscreen variants (1672 × 941) in AVIF and WebP (~150–210 KB).
  - Create mobile fullscreen variants (800 × 450) in AVIF and WebP (~55–75 KB).
  - Remove `priority` so each ceremony image is streamed dynamically as the user scrolls into its chapter.

### 5. Digital Invitation Card & Export Pipeline (`official-wedding-invitation.tsx` & `invitation-export.ts`)
- **Assets:** 4 ceremony panels (`invitationcard-*-image.webp`) and 2 fabric overlays (`invitationcard-*corner-overlay.webp`).
- **Current Size:** 914 KB total.
- **Critical Requirement:** The DOM capture engine captures `#official-wedding-invitation-card` at 2.5x pixel ratio (1680 × 2100). High-resolution source assets must remain available for crisp PDF/JPG exports.
- **Action:**
  - Retain high-resolution variants for export capture.
  - Provide lightweight display variants for normal in-viewport rendering.

### 6. Homepage Gallery Curated Grid (`src/components/sections/gallery-preview-section.tsx`)
- **Assets:** 7 celebration photos (`groom-portrait`, `bride-portrait`, `the-sacred-wedding`, `haldi-portrait`, `hero-portrait`, `mehendi-portrait`, `reception-portrait`).
- **Current Size:** ~16.8 MB total.
- **Problem:** Loaded directly as 2.4MB PNGs into small 25vw grid tiles; column 1 had `priority={true}`.
- **Action:**
  - Render compact thumbnail variants (480–640w, ~35–55 KB) in the grid.
  - Retain high-resolution display variants (1086–1672w, ~150–200 KB) when the photo is opened in the lightbox modal.
  - Remove `priority` from gallery tiles.

---

## 4. Performance Baseline Summary

- **Total Public Images on Disk:** 24.0 MB.
- **Estimated Homepage Initial Image Transfer (Before Optimization):** ~21.5 MB!
- **Estimated Homepage Initial Image Transfer (Target After Optimization):** < 450 KB (Desktop initial view) and < 150 KB (Mobile initial view).
- **Projected Bandwidth Savings:** > 90% reduction.
