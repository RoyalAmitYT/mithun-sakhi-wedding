# Mithun & Kabita Wedding Website — Design Bible

**Document ID:** `docs/DESIGN_BIBLE.md`  
**Version:** 1.1.0  
**Status:** Authoritative Implementation Specification  
**Current Phase:** P-02 — Visual Identity & Design System Implemented in Code  
**Art Direction Concept:** Cinematic Haute-Couture Indian Wedding  
**Primary Background Canvas:** Luminous Champagne White (`#FFFCF6`)  

---

## 1. Definitive Creative Direction

The aesthetic identity of the **Mithun & Kabita Wedding Website** is defined as **Cinematic Haute-Couture Indian Wedding**.

This is not a generic wedding portal, nor an off-the-shelf template decorated with stock florals. It is an editorial, luminous, and regal digital experience inspired by:
* High-end Indian bridal couture (Sabyasachi, Tarun Tahiliani, Anita Dongre) where craft, fabric texture, and subtle antique metallic threads speak with quiet dignity.
* Contemporary luxury editorial publications (Vogue Wedding, Architectural Digest India, Kinfolk) characterized by generous spatial breathing room, commanding serif typography, and deliberate composition.
* Sacred Hindu wedding tradition, honoring ritual symbolism (Haldi turmeric light, Sindoor auspiciousness, royal Mandap arches, sacred marigold motifs) through geometric abstraction and delicate ornament rather than overwhelming visual noise.

### Foundational Design Tenets
1. **Luminosity Over Heaviness:** The digital canvas breathes with clean, radiant light. It is predominantly white and luminous, never yellowish, dingy, or mud-beige.
2. **Restraint Over Clutter:** Indian weddings are abundant, but great luxury requires curation. Every motif, line, and accent must justify its presence.
3. **Typography as Architecture:** Words and names are sculptured elements. The hero title "Mithun & Kabita" commands the page through scale, proportion, and tracking.
4. **Purposeful Motion:** Motion is subtle, physics-based, and cinematic. Elements do not bounce arbitrarily; they glide, fade, and unveil with elegance.

---

## 2. Final Color Palette — Luminous Champagne Luxury

The primary canvas is **predominantly white, luminous, warm and sophisticated**, with a subtle champagne undertone. Any earlier direction suggesting ordinary ivory cream or visible beige as the dominant background is permanently superseded.

### Authoritative Palette Tokens

| Token Name | Color Title | Hex Code | RGB | Role & Usage Rules |
| :--- | :--- | :--- | :--- | :--- |
| `color-bg-primary` | **Luminous Champagne White** | `#FFFCF6` | `255, 252, 246` | **Dominant Page Canvas (65–70% of view):** The luminous base for all main pages, hero sections, and primary storytelling blocks. |
| `color-surface-pure` | **Editorial White** | `#FFFFFF` | `255, 255, 255` | **Clean Contrast & Highlights (15%):** Selected floating surfaces, input controls, active cards, and clean visual breathing areas. |
| `color-surface-secondary` | **Soft Champagne** | `#F7F1E6` | `247, 241, 230` | **Subtle Depth & Alternate Bands (10%):** Secondary section backgrounds, table headers, and layered card borders. Must never become the dominant site canvas. |
| `color-accent-gold` | **Refined Antique Gold** | `#B8975E` | `184, 151, 94` | **Regal Ornamentation (5%):** Fine 1px borders, ornamental dividers, monograms, subtle icons, and decorative headers. Never saturated neon-yellow. |
| `color-accent-red` | **Royal Sindoor Red** | `#A52232` | `165, 34, 50` | **Auspicious Focal Points (3%):** Primary call-to-action buttons, key dates, ceremony highlights, and important badges. Used with high intentionality. |
| `color-contrast-maroon` | **Wedding Maroon** | `#481923` | `72, 25, 35` | **Dramatic Contrast (Selective):** Reserved for dramatic evening sections, high-contrast invitation designs, and selected deep luxury headers. |
| `color-accent-sage` | **Muted Sage** | `#69765D` | `105, 118, 93` | **Botanical Harmony (2%):** Natural foliage accents, delicate botanical divider flourishes, and calm status indicators. |
| `color-text-primary` | **Warm Ink** | `#292322` | `41, 35, 34` | **Authoritative Typography:** Deep espresso-charcoal text ensuring crisp, rich readability on light surfaces (exceeds WCAG AAA contrast). |

