export interface ProfileCardData {
  role: "groom" | "bride";
  roleLabel: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  quote: string;
  parents: {
    label: string;
    father: string;
    mother: string;
  };
  residence: {
    location: string;
    subtext: string;
  };
  blessing: string;
  theme: {
    bgCardGradient: string;
    bgParchment: string;
    primaryAccent: string;
    secondaryAccent: string;
    hairlineBorder: string;
    innerBorder: string;
    nameColor: string;
    rolePlaqueBg: string;
    rolePlaqueText: string;
    rolePlaqueBorder: string;
    quoteColor: string;
    quoteMarkColor: string;
    capsuleBg: string;
    capsuleBorder: string;
    capsuleLabelColor: string;
    capsuleTextColor: string;
    capsuleSubtextColor: string;
    flowerPetalPrimary: string;
    flowerPetalSecondary: string;
    bottomWaveGradient: string;
    bottomWaveBorder: string;
    lotusGlow: string;
    mandalaStroke: string;
    ambientHalo: string;
  };
}

export const GROOM_PROFILE_DATA: ProfileCardData = {
  role: "groom",
  roleLabel: "THE GROOM",
  name: "Mithun Gorain",
  imageSrc: "/images/portraits/mithun-groom-portrait.webp",
  imageAlt: "Mithun Gorain — Groom Portrait",
  quote:
    "Rooted in family values and cherished traditions, Mithun carries forward the warmth of his family's heritage as he begins a beautiful new chapter of life.",
  parents: {
    label: "BELOVED PARENTS",
    father: "Mr. Kenaram Gorain",
    mother: "& Mrs. Savita Gorain",
  },
  residence: {
    location: "CHITMU • KOTSHILA • PURULIA",
    subtext: "Family Residence • PIN 723215",
  },
  blessing:
    "With ancestral blessings and the love of our kin, we celebrate this sacred union.",
  theme: {
    bgCardGradient: "bg-gradient-to-b from-[#FFFDF8] via-[#FFF9E9] to-[#F8EED6]",
    bgParchment: "#FFF9E9",
    primaryAccent: "#B58A32",
    secondaryAccent: "#E6C77E",
    hairlineBorder: "#B58A32",
    innerBorder: "rgba(181, 138, 50, 0.45)",
    nameColor: "#641C27",
    rolePlaqueBg: "linear-gradient(180deg, #7A1426 0%, #540E1B 100%)",
    rolePlaqueText: "#FFE8A3",
    rolePlaqueBorder: "#E6C77E",
    quoteColor: "#33251F",
    quoteMarkColor: "#B58A32",
    capsuleBg:
      "linear-gradient(135deg, rgba(255, 251, 240, 0.88) 0%, rgba(248, 238, 214, 0.78) 100%)",
    capsuleBorder: "rgba(181, 138, 50, 0.35)",
    capsuleLabelColor: "#641C27",
    capsuleTextColor: "#292322",
    capsuleSubtextColor: "#665248",
    flowerPetalPrimary: "#A81E32",
    flowerPetalSecondary: "#7A1426",
    bottomWaveGradient: "linear-gradient(180deg, #641C27 0%, #48111B 55%, #2B060E 100%)",
    bottomWaveBorder: "#E6C77E",
    lotusGlow: "rgba(212, 175, 55, 0.45)",
    mandalaStroke: "#B58A32",
    ambientHalo: "#D4AF37",
  },
};

export const BRIDE_PROFILE_DATA: ProfileCardData = {
  role: "bride",
  roleLabel: "THE BRIDE",
  name: "Sakhi Gorain",
  imageSrc: "/images/portraits/sakhi-bride-portrait.webp",
  imageAlt: "Sakhi Gorain — Bride Portrait",
  quote:
    "Graceful in spirit and deeply connected to her family and traditions, Sakhi steps into a new journey filled with love, togetherness and beautiful possibilities.",
  parents: {
    label: "BELOVED PARENTS",
    father: "Mr. Upen Gorain",
    mother: "& Ms. Kokila Gorain",
  },
  residence: {
    location: "GHAGHRA • JAIPUR • PURULIA",
    subtext: "Family Residence • PIN 723201",
  },
  blessing:
    "May every step forward together bring timeless peace, joy, and prosperity.",
  theme: {
    bgCardGradient: "bg-gradient-to-b from-[#FFFDFD] via-[#FFF5F4] to-[#FCE9E9]",
    bgParchment: "#FFF5F4",
    primaryAccent: "#BD8589",
    secondaryAccent: "#EAC2C5",
    hairlineBorder: "#BD8589",
    innerBorder: "rgba(189, 133, 137, 0.45)",
    nameColor: "#981F35",
    rolePlaqueBg: "linear-gradient(180deg, #981F35 0%, #6E1223 100%)",
    rolePlaqueText: "#FFF5F4",
    rolePlaqueBorder: "#EAC2C5",
    quoteColor: "#48262B",
    quoteMarkColor: "#BD8589",
    capsuleBg:
      "linear-gradient(135deg, rgba(255, 248, 248, 0.88) 0%, rgba(252, 233, 233, 0.78) 100%)",
    capsuleBorder: "rgba(189, 133, 137, 0.35)",
    capsuleLabelColor: "#981F35",
    capsuleTextColor: "#292322",
    capsuleSubtextColor: "#705055",
    flowerPetalPrimary: "#D97D89",
    flowerPetalSecondary: "#BD5C6A",
    bottomWaveGradient: "linear-gradient(180deg, #8E1B29 0%, #6A1220 55%, #3E0711 100%)",
    bottomWaveBorder: "#EAC2C5",
    lotusGlow: "rgba(220, 140, 150, 0.45)",
    mandalaStroke: "#BD8589",
    ambientHalo: "#BD8589",
  },
};
