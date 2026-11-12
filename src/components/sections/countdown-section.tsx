"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionKicker } from "@/components/ui/section-kicker";
import { OrnamentalDivider } from "@/components/ui/ornamental-divider";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { getCurrentTimeMs, getKolkataDateString } from "@/lib/lifecycle";
import {
  CardCornerBrackets,
  CardMandalaWatermark,
  SectionHeaderFiligree,
} from "@/components/ui/decorative-surfaces";

const HALDI_TARGET_ISO = "2026-11-19T09:00:00+05:30";
const HALDI_TIMESTAMP = new Date(HALDI_TARGET_ISO).getTime();

interface WeddingTimeSnapshot {
  dateStr: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  mounted: boolean;
}

// Deterministic server snapshot for SSR prerendering (safe for Next.js 16)
const SERVER_SNAPSHOT: WeddingTimeSnapshot = {
  dateStr: "2026-10-27",
  days: 23,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isPast: false,
  mounted: false,
};

let currentClientSnapshot: WeddingTimeSnapshot = SERVER_SNAPSHOT;

function updateClientSnapshot() {
  const nowMs = getCurrentTimeMs();
  const diff = HALDI_TIMESTAMP - nowMs;
  const isPast = diff <= 0;
  const days = isPast ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = isPast ? 0 : Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = isPast ? 0 : Math.floor((diff / (1000 * 60)) % 60);
  const seconds = isPast ? 0 : Math.floor((diff / 1000) % 60);

  currentClientSnapshot = {
    dateStr: getKolkataDateString(nowMs),
    days,
    hours,
    minutes,
    seconds,
    isPast,
    mounted: true,
  };
}

function subscribeToTime(callback: () => void) {
  updateClientSnapshot();
  callback();

  const interval = setInterval(() => {
    updateClientSnapshot();
    callback();
  }, 1000);

  return () => clearInterval(interval);
}

function getSnapshot(): WeddingTimeSnapshot {
  return currentClientSnapshot;
}

function getServerSnapshot(): WeddingTimeSnapshot {
  return SERVER_SNAPSHOT;
}