### Strict Color Usage Rules
* **No Dominant Beige:** The website must never look yellowed, aged, or muddy. `#FFFCF6` is clean, bright, and airy.
* **Gold is an Accent, Not a Surface:** Gold must be applied as hairlines, fine SVG strokes, and typographic accents, never as large flat background blocks.
* **High Contrast Text:** All body typography on light backgrounds must use Warm Ink (`#292322`). Light gold text on white is strictly prohibited due to poor legibility.

---

## 3. Typographic Hierarchy & Typography Tokens

The typographic system pairs an expressive, high-contrast **editorial display serif** with an ultra-clean, highly legible **modern geometric sans-serif**.

### Font Family Selections (Implemented in P-02)
* **Display / Headings:** `Cormorant Garamond` (`next/font/google`, CSS variable `--font-serif`, fallbacks: `Georgia, serif`) — Aristocratic editorial display serif loaded with weights 400, 500, 600, 700 and italic styles. Used for names, ceremony titles, and editorial leads.
* **Body / Controls / UI:** `Manrope` (`next/font/google`, CSS variable `--font-sans`, fallbacks: `system-ui, -apple-system, sans-serif`) — Modern, geometric grotesque with open apertures, warm numerals, and exceptional readability across all mobile and desktop viewports.
* **Formal Eyebrows / Kickers:** `Manrope` uppercase with `0.18em` tracking (`letter-spacing: 0.18em`) and diamond floret markers (`◆`), providing formal ceremonial pacing.

### Typography Scale & Hierarchy

| Role | Element / Class | Desktop Size / Leading | Mobile Size / Leading | Weight | Tracking / Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `h1.hero-title` | `72px / 80px` (4.5rem) | `44px / 52px` (2.75rem) | SemiBold (600) | `-0.02em` |
| **Section Heading** | `h2.section-heading` | `40px / 48px` (2.5rem) | `28px / 36px` (1.75rem) | Medium (500) | `-0.01em` |
| **Subsection Heading** | `h3.sub-heading` | `28px / 36px` (1.75rem) | `22px / 28px` (1.375rem) | Medium (500) | `normal` |
| **Formal Badge / Eyebrow** | `.eyebrow-label` | `12px / 16px` (0.75rem) | `11px / 14px` (0.6875rem) | SemiBold (600) | `+0.15em` (Uppercase) |
| **Editorial Lead** | `.text-lead` | `20px / 32px` (1.25rem) | `16px / 26px` (1.0rem) | Regular / Italic | `normal` |
| **Standard Body Text** | `p`, `.text-body` | `16px / 26px` (1.0rem) | `15px / 24px` (0.9375rem) | Regular (400) | `normal` |
| **Small Detail / Meta** | `.text-detail` | `13px / 20px` (0.8125rem) | `12px / 18px` (0.75rem) | Regular / Medium | `+0.02em` |
| **Button / Navigation** | `.btn`, `.nav-link` | `14px / 20px` (0.875rem) | `14px / 20px` (0.875rem) | Medium (500) | `+0.05em` |

---

## 4. Layout, Spacing & Grid System

A rhythmic **4px / 8px baseline grid** governs all spatial relationships to maintain optical balance across all devices.

### Layout Containers
* **Maximum Canvas Width:** `1440px` (outer limit for wide monitors; content centered).
* **Editorial Container:** `1200px` (standard container for narrative sections).
* **Reading / Narrative Container:** `768px` (optimized for comfortable line lengths: 60–75 characters per line).
* **Horizontal Page Padding:**
  * Desktop (>= 1024px): `48px` to `64px`
  * Tablet (768px – 1023px): `32px`
  * Mobile (< 768px): `20px` to `24px`

### Vertical Rhythm
* **Major Section Padding:** `96px` to `120px` desktop / `64px` to `80px` mobile.
* **Component Group Separation:** `40px` to `48px`.
* **Atomic Element Separation (Heading to Body):** `16px` to `24px`.

---

## 5. Surfaces, Borders, Radius & Shadows

The visual elegance originates from subtle layering, fine lines, and diffuse light, not heavy drop shadows or SaaS pill cards.

