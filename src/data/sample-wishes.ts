import type { ApprovedWish } from "@/components/sections/wishes-preview-wall";

/**
 * 10 Realistic sample wishes for development / visual preview.
 * Strictly used when database contains 0 approved public wishes in non-production environments.
 * These are never persisted into the production database.
 */
export const SAMPLE_WISHES_FIXTURES: ApprovedWish[] = [
  {
    id: "sample-wish-01",
    author_display_name: "Sunil & Anita Mukherjee",
    wish_text:
      "May your journey together be filled with endless happiness, unconditional love, and beautiful memories. Wishing you both a lifetime of togetherness!",
    created_at: "2026-11-08T10:30:00.000Z",
  },
  {
    id: "sample-wish-02",
    author_display_name: "Dr. B. K. Roy",
    wish_text:
      "Wishing dearest Mithun & Sakhi a lifetime of togetherness, joyous laughter, and divine blessings as you begin this sacred Vedic union in Purulia.",
    created_at: "2026-11-08T12:15:00.000Z",
  },
  {
    id: "sample-wish-03",
    author_display_name: "Debashis & Sharmila Sen",
    wish_text:
      "May the sacred bond you share today grow stronger with each passing year. May your home always be illuminated with peace, prosperity, and joy.",
    created_at: "2026-11-08T14:45:00.000Z",
  },
  {
    id: "sample-wish-04",
    author_display_name: "Priya Sharma & Family",
    wish_text:
      "Two wonderful souls coming together! Sending our deepest blessings and warmest prayers for a joyous marriage and heartfelt celebrations.",
    created_at: "2026-11-08T16:20:00.000Z",
  },
  {
    id: "sample-wish-05",
    author_display_name: "Alok & Rina Ganguly",
    wish_text:
      "Heartfelt congratulations to dearest Mithun and Sakhi! May the divine light guide every step of your sacred marriage through all seasons of life.",
    created_at: "2026-11-08T18:05:00.000Z",
  },
  {
    id: "sample-wish-06",
    author_display_name: "Sanjay Gorain & Family",
    wish_text:
      "May every new chapter bring peace, prosperity, and countless reasons to smile. Heartiest congratulations to both the Gorain families!",
    created_at: "2026-11-09T08:10:00.000Z",
  },
  {
    id: "sample-wish-07",
    author_display_name: "Meenakshi Dutta",
    wish_text:
      "Sending heartfelt blessings for a beautiful and joyful married life. May your union be blessed with endless companionship, deep respect, and harmony.",
    created_at: "2026-11-09T09:30:00.000Z",
  },
  {
    id: "sample-wish-08",
    author_display_name: "The Banerjee Family",
    wish_text:
      "May your love story be blessed with eternal happiness, shared dreams, and wonderful adventures together. With all our love and warm prayers.",
    created_at: "2026-11-09T11:40:00.000Z",
  },
  {
    id: "sample-wish-09",
    author_display_name: "Kalyan & Supriya Mondal",
    wish_text:
      "A marriage solemnized under sacred Vedic mantras! Wishing Mithun and Sakhi boundless bliss, good health, and enduring fortune on this auspicious wedding.",
    created_at: "2026-11-09T13:25:00.000Z",
  },
  {
    id: "sample-wish-10",
    author_display_name: "Anirban Sengupta",
    wish_text:
      "Heartiest congratulations Mithun & Sakhi! May the celebrations in Purulia be filled with music, laughter, and timeless memories.",
    created_at: "2026-11-09T15:50:00.000Z",
  },
];

/**
 * Returns the effective public wishes collection.
 * If database contains real approved wishes, always return real approved wishes.
 * If 0 approved wishes exist and we are in development mode, return demo preview fixtures.
 * If 0 approved wishes exist in production, return an empty array to show the empty state.
 */
export function getPublicWishes(realApprovedWishes: ApprovedWish[] = []): {
  wishes: ApprovedWish[];
  isDemoSample: boolean;
} {
  if (realApprovedWishes && realApprovedWishes.length > 0) {
    return { wishes: realApprovedWishes, isDemoSample: false };
  }

  // Development / Preview mode fixture support
  if (process.env.NODE_ENV !== "production") {
    return { wishes: SAMPLE_WISHES_FIXTURES, isDemoSample: true };
  }

  return { wishes: [], isDemoSample: false };
}
