export interface Ceremony {
  id: string;
  name: string;
  traditionalTitle?: string;
  tagline: string;
  dateString: string;
  formattedDate: string;
  timeString: string;
  isoTimestamp: string;
  venueName: string;
  address: string;
  mapUrl: string;
  description: string;
  ritualHighlights: string[];
  accentColor: "gold" | "sage" | "sindoor" | "maroon";
}

export interface Venue {
  id: string;
  title: string;
  subtitle: string;
  village: string;
  block: string;
  district: string;
  pinCode: string;
  fullAddress: string;
  mapUrl: string;
  associatedEvents: string[];
  note: string;
}

export const WEDDING_DATA = {
  couple: {
    groom: {
      firstName: "Mithun",
      fullName: "Mithun Gorain",
      father: "Mr. Kenaram Gorain",
      mother: "Ms. Savita Gorian",
      homeVillage: "Chitmu, Kotshila",
    },
    bride: {
      firstName: "Sakhi",
      fullName: "Sakhi Gorain",
      father: "Mr. Upen Gorain",
      mother: "Ms. Kokila Gorain",
      homeVillage: "Ghaghra, Jaipur",
    },
    displayTitle: "Mithun & Sakhi",
    weddingDatesDisplay: "19–22 November 2026",
    locationDisplay: "Purulia, West Bengal",
  },
  dates: {
    startDate: "2026-11-19",
    endDate: "2026-11-22",
    memoriesModeBoundary: "2026-11-23T00:00:00+05:30",
    timezone: "Asia/Kolkata",
    timezoneOffset: "+05:30",
  },
  contact: {
    rawPhone: "6295864148",
    formattedPhone: "+91 62958 64148",
    telHref: "tel:+916295864148",
    whatsAppHref:
      "https://wa.me/916295864148?text=Hello%20Mithun%20%26%20Sakhi%2C%20warm%20congratulations%20on%20your%20upcoming%20wedding!",
  },
  ceremonies: [
    {
      id: "haldi",
      name: "Haldi Ceremony",
      traditionalTitle: "Haldi Ceremony",
      tagline: "The Sacred Turmeric Blessing",
      dateString: "Thursday, 19 November 2026",
      formattedDate: "19 Nov 2026",
      timeString: "9:00 AM IST",
      isoTimestamp: "2026-11-19T09:00:00+05:30",
      venueName: "Groom's Home",
      address: "Chitmu, Kotshila, Purulia, West Bengal 723215",
      mapUrl: "https://maps.app.goo.gl/Lt8BRMxAEUy371NVA",
      description:
        "The auspicious commencement of the wedding rites. Fresh turmeric paste is lovingly applied by elders and family to invoke divine protection, radiant joy, and blessings.",
      ritualHighlights: ["Turmeric Anointment", "Family Blessings", "Traditional Music"],
      accentColor: "gold",
    },
    {
      id: "mehndi",
      name: "Mehndi Ceremony",
      traditionalTitle: "Mehndi Ceremony",
      tagline: "Celebration of Henna & Music",
      dateString: "Friday, 20 November 2026",
      formattedDate: "20 Nov 2026",
      timeString: "9:00 AM IST",
      isoTimestamp: "2026-11-20T09:00:00+05:30",
      venueName: "Groom's Home",
      address: "Chitmu, Kotshila, Purulia, West Bengal 723215",
      mapUrl: "https://maps.app.goo.gl/Lt8BRMxAEUy371NVA",
      description:
        "An exuberant gathering where intricate henna patterns are adorned onto hands amidst joyous folk melodies, sweet celebrations, and heartfelt laughter.",
      ritualHighlights: ["Intricate Henna Art", "Folk Melodies", "Festive Gathering"],
      accentColor: "sage",
    },
    {
      id: "wedding",
      name: "The Sacred Wedding",
      traditionalTitle: "The Sacred Wedding",
      tagline: "The Sacred Night Wedding Ceremony",
      dateString: "Saturday, 21 November 2026",
      formattedDate: "21 Nov 2026",
      timeString: "11:00 PM IST",
      isoTimestamp: "2026-11-21T23:00:00+05:30",
      venueName: "Bride's Home",
      address: "Ghaghra, Jaipur, Purulia, West Bengal 723201",
      mapUrl: "https://maps.app.goo.gl/x1zvibZRTMTNTWCn7",
      description:
        "The sacred Vedic marriage solemnized under the floral Mandap. Featuring Kanyadaan, Saat Phere around the holy Agni, and auspicious Sindoor Daan in the presence of loved ones.",
      ritualHighlights: ["Saat Phere (Seven Vows)", "Sindoor Daan", "Vedic Chants"],
      accentColor: "sindoor",
    },
    {
      id: "reception",
      name: "Reception",
      traditionalTitle: "Reception",
      tagline: "Celebratory Reception Banquet",
      dateString: "Sunday, 22 November 2026",
      formattedDate: "22 Nov 2026",
      timeString: "5:00 PM IST",
      isoTimestamp: "2026-11-22T17:00:00+05:30",
      venueName: "Groom's Home",
      address: "Chitmu, Kotshila, Purulia, West Bengal 723215",
      mapUrl: "https://maps.app.goo.gl/Lt8BRMxAEUy371NVA",
      description:
        "A grand celebration banquet welcoming the newlywed bride to the groom's family, seeking blessings from extended community, friends, and family over celebratory dining.",
      ritualHighlights: ["Grand Feast", "Blessings Ceremony", "Family Congratulations"],
      accentColor: "maroon",
    },
  ] as Ceremony[],
  venues: [
    {
      id: "groom-home",
      title: "Groom's Home",
      subtitle: "Chitmu, Kotshila",
      village: "Chitmu",
      block: "Kotshila",
      district: "Purulia",
      pinCode: "723215",
      fullAddress: "Chitmu, Kotshila, Purulia, West Bengal 723215",
      mapUrl: "https://maps.app.goo.gl/Lt8BRMxAEUy371NVA",
      associatedEvents: [
        "Haldi (19 Nov, 9:00 AM)",
        "Mehndi (20 Nov, 9:00 AM)",
        "Reception (22 Nov, 5:00 PM)",
      ],
      note: "Host venue for Haldi, Mehndi, and Reception celebrations.",
    },
    {
      id: "bride-home",
      title: "Bride's Home",
      subtitle: "Ghaghra, Jaipur",
      village: "Ghaghra",
      block: "Jaipur",
      district: "Purulia",
      pinCode: "723201",
      fullAddress: "Ghaghra, Jaipur, Purulia, West Bengal 723201",
      mapUrl: "https://maps.app.goo.gl/x1zvibZRTMTNTWCn7",
      associatedEvents: ["The Sacred Wedding (21 Nov, 11:00 PM)"],
      note: "Sacred venue for the Vedic Wedding ceremony, Saat Phere, and Sindoor Daan rituals.",
    },
  ] as Venue[],
};

export { isWeddingCutoffPassed, isMemoriesModeActive } from "@/lib/lifecycle";