### Border & Divider Conventions
* **Hairline Border:** `1px solid rgba(184, 151, 94, 0.25)` (Refined Antique Gold at 25% opacity). Provides subtle containment without harshness.
* **Active / Focused Border:** `1px solid #B8975E` (Antique Gold full opacity).
* **Ceremonial Divider:** A custom SVG element consisting of a center ornamental diamond/mandala flanked by tapered 1px gold lines.

### Corner Radius Conventions
* **Strict Rule:** Avoid excessive pill shapes. Luxury editorial design is predominantly structured, crisp, and architectural.
* **Interactive Elements (Buttons, Inputs):** `2px` to `4px` (refined, crisp corners).
* **Card Surfaces (Celebration Cards, Modals):** `4px` to `6px` maximum.
* **Badges / Tags:** `2px` or clean rectangular frames with fine borders.
* **Pill Radius (`9999px`):** Reserved exclusively for circular icon buttons (audio toggle, play/pause).

### Shadow System
* **Ambient Surface Shadow (`shadow-luxury-sm`):** `0 2px 8px -1px rgba(41, 35, 34, 0.04), 0 1px 4px -1px rgba(184, 151, 94, 0.03)`
* **Floating Card Shadow (`shadow-luxury-md`):** `0 12px 32px -4px rgba(41, 35, 34, 0.06), 0 4px 12px -2px rgba(184, 151, 94, 0.04)`
* **Modal / Popover Shadow (`shadow-luxury-lg`):** `0 24px 64px -8px rgba(41, 35, 34, 0.12), 0 8px 24px -4px rgba(184, 151, 94, 0.06)`

---

## 6. Indian Wedding Ornament & Motif Strategy

To prevent the website from looking like a generic template, traditional motifs are incorporated as **custom, lightweight SVG vector elements**.

### Motifs & Roles
1. **The Royal Arch (Toran / Mandap):** Architectural framing used for section headers and photo containers.
2. **Sacred Geometric Mandala:** Used as subtle background watermarks (at 3–5% opacity in Antique Gold) and divider centers.
3. **Paisley / Boteh Flourish:** Used as terminal flourishes on invitation borders.
4. **Kalash & Marigold Subtle Accent:** Abstracted floral accents marking the transition between ritual sections.

### Motif Usage Rules
* **Zero Low-Resolution Raster Clipart:** No JPEG or PNG floral stock files. Every ornament is an inline or standalone SVG vector.
* **Subtle Opacity:** Background decorative watermarks must not exceed `0.04` (4%) opacity, ensuring text readability is never compromised.
* **Symmetry and Balance:** Ornamental frames must be perfectly symmetrical and scale proportionally across viewports.

---

## 7. Animation, Motion & Micro-Interactions

Motion is powered by **Motion for React (`motion/react`)**. It serves to heighten emotional reverence and elegance, never to cause distraction or vertigo.

### Animation Principles
1. **Kinetic Gravity:** Elements ease in smoothly with natural deceleration (`easeOutCubic` or gentle spring physics: `stiffness: 100, damping: 20`).
2. **Staggered Orchestration:** Child cards, date badges, and ritual highlights unveil with a gentle 60ms stagger.
3. **No Scroll-Jacking:** Natural native browser scrolling is 100% preserved. The user is never trapped in artificial scroll timelines.
4. **Sticky Navigation Transition:** Navigation seamlessly shifts from transparent over the hero to blurred Luminous Champagne (`rgba(255, 252, 246, 0.85)`) with an ultra-thin gold bottom hairline after 80px scroll.

### Reduced-Motion Rules
* **Mandatory Fallback:** Every animated element must honor `@media (prefers-reduced-motion: reduce)`.
* When reduced motion is detected:
  * Transitions to 0s duration or instantaneous opacity change.
  * Spatial translations (`y: 20 -> y: 0`) are disabled.
  * Essential information remains instantly visible without delay.

### Implemented Motion Architecture (Phase P-06)
1. **`MotionProvider` (`src/components/motion/motion-provider.tsx`):**
   - Configures `<MotionConfig reducedMotion="user">` at the root application layout.
   - Automatically disables transforms and layout animations when user reduced-motion preference is active, preserving immediate legibility.
