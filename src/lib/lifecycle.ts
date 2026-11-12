/**
 * Wedding Lifecycle & Memories Mode Engine (Phase P-14)
 * Authoritative lifecycle state machine evaluated in Asia/Kolkata (+05:30)
 * Acceptance Criteria: TC-MEM-01, TC-MEM-02
 */

export const MEMORIES_MODE_BOUNDARY_ISO = "2026-11-23T00:00:00+05:30";
export const MEMORIES_MODE_BOUNDARY_UTC = "2026-11-22T18:30:00Z";
export const MEMORIES_MODE_BOUNDARY_MS = new Date(MEMORIES_MODE_BOUNDARY_ISO).getTime();

/**
 * Authoritative Main Wedding Ceremony Target (Phase P-15.2.3)
 * Target: 21 November 2026, 11:00 PM IST (Asia/Kolkata)
 * UTC Instant: 2026-11-21T17:30:00Z
 */
export const WEDDING_CEREMONY_TARGET_ISO = "2026-11-21T23:00:00+05:30";
export const WEDDING_CEREMONY_TARGET_UTC = "2026-11-21T17:30:00Z";
export const WEDDING_CEREMONY_TARGET_MS = new Date(WEDDING_CEREMONY_TARGET_ISO).getTime();

export interface WeddingCountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isWeddingArrived: boolean;
  isMemoriesMode: boolean;
  targetIso: string;
  targetUtc: string;
  targetFormatted: string;
}

export function getWeddingCountdown(
  simulatedTime?: Date | number | string
): WeddingCountdownData {
  const nowMs = getCurrentTimeMs(simulatedTime);
  const diff = WEDDING_CEREMONY_TARGET_MS - nowMs;
  const isPast = diff <= 0;
  const isWeddingArrived = isPast;
  const isMemoriesMode = nowMs >= MEMORIES_MODE_BOUNDARY_MS;

  const days = isPast ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = isPast ? 0 : Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = isPast ? 0 : Math.floor((diff / (1000 * 60)) % 60);
  const seconds = isPast ? 0 : Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast,
    isWeddingArrived,
    isMemoriesMode,
    targetIso: WEDDING_CEREMONY_TARGET_ISO,
    targetUtc: WEDDING_CEREMONY_TARGET_UTC,
    targetFormatted: "21 November 2026 · 11:00 PM IST",
  };
}

export type WeddingLifecycleState =
  | "pre_wedding"
  | "haldi_day"
  | "mehndi_day"
  | "wedding_day"
  | "reception_day"
  | "memories_mode";

/**
 * Returns current timestamp in ms, respecting deterministic simulation
 * strictly in non-production environments (TC-MEM-01).
 */
export function getCurrentTimeMs(simulatedTime?: Date | number | string): number {
  if (simulatedTime !== undefined) {
    return new Date(simulatedTime).getTime();
  }

  if (process.env.NODE_ENV !== "production" && process.env.TEST_SIMULATED_TIME) {
    return new Date(process.env.TEST_SIMULATED_TIME).getTime();
  }

  return Date.now();
}

/**
 * Returns calendar date string (YYYY-MM-DD) evaluated in Asia/Kolkata timezone.
 */
export function getKolkataDateString(timeMs?: number): string {
  const d = new Date(timeMs ?? getCurrentTimeMs());
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(d);
  } catch {
    // Fallback: manual offset calculation (+5 hours 30 minutes)
    const istMs = d.getTime() + 5.5 * 3600 * 1000;
    return new Date(istMs).toISOString().slice(0, 10);
  }
}

/**
 * Evaluates the authoritative wedding lifecycle state.
 */
export function getWeddingLifecycleState(
  simulatedTime?: Date | number | string
): WeddingLifecycleState {
  const timeMs = getCurrentTimeMs(simulatedTime);

  // 1. Memories Mode Cutoff: 23 November 2026, 00:00:00 IST (22 Nov 18:30:00 UTC)
  if (timeMs >= MEMORIES_MODE_BOUNDARY_MS) {
    return "memories_mode";
  }

  const dateStr = getKolkataDateString(timeMs);

  // 2. Ceremonial Days (19 to 22 November 2026 in Asia/Kolkata)
  if (dateStr === "2026-11-22") {
    return "reception_day";
  }
  if (dateStr === "2026-11-21") {
    return "wedding_day";
  }
  if (dateStr === "2026-11-20") {
    return "mehndi_day";
  }
  if (dateStr === "2026-11-19") {
    return "haldi_day";
  }

  // 3. Pre-wedding anticipation phase
  return "pre_wedding";
}

/**
 * Checks whether the wedding celebration has transitioned into Memories Mode.
 */
export function isMemoriesModeActive(simulatedTime?: Date | number | string): boolean {
  return getCurrentTimeMs(simulatedTime) >= MEMORIES_MODE_BOUNDARY_MS;
}

/**
 * Canonical synonym for backward compatibility across server actions and components.
 */
export function isWeddingCutoffPassed(simulatedTime?: Date | number | string): boolean {
  return isMemoriesModeActive(simulatedTime);
}