export function CountdownSection() {
  const time = useSyncExternalStore(subscribeToTime, getSnapshot, getServerSnapshot);

  const currentDateStr = time.dateStr;
  const isPreWedding = currentDateStr < "2026-11-19";
  const isHaldiDay = currentDateStr === "2026-11-19";
  const isMehndiDay = currentDateStr === "2026-11-20";
  const isWeddingDay = currentDateStr === "2026-11-21";
  const isReceptionDay = currentDateStr === "2026-11-22";
  const isMemoriesMode = currentDateStr >= "2026-11-23";

  return (
    <section
      id="countdown"
      aria-labelledby="countdown-title"
      className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-[#FFFDF9] via-[#F7F1E6]/60 to-[#FFFDF9] border-y border-[rgba(184,151,94,0.25)] relative overflow-hidden"
    >
      <SectionHeaderFiligree color="#B8975E" opacity={0.16} />
      <Container size="reading" className="relative z-10">
        <Reveal className="flex flex-col items-center text-center">
          {/* Eyebrow Status Badge */}
          <div className="mb-3">
            {isMemoriesMode ? (
              <SectionKicker variant="maroon">Timeless Memories</SectionKicker>
            ) : isReceptionDay ? (
              <SectionKicker variant="maroon">Day 4 of 4 &bull; Reception Day</SectionKicker>
            ) : isWeddingDay ? (
              <SectionKicker variant="sindoor">Day 3 of 4 &bull; Auspicious Wedding Day</SectionKicker>
            ) : isMehndiDay ? (
              <SectionKicker variant="gold">Day 2 of 4 &bull; Mehndi Ceremony</SectionKicker>
            ) : isHaldiDay ? (
              <SectionKicker variant="gold">Day 1 of 4 &bull; Haldi Ceremony</SectionKicker>
            ) : (
              <SectionKicker variant="framed">The Auspicious Countdown</SectionKicker>
            )}
          </div>

          <h2
            id="countdown-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#292322] leading-tight"
          >
            {isMemoriesMode
              ? "Our Wedding Memories"
              : isReceptionDay
              ? "This Evening: The Grand Reception"
              : isWeddingDay
              ? "Tonight: The Sacred Wedding"
              : isMehndiDay
              ? "Today: The Joyous Mehndi Ceremony"
              : isHaldiDay
              ? "Today: The Auspicious Haldi Ceremony"
              : "Anticipating the Sacred Vows"}
          </h2>

          <p className="font-serif italic text-base sm:text-lg text-[#5C5452] mt-2 max-w-xl">
            {isMemoriesMode
              ? "With hearts full of gratitude and love, our four days of wedding rituals have concluded."
              : isReceptionDay
              ? "Welcoming family, friends, and elders to the grand celebratory banquet at Groom's Home (5:00 PM IST)."
              : isWeddingDay
              ? "Under the holy floral Mandap, Mithun & Sakhi unite in sacred Vedic matrimony at Bride's Home (11:00 PM IST)."
              : isMehndiDay
              ? "Henna patterns and folk melodies blossom as celebrations continue at Groom's Home (9:00 AM IST)."
              : isHaldiDay
              ? "The sacred turmeric purification ceremony commences the celebration at Groom's Home (9:00 AM IST)."
              : "Counting down to Thursday, 19 November 2026 at 9:00 AM IST in Purulia, West Bengal."}
          </p>

          <OrnamentalDivider variant="gold" size="sm" className="my-6" />

          {/* Conditional Countdown Display or Ceremony Banner */}
          {isPreWedding ? (
            <div className="relative w-full max-w-xl bg-gradient-to-b from-[#FCF9EE] to-[#FAF5E6] border border-[#B8975E]/35 rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(184,151,94,0.08)] overflow-hidden">
              {/* Corner Brackets & Watermark */}
              <CardCornerBrackets color="#B8975E" />
              <CardMandalaWatermark strokeColor="#B8975E" opacity={0.16} position="right" />

              <div className="relative z-10">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8E6D38] block mb-4">
                  Time Until Auspicious Haldi Opening
                </span>

                <div className="grid grid-cols-4 gap-1.5 xs:gap-2.5 sm:gap-4">
                  {/* Days */}
                  <div className="flex flex-col items-center p-2 xs:p-3 sm:p-4 rounded-xl bg-white/85 border border-[#B8975E]/30 shadow-2xs">
                    <span className="font-serif text-2xl xs:text-3xl sm:text-5xl font-medium text-[#292322]">
                      {time.mounted ? String(time.days).padStart(2, "0") : "--"}
                    </span>
                    <span className="text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-wider text-[#8A8280] mt-1 font-medium">
                      Days
                    </span>
                  </div>

                  {/* Hours */}
                  <div className="flex flex-col items-center p-2 xs:p-3 sm:p-4 rounded-xl bg-white/85 border border-[#B8975E]/30 shadow-2xs">
                    <span className="font-serif text-2xl xs:text-3xl sm:text-5xl font-medium text-[#292322]">
                      {time.mounted ? String(time.hours).padStart(2, "0") : "--"}
                    </span>
                    <span className="text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-wider text-[#8A8280] mt-1 font-medium">
                      Hours
                    </span>
                  </div>

                  {/* Minutes */}
                  <div className="flex flex-col items-center p-2 xs:p-3 sm:p-4 rounded-xl bg-white/85 border border-[#B8975E]/30 shadow-2xs">
                    <span className="font-serif text-2xl xs:text-3xl sm:text-5xl font-medium text-[#292322]">
                      {time.mounted ? String(time.minutes).padStart(2, "0") : "--"}
                    </span>
                    <span className="text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-wider text-[#8A8280] mt-1 font-medium">
                      Mins
                    </span>
                  </div>

                  {/* Seconds */}
                  <div className="flex flex-col items-center p-2 xs:p-3 sm:p-4 rounded-xl bg-white/85 border border-[#B8975E]/30 shadow-2xs">
                    <span className="font-serif text-2xl xs:text-3xl sm:text-5xl font-medium text-[#A52232]">
                      {time.mounted ? String(time.seconds).padStart(2, "0") : "--"}
                    </span>
                    <span className="text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-wider text-[#8A8280] mt-1 font-medium">
                      Secs
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[rgba(184,151,94,0.15)] flex flex-col sm:flex-row gap-1.5 sm:gap-0 items-center justify-between text-xs text-[#8A8280] text-center sm:text-left">
                  <span>Standard Reference: Asia/Kolkata (IST)</span>
                  <span className="text-[#A52232] font-medium">19 Nov, 9:00 AM IST</span>
                </div>
              </div>
            </div>
          ) : isMemoriesMode ? (
            <div className="w-full max-w-xl bg-white border border-[rgba(72,25,35,0.3)] rounded-[6px] p-6 sm:p-8 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#481923] block mb-2">
                Memories Archive Active
              </span>
              <p className="text-sm text-[#292322] leading-relaxed">
                The photographs and wedding film memories from Mithun &amp; Sakhi&apos;s sacred rituals are being curated for this eternal archive.
              </p>
              <div className="mt-4">
                <Link href="#gallery">
                  <Button variant="outline-maroon" size="sm">
                    View Memories Preview &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-xl bg-white border border-[rgba(165,34,50,0.35)] rounded-[6px] p-6 sm:p-8 shadow-[0_8px_30px_-4px_rgba(165,34,50,0.08)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A52232] block mb-2">
                Celebration In Progress &bull; Asia/Kolkata
              </span>
              <p className="text-sm text-[#292322] leading-relaxed">
                Today&apos;s sacred rituals are actively underway. Guests are invited to review directions and timings below.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Link href="#ceremonies">
                  <Button variant="primary" size="sm">
                    View Schedule Details
                  </Button>
                </Link>
                <Link href="#venues">
                  <Button variant="outline-gold" size="sm">
                    Venue Navigation
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