2. **`Reveal` (`src/components/motion/reveal.tsx`):**
   - Viewport-triggered scroll entrance: `opacity: 0 -> 1`, restrained `y: 16 -> 0`.
   - Single-trigger guarantee: `viewport={{ once: true, amount: 0.15 }}` prevents repeated scroll jitter.
   - Luxury deceleration easing: `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Built-in `useReducedMotion()` fallback rendering plain `<div>` when reduced motion is preferred.
3. **`StaggerGroup` & `StaggerItem` (`src/components/motion/reveal.tsx`):**
   - Orchestrates multi-element card collections (e.g. 4 Ceremonies grid, 4-day Itinerary rows, 2 Venues grid, Family pillars) with a gentle 80ms stagger.
4. **`layoutId` Fluid Morphing Indicators:**
   - Desktop Navigation: `layoutId="nav-active-indicator"` smoothly glides the active underline between links.
   - Gallery Media Switcher: `layoutId="gallery-active-pill"` smoothly glides the white active card pill between `Photography` and `Wedding Films` tabs.
   - Gallery Panels: `<AnimatePresence mode="wait">` transitions smoothly between media categories.
5. **Restrained Scroll Indicator:**
   - Downward glide micro-interaction along the golden hairline using `[0, 16, 0]` loop (`2.2s`), resting static when reduced motion is enabled.

---

## 8. Photography & Graceful Placeholder Strategy

Authentic professional portraits of Mithun and Kabita are currently outstanding. A luxury brand requires an intentional aesthetic strategy for this interim period.

### Placeholder Rules
* **Never Use AI-Generated Fake Couples:** It is strictly forbidden to display generic AI-generated faces or stock models pretending to be Mithun & Kabita.
* **Architectural Framing & Monogram System:**
  * Couple portrait frames feature an arched royal border, soft warm champagne ambient gradient, and a bespoke intertwined monogram: **M & K** in Refined Antique Gold.
  * Accompanying caption reads: *"Our Wedding Memories Are Coming Soon."*
  * Once authentic photos are delivered, they will fit directly into these pre-styled, responsive aspect ratio containers (`4:5` portrait or `16:9` cinematic landscape) with zero layout shifting.
* **Responsive Image Optimization:**
  * Formats: Next.js `<Image>` with automatic AVIF/WebP conversion.
  * LCP Image: Hero imagery flagged with `priority={true}`.
  * Aspect Ratio Stability: Explicit `width` and `height` to prevent Cumulative Layout Shift (CLS = 0).

---

## 9. Comprehensive UI Component States

To ensure enterprise-grade polish across both the public wedding experience and the administrative console, every component must account for complete state lifecycles:

| State | Public Component Treatment | Form / Control Treatment |
| :--- | :--- | :--- |
| **Default** | Luminous champagne surface, hairline gold border, warm ink typography. | Editorial white surface, 1px gold border (25% opacity), crisp placeholder text. |
| **Hover** | Subtle -2px translateY lift, shadow transitions from `sm` to `md`, gold border brightens to 50% opacity. | Gold border increases to 60% opacity; subtle background tint shift. |
| **Active / Pressed** | Scale transforms to 0.99, shadow softens. | Border deepens to Antique Gold (`#B8975E`). |
| **Focused** | High-contrast visible focus ring: `2px solid #B8975E` with `2px offset`. | Focus ring active; input label transitions to floating gold state. |
| **Disabled** | Opacity reduced to 45%; cursor `not-allowed`; pointer events disabled. | Grayed out with subtle muted border; clear explanation tooltip if applicable. |
| **Loading** | Shimmering skeleton wave matching `#FFFCF6` to `#F7F1E6`. | Button text replaced with elegant gold spinner; width preserved. |
| **Empty State** | Centered royal arch icon, delicate heading, warm italic guidance text. | Clear, dignified explanation (e.g. *"No unmoderated wishes pending"*). |
| **Error State** | Discreet Sindoor Red (`#A52232`) indicator, non-aggressive red hairline border. | High-visibility red helper text below input with clear recovery guidance. |
| **Success State** | Muted Sage (`#69765D`) checkmark badge and warm confirmation banner. | Input border briefly shifts to Muted Sage; reassuring confirmation text. |

---

## 10. Implemented UI Primitives & Verification Lifecycle (P-02)