/**
 * Hero section editorial narrative configuration tailored to active lifecycle state.
 */
export function getHeroLifecycleNarrative(state: WeddingLifecycleState) {
  switch (state) {
    case "memories_mode":
      return {
        kicker: "Eternal Wedding Chronicle",
        titlePrefix: "Our Wedding",
        titleHighlight: "Memories",
        subtitle:
          "With deep reverence, gratitude, and joy, our sacred Vedic wedding rituals have concluded. Explore the published photographs, ceremonial films, and heartfelt blessings.",
        primaryCtaText: "Explore Memories Gallery →",
        primaryCtaHref: "/gallery",
        secondaryCtaText: "Read Guest Blessings",
        secondaryCtaHref: "/#wishes",
        isMemories: true,
      };

    case "reception_day":
      return {
        kicker: "Today • Day 4 of 4 • Purulia",
        titlePrefix: "The Grand",
        titleHighlight: "Reception",
        subtitle:
          "Welcoming extended family, community elders, and dear friends to the grand celebratory banquet at Groom's Home (5:00 PM IST).",
        primaryCtaText: "View Today's Reception →",
        primaryCtaHref: "/#ceremonies",
        secondaryCtaText: "Venue Navigation",
        secondaryCtaHref: "/#venues",
        isMemories: false,
      };

    case "wedding_day":
      return {
        kicker: "Tonight • Day 3 of 4 • Purulia",
        titlePrefix: "The Sacred",
        titleHighlight: "Wedding",
        subtitle:
          "Under the floral Mandap, Mithun & Sakhi solemnize their Vedic marriage with Saat Phere and Sindoor Daan at Bride's Home (11:00 PM IST).",
        primaryCtaText: "View Wedding Schedule →",
        primaryCtaHref: "/#ceremonies",
        secondaryCtaText: "Venue Navigation",
        secondaryCtaHref: "/#venues",
        isMemories: false,
      };

    case "mehndi_day":
      return {
        kicker: "Today • Day 2 of 4 • Purulia",
        titlePrefix: "The Joyous",
        titleHighlight: "Mehndi Ceremony",
        subtitle:
          "Intricate henna patterns bloom amidst folk melodies and celebratory laughter as festivities continue at Groom's Home (9:00 AM IST).",
        primaryCtaText: "View Mehndi Schedule →",
        primaryCtaHref: "/#ceremonies",
        secondaryCtaText: "Venue Navigation",
        secondaryCtaHref: "/#venues",
        isMemories: false,
      };

    case "haldi_day":
      return {
        kicker: "Today • Day 1 of 4 • Purulia",
        titlePrefix: "The Auspicious",
        titleHighlight: "Haldi Ceremony",
        subtitle:
          "The sacred turmeric purification ceremony commences our four-day celebration with family blessings at Groom's Home (9:00 AM IST).",
        primaryCtaText: "View Haldi Schedule →",
        primaryCtaHref: "/#ceremonies",
        secondaryCtaText: "Venue Navigation",
        secondaryCtaHref: "/#venues",
        isMemories: false,
      };

    case "pre_wedding":
    default:
      return {
        kicker: "The Sacred Wedding Celebration",
        titlePrefix: "Mithun",
        titleHighlight: "& Sakhi",
        subtitle:
          "With our families' blessings, two hearts begin a timeless journey— united by sacred Vedic vows and a love to cherish forever.",
        primaryCtaText: "Explore Celebrations",
        primaryCtaHref: "/#celebrations",
        secondaryCtaText: "View Invitation",
        secondaryCtaHref: "/#invitation",
        isMemories: false,
      };
  }
}

/**
 * Returns ceremony day status badge based on active lifecycle state.
 */
export function getCeremonyStatusBadge(
  ceremonyDateStr: string,
  currentState: WeddingLifecycleState
): { label: string; variant: "gold" | "sindoor" | "maroon" | "framed" } {
  if (currentState === "memories_mode") {
    return { label: "Solemnized with Vedic Blessings", variant: "maroon" };
  }

  const ceremonyToStateMap: Record<string, WeddingLifecycleState> = {
    "2026-11-19": "haldi_day",
    "2026-11-20": "mehndi_day",
    "2026-11-21": "wedding_day",
    "2026-11-22": "reception_day",
  };

  const targetState = ceremonyToStateMap[ceremonyDateStr];

  if (targetState === currentState) {
    return { label: "Today's Sacred Ritual", variant: "sindoor" };
  }

  const stateOrder = [
    "pre_wedding",
    "haldi_day",
    "mehndi_day",
    "wedding_day",
    "reception_day",
    "memories_mode",
  ];
  const currentIndex = stateOrder.indexOf(currentState);
  const targetIndex = stateOrder.indexOf(targetState || "pre_wedding");

  if (currentIndex > targetIndex) {
    return { label: "Ritual Concluded", variant: "framed" };
  }

  return { label: "Upcoming Ceremony", variant: "gold" };
}
