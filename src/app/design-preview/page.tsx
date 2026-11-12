import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Container,
  Button,
  SectionKicker,
  SectionHeading,
  OrnamentalDivider,
  SurfaceCard,
  Input,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Design System Preview — Mithun & Sakhi",
  description:
    "Internal visual identity and design system preview for Mithun & Sakhi Wedding Website.",
  robots: {
    index: false,
    follow: false,
  },
};

const paletteTokens = [
  {
    name: "Luminous Champagne White",
    hex: "#FFFCF6",
    rgb: "255, 252, 246",
    token: "--color-luminous-champagne",
    role: "Dominant Canvas Base (65–70% of view)",
    desc: "Clean, radiant, warm light without yellowish or dingy undertones.",
    textColor: "#292322",
    border: "border-[#B8975E]/30",
  },
  {
    name: "Editorial White",
    hex: "#FFFFFF",
    rgb: "255, 255, 255",
    token: "--color-editorial-white",
    role: "Crisp Surfaces & Clean Contrast (15%)",
    desc: "Used for floating surfaces, card backgrounds, and input controls.",
    textColor: "#292322",
    border: "border-[#B8975E]/30",
  },
  {
    name: "Soft Champagne",
    hex: "#F7F1E6",
    rgb: "247, 241, 230",
    token: "--color-soft-champagne",
    role: "Depth & Subtle Alternate Bands (10%)",
    desc: "Secondary section backgrounds, layered borders, and card depth.",
    textColor: "#292322",
    border: "border-[#B8975E]/30",
  },
  {
    name: "Refined Antique Gold",
    hex: "#B8975E",
    rgb: "184, 151, 94",
    token: "--color-refined-gold",
    role: "Regal Ornamentation & Hairlines (5%)",
    desc: "1px borders, ornamental dividers, monograms, and focus rings.",
    textColor: "#FFFFFF",
    border: "border-[#B8975E]",
  },
  {
    name: "Royal Sindoor Red",
    hex: "#A52232",
    rgb: "165, 34, 50",
    token: "--color-sindoor-red",
    role: "Auspicious Focal Points & CTAs (3%)",
    desc: "Primary action buttons, ceremonial dates, and key highlights.",
    textColor: "#FFFFFF",
    border: "border-[#A52232]",
  },
  {
    name: "Wedding Maroon",
    hex: "#481923",
    rgb: "72, 25, 35",
    token: "--color-wedding-maroon",
    role: "Dramatic Contrast & Evening Accents",
    desc: "Deep contrast card surfaces, evening sections, and high-impact headers.",
    textColor: "#FFFFFF",
    border: "border-[#481923]",
  },
  {
    name: "Muted Sage",
    hex: "#69765D",
    rgb: "105, 118, 93",
    token: "--color-muted-sage",
    role: "Botanical Harmony & Calm Accents (2%)",
    desc: "Foliage accents, subtle ceremonial flourishes, and success cues.",
    textColor: "#FFFFFF",
    border: "border-[#69765D]",
  },
  {
    name: "Warm Ink",
    hex: "#292322",
    rgb: "41, 35, 34",
    token: "--color-warm-ink",
    role: "Authoritative Editorial Typography",
    desc: "Deep espresso-charcoal text ensuring crisp legibility (WCAG AAA).",
    textColor: "#FFFFFF",
    border: "border-[#292322]",
  },
];