During phase P-02, the foundational visual identity and component primitives were coded and tested in `src/components/ui/`:

### Coded UI Primitives in `src/components/ui/`
1. **`Container` (`container.tsx`):**
   * Responsive layout boundary with width constraints: `wide` (1440px), `default` (1280px), `editorial` (1200px), `reading` (768px), and `narrow` (640px).
   * Fluid padding (`px-4 sm:px-6 md:px-8 lg:px-12`) matching editorial guidelines.
2. **`Button` (`button.tsx`):**
   * Polymorphic interactive button with crisp 4px radius (`rounded-[4px]`).
   * Semantic variants: `primary` (Sindoor Red), `secondary` (Soft Champagne with gold border), `outline-gold` (Refined Antique Gold border), `outline-maroon` (Wedding Maroon border), `ghost`, and `link`.
   * Size scale: `sm` (min 44px height), `md` (min 44px height), `lg` (min 48px height), strictly guaranteeing minimum 44x44px touch targets for mobile accessibility.
   * Comprehensive states: Active scale feedback (`active:scale-[0.98]`), accessible focus ring (`focus-visible:ring-2 focus-visible:ring-[#B8975E] focus-visible:ring-offset-2`), disabled state (`opacity-45 cursor-not-allowed`), and loading state featuring an animated inline gold spinner with `aria-busy="true"`.
3. **`SectionKicker` (`section-kicker.tsx`):**
   * Typographic eyebrow component with `0.18em` letter tracking, uppercase styling, and subtle diamond floret markers (`◆`).
   * Variants: `gold` (`#B8975E`), `sindoor` (`#A52232`), `maroon` (`#481923`), and `framed` (white background pill badge with hairline gold border).
4. **`OrnamentalDivider` (`ornamental-divider.tsx`):**
   * Bespoke vector ceremonial divider featuring a center diamond & sacred mandala motif flanked by linear tapered hairline rules.
   * Semantic accessibility: `role="separator"` with `aria-orientation="horizontal"`.
   * Variants: `gold`, `maroon`, `sindoor`, and `subtle` (soft opacity). Sizes: `sm` (200px), `md` (320px), `lg` (480px), `full` (100%).
5. **`SectionHeading` (`section-heading.tsx`):**
   * Structured typography lockup pairing `SectionKicker`, serif `h2` heading, descriptive subtitle, and optional integrated ceremonial divider.
   * Alignment modes: `center`, `left`, `right`.
6. **`SurfaceCard` (`surface-card.tsx`):**
   * Multi-tiered elevation cards with crisp `6px` radius (`rounded-[6px]`).
   * Variants: `editorial` (white with luxury subtle shadow), `soft` (soft champagne), `dramatic` (royal wedding maroon), and `outlined` (transparent with gold hairline).
   * Optional `hoverEffect` with subtle `-translate-y-1` elevation lift and border highlight.
7. **`Input` (`input.tsx`):**
   * Fully accessible form input with programmatic label linkage via React 19 `useId()`.
   * Features: Required indicator (`*`), `aria-invalid` state, `aria-describedby` linkage to helper text and error message, high-contrast gold focus ring (`focus-visible:ring-[#B8975E]`), and red error border treatment. Minimum 44px mobile touch target.

### Internal Design Preview Lifecycle (`/design-preview`)
* **Route Location:** `src/app/design-preview/page.tsx`.
* **Purpose:** Provides a centralized visual test bench and living style guide showcasing all color tokens, typography scales, buttons, dividers, surface cards, and form inputs.
* **Production Protection:** Protected by an environment guard:
  ```ts
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DESIGN_PREVIEW !== "true") {
    notFound();
  }
  ```
  In production builds, accessing this route returns a 404 Not Found error unless explicitly enabled via `ENABLE_DESIGN_PREVIEW="true"`.
* **SEO Protection:** Configured with `metadata: { robots: { index: false, follow: false } }` to ensure search engine crawlers never index internal design system elements.
* **Retirement / Lifecycle Plan:** The preview route is maintained throughout Milestones 1 and 2 for component visual regression testing, then cleanly deprecated or restricted prior to public launch.

---

## 11. Navigation & Hero Design Rules (P-03)

During phase P-03, the signature navigation and cinematic hero were coded and integrated:

