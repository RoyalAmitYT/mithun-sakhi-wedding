"use client";

import React from "react";
import {
  CardCornerBracket,
  BackgroundMandalaWatermark,
  RolePlaqueBanner,
  ArchedPortraitFrame,
  DecorativeDiamondDivider,
  ParentsIcon,
  ResidencePinIcon,
  ProfileBlessingFooter,
} from "./profile-card-ornaments";
import type { ProfileCardData } from "./profile-card-theme";

export interface ProfileCardProps {
  data: ProfileCardData;
  className?: string;
}

export function ProfileCard({ data, className = "" }: ProfileCardProps) {
  const { role, roleLabel, name, imageSrc, imageAlt, quote, parents, residence, blessing, theme } =
    data;

  const clipId = `jharokha-clip-${role}`;

  return (
    <article
      aria-labelledby={`${role}-card-title`}
      className={`relative w-full h-full flex flex-col justify-between rounded-[28px] sm:rounded-[32px] border overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_22px_52px_rgba(0,0,0,0.13)] transition-all duration-500 group select-text ${theme.bgCardGradient} ${className}`}
      style={{
        borderColor: theme.hairlineBorder,
      }}
    >
      {/* =====================================================================
          1. DECORATIVE CARD SURFACES & ORNAMENTAL WATERMARKS
          ===================================================================== */}
      {/* Inset Hairline Double Border Frame */}
      <div
        className="absolute inset-[5px] sm:inset-[6px] rounded-[24px] sm:rounded-[27px] pointer-events-none z-10 border"
        style={{ borderColor: theme.innerBorder }}
        aria-hidden="true"
      />

      {/* Four Ornate Corner Brackets */}
      <CardCornerBracket position="top-left" color={theme.primaryAccent} />
      <CardCornerBracket position="top-right" color={theme.primaryAccent} />
      <CardCornerBracket position="bottom-left" color={theme.primaryAccent} />
      <CardCornerBracket position="bottom-right" color={theme.primaryAccent} />

      {/* Dual Radial Mandala Linework Watermarks (Left & Right Background) */}
      <BackgroundMandalaWatermark color={theme.mandalaStroke} position="right" />
      <BackgroundMandalaWatermark color={theme.mandalaStroke} position="left" />

      {/* Soft Center Radial Illumination behind Portrait */}
      <div
        className="absolute top-[28%] sm:top-[32%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-35 -z-0"
        style={{ backgroundColor: theme.secondaryAccent }}
        aria-hidden="true"
      />

      {/* =====================================================================
          2. TOP ROLE PLAQUE (Crowns the card symmetrically on all viewports)
          ===================================================================== */}
      <div className="relative z-20 pt-4 xs:pt-5 sm:pt-6 pb-1 w-full flex justify-center">
        <RolePlaqueBanner
          label={roleLabel}
          bgColor={theme.rolePlaqueBg}
          textColor={theme.rolePlaqueText}
          borderColor={theme.rolePlaqueBorder}
          wingColor={theme.primaryAccent}
        />
      </div>

      {/* =====================================================================
          3. MAIN RESPONSIVE CARD CONTENT CONTAINER
             - Mobile & Tablet (< xl): Vertical single-column stack matching reference image
             - Desktop (≥ xl): Horizontal split with Arched Portrait (Left) & Info (Right)
          ===================================================================== */}
      <div className="relative z-20 w-full flex flex-col xl:flex-row gap-4 sm:gap-5 xl:gap-8 items-center xl:items-center px-4 xs:px-5 sm:px-6 md:px-7 lg:px-6 xl:px-8 pt-1 xs:pt-2 sm:pt-3 pb-2 flex-1">
        {/* -----------------------------------------------------------------
            COLUMN A: THE GRAND ARCHED PORTRAIT
            ----------------------------------------------------------------- */}
        <div className="w-full xl:w-[38%] 2xl:w-[36%] shrink-0 flex flex-col items-center justify-center">
          <ArchedPortraitFrame
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            primaryGold={theme.primaryAccent}
            secondaryGold={theme.secondaryAccent}
            flowerPetalPrimary={theme.flowerPetalPrimary}
            flowerPetalSecondary={theme.flowerPetalSecondary}
            clipId={clipId}
          />
        </div>

        {/* -----------------------------------------------------------------
            COLUMN B: PERSONAL DETAILS, QUOTE & INFORMATION CAPSULES
            ----------------------------------------------------------------- */}
        <div className="w-full xl:w-[62%] 2xl:w-[64%] flex flex-col items-center xl:items-start text-center xl:text-left min-w-0">
          {/* Person's Name */}
          <h3
            id={`${role}-card-title`}
            className="font-serif text-[2.2rem] xs:text-[2.45rem] sm:text-[2.75rem] xl:text-[2.65rem] font-normal tracking-tight leading-[1.08] mt-1 xl:mt-0 mb-0.5 select-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
            style={{ color: theme.nameColor }}
          >
            {name}
          </h3>

          {/* Decorative Diamond Divider */}
          <div className="w-full flex justify-center xl:justify-start">
            <DecorativeDiamondDivider color={theme.primaryAccent} />
          </div>

          {/* Personal Quote with Decorative Golden Quote Marks */}
          <div className="relative w-full max-w-[340px] xs:max-w-[370px] sm:max-w-md xl:max-w-none my-1 sm:my-1.5 px-3 xl:px-0">
            {/* Opening Quote Mark */}
            <span
              className="font-serif text-3xl sm:text-4xl leading-none absolute -top-1 -left-1 select-none pointer-events-none opacity-85"
              style={{ color: theme.quoteMarkColor }}
              aria-hidden="true"
            >
              &ldquo;
            </span>

            {/* Quote Body */}
            <p
              className="font-serif italic text-[12.5px] xs:text-[13px] sm:text-[13.5px] xl:text-[13.5px] leading-relaxed select-text px-4 xl:px-3"
              style={{ color: theme.quoteColor }}
            >
              {quote}
            </p>

            {/* Closing Quote Mark */}
            <span
              className="font-serif text-3xl sm:text-4xl leading-none absolute -bottom-3 right-0 select-none pointer-events-none opacity-85"
              style={{ color: theme.quoteMarkColor }}
              aria-hidden="true"
            >
              &rdquo;
            </span>
          </div>

          {/* -------------------------------------------------------------
              INFORMATION CAPSULE 1: BELOVED PARENTS
              ------------------------------------------------------------- */}
          <div
            className="w-full rounded-2xl p-2.5 xs:p-3 sm:p-3.5 mt-3 sm:mt-3.5 border shadow-xs transition-all duration-300"
            style={{
              background: theme.capsuleBg,
              borderColor: theme.capsuleBorder,
              boxShadow:
                "inset 0 1px 1px rgba(255,255,255,0.7), 0 3px 10px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-2.5 xs:gap-3">
              {/* Left Side: Icon & Label */}
              <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
                <ParentsIcon color={theme.primaryAccent} />
                <span
                  className="font-sans font-bold text-[9px] xs:text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] whitespace-nowrap"
                  style={{ color: theme.capsuleLabelColor }}
                >
                  {parents.label}
                </span>
              </div>

              {/* Vertical Gold Divider */}
              <div
                className="w-[1px] h-8 shrink-0 opacity-60"
                style={{ backgroundColor: theme.primaryAccent }}
                aria-hidden="true"
              />

              {/* Right Side: Parent Names */}
              <div className="flex-1 text-left min-w-0">
                <p
                  className="font-serif text-[13px] xs:text-[13.5px] sm:text-[14.5px] xl:text-[14px] font-medium leading-snug select-text whitespace-nowrap"
                  style={{ color: theme.capsuleTextColor }}
                >
                  {parents.father}
                </p>
                <p
                  className="font-serif text-[13px] xs:text-[13.5px] sm:text-[14.5px] xl:text-[14px] font-medium leading-snug select-text mt-0.5 whitespace-nowrap"
                  style={{ color: theme.capsuleTextColor }}
                >
                  {parents.mother}
                </p>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              INFORMATION CAPSULE 2: RESIDENCE & PIN
              ------------------------------------------------------------- */}
          <div
            className="w-full rounded-2xl p-2.5 xs:p-3 sm:p-3.5 mt-2.5 sm:mt-3 border shadow-xs transition-all duration-300"
            style={{
              background: theme.capsuleBg,
              borderColor: theme.capsuleBorder,
              boxShadow:
                "inset 0 1px 1px rgba(255,255,255,0.7), 0 3px 10px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-2.5 xs:gap-3">
              {/* Left Side: Pin Icon */}
              <div className="flex items-center justify-center shrink-0">
                <ResidencePinIcon color={theme.primaryAccent} />
              </div>

              {/* Vertical Gold Divider */}
              <div
                className="w-[1px] h-8 shrink-0 opacity-60"
                style={{ backgroundColor: theme.primaryAccent }}
                aria-hidden="true"
              />

              {/* Right Side: Residence Heading & PIN */}
              <div className="flex-1 text-left min-w-0">
                <p
                  className="font-sans font-bold text-[10px] xs:text-[10.5px] sm:text-[11.5px] xl:text-[11px] uppercase tracking-[0.14em] leading-snug select-text whitespace-nowrap"
                  style={{ color: theme.capsuleLabelColor }}
                >
                  {residence.location}
                </p>
                <p
                  className="font-sans text-[9.5px] xs:text-[10px] sm:text-[11px] xl:text-[10.5px] leading-snug select-text mt-0.5 whitespace-nowrap"
                  style={{ color: theme.capsuleSubtextColor }}
                >
                  {residence.subtext}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. SCULPTED BOTTOM PLINTH WITH GOLDEN LOTUS & BLESSING
          ===================================================================== */}
      <ProfileBlessingFooter
        blessing={blessing}
        bgGradient={theme.bottomWaveGradient}
        goldBorder={theme.bottomWaveBorder}
        primaryGold={theme.primaryAccent}
        secondaryGold={theme.secondaryAccent}
        glowColor={theme.lotusGlow}
      />
    </article>
  );
}