export default function DesignPreviewPage() {
  // Exclude from public production access unless explicitly enabled
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_DESIGN_PREVIEW !== "true"
  ) {
    notFound();
  }

  return (
    <main className="min-h-screen py-12 sm:py-16 md:py-20 bg-[#FFFCF6] text-[#292322]">
      <Container size="editorial">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 mb-12 border-b border-[rgba(184,151,94,0.2)]">
          <div>
            <div className="mb-2">
              <SectionKicker variant="framed">Internal Verification</SectionKicker>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#292322]">
              Design System & Visual Identity
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#5C5452]">
              Haute-Couture Indian Wedding specification: tokens, typography, surfaces, and accessible controls.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-[#F7F1E6] text-[#B8975E] border border-[rgba(184,151,94,0.3)]">
              Phase P-02
            </span>
            <Link href="/" className="inline-block">
              <Button variant="outline-gold" size="sm">
                Return to Overview
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 1: Color Palette */}
        <section className="mb-16 sm:mb-24" aria-labelledby="section-palette">
          <SectionHeading
            kicker="Luminous Champagne Luxury"
            title="Color System & Tokens"
            subtitle="An intentional, luminous palette balancing warm champagne light with auspicious ceremonial accents."
            align="left"
            className="mb-8"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {paletteTokens.map((color) => (
              <div
                key={color.token}
                className={`rounded-[6px] overflow-hidden bg-white border ${color.border} shadow-[0_2px_8px_-1px_rgba(41,35,34,0.04)] flex flex-col`}
              >
                <div
                  className="h-28 w-full p-4 flex flex-col justify-between"
                  style={{ backgroundColor: color.hex, color: color.textColor }}
                >
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider opacity-90">
                    {color.hex}
                  </span>
                  <span className="text-xs font-medium opacity-80">
                    RGB: {color.rgb}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#292322]">
                      {color.name}
                    </h3>
                    <p className="text-xs font-medium text-[#B8975E] mt-0.5">
                      {color.role}
                    </p>
                    <p className="text-xs text-[#5C5452] mt-2 leading-relaxed">
                      {color.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[rgba(184,151,94,0.15)]">
                    <code className="text-[11px] font-mono text-[#8A8280] block truncate">
                      {color.token}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Typography Hierarchy */}
        <section className="mb-16 sm:mb-24" aria-labelledby="section-typography">
          <SectionHeading
            kicker="Editorial Architecture"
            title="Typographic Hierarchy"
            subtitle="Display serif Cormorant Garamond paired with contemporary geometric grotesque Manrope."
            align="left"
            className="mb-8"
          />

          <SurfaceCard variant="editorial" className="space-y-8 divide-y divide-[rgba(184,151,94,0.2)]">
            {/* Hero Display */}
            <div className="pt-0">
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-2">
                Display Title (Desktop 72px / Mobile 44px — Cormorant Garamond)
              </span>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight text-[#292322] leading-[1.1]">
                Mithun &amp; Sakhi
              </h1>
            </div>

            {/* Section Heading */}
            <div className="pt-6">
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-2">
                Section Heading (Desktop 40px / Mobile 28px — Cormorant Garamond)
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#292322] leading-[1.15]">
                The Sacred Ceremonies
              </h2>
            </div>

            {/* Subsection Heading */}
            <div className="pt-6">
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-2">
                Subsection Heading (Desktop 28px / Mobile 22px — Cormorant Garamond)
              </span>
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-medium text-[#292322]">
                Mehndi Ceremony
              </h3>
            </div>

            {/* Editorial Lead */}
            <div className="pt-6">
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-2">
                Editorial Lead (Desktop 20px / Mobile 16px — Cormorant Garamond Italic / Manrope)
              </span>
              <p className="font-serif text-lg sm:text-xl md:text-2xl italic text-[#5C5452] leading-relaxed max-w-3xl">
                &ldquo;Two souls, two families, and an eternal celebration bound by sacred Vedic tradition and boundless love.&rdquo;
              </p>
            </div>

            {/* Body Text */}
            <div className="pt-6">
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-2">
                Standard Body Text (16px / Leading 26px — Manrope Regular)
              </span>
              <p className="font-sans text-base text-[#292322] leading-relaxed max-w-3xl">
                We invite you to witness the seven sacred vows under the floral Mandap. 
                Every ritual reflects centuries of heritage, auspicious blessings, and joyous celebration 
                surrounded by those who hold a special place in our lives.
              </p>
            </div>

            {/* Small Detail & Eyebrow */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-2">
                  Eyebrow / Kicker (12px / 0.18em Tracking)
                </span>
                <SectionKicker variant="gold">Auspicious Schedule</SectionKicker>
              </div>
              <div>
                <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-2">
                  Small Detail / Metadata (13px — Manrope)
                </span>
                <p className="text-sm text-[#5C5452]">
                  Sunday, 14 December 2026 • 7:00 PM IST • Kolkata, India
                </p>
              </div>
            </div>
          </SurfaceCard>
        </section>

        {/* Section 3: Ornamental Dividers */}
        <section className="mb-16 sm:mb-24" aria-labelledby="section-dividers">
          <SectionHeading
            kicker="Ceremonial Flourishes"
            title="Ornamental Vector Dividers"
            subtitle="Bespoke geometric diamond & mandala florets flanked by linear tapered rules."
            align="left"
            className="mb-8"
          />

          <SurfaceCard variant="editorial" className="space-y-8">
            <div>
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-4">
                Antique Gold (Default Ceremony Divider)
              </span>
              <OrnamentalDivider variant="gold" size="md" />
            </div>

            <div>
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-4">
                Royal Sindoor Red (Auspicious Ritual Marker)
              </span>
              <OrnamentalDivider variant="sindoor" size="md" />
            </div>

            <div>
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-4">
                Wedding Maroon (Dramatic Section Break)
              </span>
              <OrnamentalDivider variant="maroon" size="md" />
            </div>

            <div>
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-4">
                Subtle (Soft In-Content Divider)
              </span>
              <OrnamentalDivider variant="subtle" size="lg" />
            </div>
          </SurfaceCard>
        </section>

        {/* Section 4: Interactive Buttons */}
        <section className="mb-16 sm:mb-24" aria-labelledby="section-buttons">
          <SectionHeading
            kicker="Interactive Components"
            title="Button Variants & Touch Targets"
            subtitle="Crisp 4px radius, accessible >= 44px touch targets, clear active states, and keyboard rings."
            align="left"
            className="mb-8"
          />

          <SurfaceCard variant="editorial" className="space-y-8">
            {/* Primary & Secondary */}
            <div>
              <h4 className="font-serif text-lg font-medium text-[#292322] mb-3">
                Core Action Variants
              </h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="md">
                  Primary Action (Sindoor)
                </Button>
                <Button variant="secondary" size="md">
                  Secondary Action
                </Button>
                <Button variant="outline-gold" size="md">
                  Outline Gold
                </Button>
                <Button variant="outline-maroon" size="md">
                  Outline Maroon
                </Button>
                <Button variant="ghost" size="md">
                  Ghost Action
                </Button>
                <Button variant="link" size="md">
                  Editorial Link &rarr;
                </Button>
              </div>
            </div>

            {/* Sizing Scale */}
            <div className="pt-6 border-t border-[rgba(184,151,94,0.15)]">
              <h4 className="font-serif text-lg font-medium text-[#292322] mb-3">
                Size Scale (All Meet &gt;= 44px Minimum Mobile Touch Target)
              </h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="sm">
                  Small (44px target)
                </Button>
                <Button variant="primary" size="md">
                  Medium Standard (44px)
                </Button>
                <Button variant="primary" size="lg">
                  Large Prominent (48px)
                </Button>
              </div>
            </div>

            {/* States: Loading & Disabled */}
            <div className="pt-6 border-t border-[rgba(184,151,94,0.15)]">
              <h4 className="font-serif text-lg font-medium text-[#292322] mb-3">
                Component States
              </h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="md" isLoading>
                  Submitting RSVP
                </Button>
                <Button variant="outline-gold" size="md" isLoading>
                  Processing
                </Button>
                <Button variant="primary" size="md" disabled>
                  Disabled Primary
                </Button>
                <Button variant="secondary" size="md" disabled>
                  Disabled Secondary
                </Button>
              </div>
            </div>
          </SurfaceCard>
        </section>

        {/* Section 5: Surface Cards */}
        <section className="mb-16 sm:mb-24" aria-labelledby="section-surfaces">
          <SectionHeading
            kicker="Spatial Architecture"
            title="Surface Cards & Elevation"
            subtitle="Tiered surface hierarchy utilizing refined shadows and subtle gold hairlines."
            align="left"
            className="mb-8"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SurfaceCard variant="editorial" hoverEffect>
              <SectionKicker variant="gold" className="mb-2">
                Editorial Pure
              </SectionKicker>
              <h3 className="font-serif text-xl font-medium text-[#292322] mb-2">
                Pure Editorial Card
              </h3>
              <p className="text-sm text-[#5C5452] leading-relaxed mb-4">
                Crisp white base with hairline gold border and subtle diffuse luxury shadow.
                Includes interactive hover elevation lift.
              </p>
              <Button variant="outline-gold" size="sm">
                Explore Details
              </Button>
            </SurfaceCard>

            <SurfaceCard variant="soft" hoverEffect>
              <SectionKicker variant="maroon" className="mb-2">
                Soft Champagne
              </SectionKicker>
              <h3 className="font-serif text-xl font-medium text-[#292322] mb-2">
                Secondary Surface
              </h3>
              <p className="text-sm text-[#5C5452] leading-relaxed mb-4">
                Warm champagne tone creating subtle visual rhythm and hierarchy between primary content blocks.
              </p>
              <Button variant="secondary" size="sm">
                View Schedule
              </Button>
            </SurfaceCard>

            <SurfaceCard variant="dramatic" hoverEffect>
              <SectionKicker variant="gold" className="mb-2">
                Evening Luxury
              </SectionKicker>
              <h3 className="font-serif text-xl font-medium text-white mb-2">
                Dramatic Maroon Card
              </h3>
              <p className="text-sm text-[#F7F1E6]/85 leading-relaxed mb-4">
                High-contrast regal maroon reserved for evening celebrations, private reception highlights, and VIP announcements.
              </p>
              <Button variant="primary" size="sm">
                Evening Reception
              </Button>
            </SurfaceCard>

            <SurfaceCard variant="outlined" hoverEffect>
              <SectionKicker variant="sindoor" className="mb-2">
                Clean Boundary
              </SectionKicker>
              <h3 className="font-serif text-xl font-medium text-[#292322] mb-2">
                Outlined Card
              </h3>
              <p className="text-sm text-[#5C5452] leading-relaxed mb-4">
                Transparent container framed with 1px antique gold border, ideal for un-nested metadata and clean lists.
              </p>
              <Button variant="ghost" size="sm">
                Read More &rarr;
              </Button>
            </SurfaceCard>
          </div>
        </section>

        {/* Section 6: Form Controls & Inputs */}
        <section className="mb-16 sm:mb-24" aria-labelledby="section-forms">
          <SectionHeading
            kicker="Accessible Form Architecture"
            title="Form Controls & Inputs"
            subtitle="Built with explicit label associations, ARIA error references, and high-visibility focus states."
            align="left"
            className="mb-8"
          />

          <SurfaceCard variant="editorial">
            <form className="max-w-2xl space-y-6" action="#">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Guest Full Name"
                  placeholder="e.g. Priyanshu Sharma"
                  helperText="As printed on your formal wedding invitation"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="priyanshu@example.com"
                  defaultValue="mithun.guest@wedding.com"
                  helperText="For ceremony updates and digital pass"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Phone / WhatsApp"
                  placeholder="+91 98765 43210"
                  error="Please provide a valid 10-digit mobile number"
                  defaultValue="12345"
                  required
                />
                <Input
                  label="Dietary Preferences (Optional)"
                  placeholder="e.g. Pure Vegetarian, Jain"
                  helperText="Let our catering team know your preferences"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Table Allocation (Admin Only)"
                  defaultValue="Table 4 — Royal Mandap Wing"
                  disabled
                  helperText="Assigned automatically by the reception team"
                />
                <div className="flex flex-col justify-end">
                  <Button variant="primary" size="md" className="w-full sm:w-auto">
                    Confirm Attendance
                  </Button>
                </div>
              </div>
            </form>
          </SurfaceCard>
        </section>

        {/* Section 7: Section Heading Lockups */}
        <section className="mb-16 sm:mb-24" aria-labelledby="section-lockups">
          <SectionHeading
            kicker="Typography Lockups"
            title="Heading Configurations"
            subtitle="Pre-configured lockups combining kickers, display serif titles, and ornamental rules."
            align="left"
            className="mb-8"
          />

          <div className="space-y-12 bg-white p-8 sm:p-12 rounded-[6px] border border-[rgba(184,151,94,0.25)]">
            <div>
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-4 text-center">
                Center Aligned with Ceremonial Divider
              </span>
              <SectionHeading
                kicker="Auspicious Union"
                kickerVariant="gold"
                title="Mithun &amp; Sakhi"
                subtitle="Request the honour of your gracious presence at the celebration of their holy marriage."
                align="center"
                withDivider
              />
            </div>

            <div className="pt-8 border-t border-[rgba(184,151,94,0.15)]">
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-4">
                Left Aligned with Sindoor Kicker
              </span>
              <SectionHeading
                kicker="Ceremony Details"
                kickerVariant="sindoor"
                title="The Wedding Program"
                subtitle="Join us for three unforgettable days of cultural reverence, music, and celebration."
                align="left"
              />
            </div>

            <div className="pt-8 border-t border-[rgba(184,151,94,0.15)]">
              <span className="text-xs font-mono text-[#8A8280] uppercase tracking-wider block mb-4">
                Framed Kicker Lockup
              </span>
              <SectionHeading
                kicker="Digital Guestbook"
                kickerVariant="framed"
                title="Warm Wishes &amp; Blessings"
                subtitle="Share your prayers and heartfelt wishes for the newlyweds."
                align="left"
              />
            </div>
          </div>
        </section>

        {/* Footer info */}
        <footer className="pt-8 border-t border-[rgba(184,151,94,0.2)] text-center text-xs text-[#8A8280]">
          <p>
            Mithun &amp; Sakhi Wedding Design System &bull; Phase P-02 Foundation &bull; Internal Reference Only
          </p>
        </footer>
      </Container>
    </main>
  );
}