### Shared Public Navigation Rules
* **Glassmorphic Scroll Surface:** Navigation is fixed (`fixed top-0 left-0 right-0 z-40`). At scroll offset 0, it renders seamlessly with transparent background and zero drop shadow. After scrolling > 30px, it shifts into `bg-[#FFFCF6]/92 backdrop-blur-md py-3 border-b border-[rgba(184,151,94,0.25)] shadow-[0_4px_20px_-2px_rgba(41,35,34,0.04)]`.
* **Mobile Drawer Architecture:** Features an accessible `<dialog>` pattern (`role="dialog"`, `aria-modal="true"`) with body scroll locking, `Escape` key dismissal, focus management to the close button, and minimum `44x44px` interactive touch targets.
* **Target Destinations:** Uses clean semantic anchors (`#celebrations`, `#ceremonies`, `#venues`, `#family`, `#wishes`, `#rsvp`) with `scroll-mt-24` ensuring section headings never hide beneath the sticky header.

### Cinematic Hero Architectural Rules
* **Asymmetrical 12-Column Desktop Grid:**
  * Left Column (7 columns): Typographic lockup with `SectionKicker`, display serif `h1` (`Cormorant Garamond` at `text-5xl` to `text-8xl`), italic blessing invocation, dual-block dates and venue card, and primary/secondary CTAs.
  * Right Column (5 columns): The bespoke `CeremonialArch` architectural Toran composition with the royal `M · K` monogram and parents' blessing plaque.
* **Single-Column Mobile Storytelling:** On viewports < 1024px, collapses into a deliberate vertical hierarchy maintaining comfortable reading line lengths and zero horizontal overflow.
* **Couple Portrait Placeholder System:** The Toran arch defines an architectural 4:5 portrait frame with SVG kalash finial and hairline filigree, allowing authentic couple portraits to drop in seamlessly during Phase P-12 without layout disruption.
* **Motion & Reduced Motion:** Powered by `motion/react` with staggered reveals (`staggerChildren: 0.08s`, cubic bezier `[0.16, 1, 0.3, 1]`). When `useReducedMotion()` is active, animation durations are 0s with instant visibility, zero translation, and zero layout shift.

---

## 12. Complete Homepage Narrative Architecture (P-04)

During phase P-04, the complete ten-part cinematic homepage flow was established in code:

### Canonical Event & Couple Data Module
* **Location:** `src/data/wedding-data.ts`.
* **Purpose:** Single source of truth for groom (`Mithun Gorain`), bride (`Kabita Gorain`, nickname `Manjura`), four parents (`Mr. Kenaram Gorain & Ms. Savita Gorian`, `Mr. Upen Gorain & Ms. Kokila Gorain`), confirmed ceremony schedules, addresses, Google Maps links, and public contact information.
* **Integrity Guarantee:** Zero hardcoded dates or inconsistent timings scattered across UI components; all downstream sections consume this typed contract.

### Narrative Flow & Visual Rhythm
1. **Hero Experience (`#hero` / `#top`):** Asymmetrical Haute-Couture entrance with Toran arch and royal monogram.
2. **Countdown & Celebration Status (`#countdown`):** Timezone-aware client counter (`Asia/Kolkata`) displaying live time remaining before Haldi (19 Nov, 9:00 AM IST), day-specific celebration banners on each ceremony date, and seamless transition to Memories Mode on 23 Nov 2026.
3. **Celebrations Overview (`#celebrations`):** 4-part visual arrangement characterizing Haldi, Mehndi, Vivaha, and Preetibhoj Reception with distinct ceremony badges and ritual tags.
4. **Ceremony Schedule (`#ceremonies`):** Structured chronological itinerary with start times in IST, confirmed venues, ritual meaning, and verified Google Maps links opening in external tabs with `rel="noopener noreferrer"`.
5. **Venues & Directions (`#venues`):** Dual-card architectural layout for Groom's Residence (Chitmu, Kotshila) and Bride's Residence (Ghaghra, Jaipur) with one-touch navigation actions.
6. **Couple & Family Tribute (`#family`):** Central royal monogram seal and balanced dual pillars honoring both sets of parents.
7. **Digital Invitation Studio Preview (`#invitation`):** Traditional royal Indian invitation card composition with English sacred invocation ("In Auspicious Reverence to the Divine"), host announcement, and gold border styling.
8. **Wedding Memories Preview (`#gallery`):** Elegant empty state with mandatory wording: *"Our Wedding Memories Are Coming Soon."* showcasing future Photos & Films categories.
9. **Wishes & Blessings Preview (`#wishes`):** Sacred Diya motif and explanation of family moderation policy for incoming guestbook blessings.
10. **Guest Attendance & RSVP Preview (`#rsvp`):** Informative preview displaying confirmed confirmation deadlines per ceremony without premature submission forms.
11. **Hospitality Coordination Desk (`#contact`):** Action card with direct phone link (`tel:+916295864148`) and customized WhatsApp click-to-chat greeting.
12. **Editorial Footer:** In-page anchor navigation, parents' acknowledgement, copyright, and developer link to `/design-preview`.

---

## 13. Dedicated Public Subpages, SEO & Social Architecture (P-05)

During phase P-05, the dedicated public subpages, dynamic metadata infrastructure, and social sharing image generator were established:

### Dedicated Public Routes
1. **`/events`:** Detailed ceremonial itinerary with in-page navigation anchors (`#haldi`, `#mehndi`, `#wedding`, `#reception`), start times in IST, confirmed addresses, ritual significance, and verified Google Maps direction actions.
2. **`/gallery`:** Public wedding memories gallery featuring accessible tabbed navigation (`Photos` and `Films`). Displays the mandatory empty-state wording: *"Our Wedding Memories Are Coming Soon."* with structured future collection previews and zero stock imagery.
3. **`/invitation`:** Dedicated online invitation showcase featuring two distinct artistic editions:
   * **Design A (Cinematic Editorial):** Modern luxury layout, portrait-shaped architectural framing with custom Mandap Toran arch and royal `M · K` monogram.
   * **Design B (Traditional Royal Decree):** Classical Indian decree aesthetic, deep maroon and antique gold decorative frames, English sacred invocation (*"In Auspicious Reverence to the Divine"*), host announcement, and four-ceremony schedule summary.
4. **`/privacy`:** Initial operational Privacy Policy addressing public wedding information, voluntary telephone/WhatsApp communications, Vercel edge delivery logs, and zero marketing/analytics tracking cookies. Explicitly notes that personal guest account features (Milestone B) will require a formal policy review prior to collecting user data.
5. **`/terms`:** Plain-English, respectful visitor terms for a personal wedding celebration website. Covers informational purpose, respectful community conduct, external map links, intellectual property of personal media, and coordination desk contact.

### Cross-Route Navigation Contract
* **Smart Route Resolution:** Navigation links dynamically adapt using `usePathname()`. On the homepage (`/`), in-page anchor links scroll directly (`#celebrations`); on subpages (`/events`, etc.), links automatically route back to home anchors (`/#celebrations`), preventing broken anchor lookups.
* **Header & Footer Symmetry:** The shared public navigation and editorial footer connect all public routes (`/events`, `/invitation`, `/gallery`, `/privacy`, `/terms`) while keeping `/design-preview` isolated from public indexing.

### SEO, Open Graph & Crawling Directives
* **Canonical URL Safety (`src/lib/site-url.ts`):** Canonical origin resolution strictly respects `NEXT_PUBLIC_SITE_URL`. In unconfigured development or preview environments, production indexing is blocked to prevent accidental search engine pollution.
* **Dynamic Open Graph Sharing (`src/app/opengraph-image.tsx`):** Original 1200x630 sharing image rendered via `next/og` `ImageResponse` featuring the royal `M · K` monogram, Cormorant Garamond couple typography, confirmed dates (`19–22 November 2026`), Purulia location, and Luminous Champagne Luxury styling for WhatsApp and social cards.
* **`robots.ts` & `sitemap.ts`:**
  * In non-production or unconfigured states: Disallows all crawlers (`disallow: /`).
  * In canonical production: Allows public pages (`/`, `/events`, `/gallery`, `/invitation`, `/privacy`, `/terms`) and points to `/sitemap.xml`.
  * Explicitly excludes `/design-preview` and future private routes (`/api/`, `/admin/`, `/dashboard/`).
  * Note: Robots directives serve as crawler guidance and are not treated as a security authorization boundary.
