/**
 * Temporary Stock Media Manifest (Phase P-15.2.3)
 * 
 * IMPORTANT DISCLAIMER & PLACEHOLDER HONESTY:
 * The assets in this catalog are royalty-free stock photographs and videos from Pexels,
 * utilized exclusively as temporary visual placeholders. They do not depict the actual
 * couple (Mithun & Sakhi), their parents, or their authentic wedding rituals.
 * 
 * Official authentic photography will replace these placeholders once ceremony assets are supplied.
 */

export interface TemporaryPhotoItem {
  id: string;
  category: "portraits" | "haldi" | "mehndi" | "wedding" | "reception";
  use: string;
  title: string;
  alt: string;
  caption: string;
  source: string;
  sourceId: string;
  pageUrl: string;
  author: string;
  license: string;
  localPath: string;
  width: number;
  height: number;
  isTemporaryPlaceholder: true;
}

export interface TemporaryVideoItem {
  id: string;
  category: "portraits" | "haldi" | "mehndi" | "wedding" | "reception";
  title: string;
  caption: string;
  source: string;
  sourceId: string;
  pageUrl: string;
  author: string;
  license: string;
  localPath: string;
  posterPath: string;
  durationSeconds: number;
  isTemporaryPlaceholder: true;
}

export const TEMPORARY_MEDIA_DISCLAIMER =
  "Illustrative preview imagery — official wedding photographs coming soon";

export const TEMPORARY_PHOTOS: TemporaryPhotoItem[] = [
  {
    "id": "hero-couple-portrait",
    "category": "portraits",
    "use": "homepage_hero",
    "title": "Cinematic Indian Wedding Couple Portrait",
    "alt": "Illustrative preview: Indian wedding couple in royal ceremonial red and ivory attire",
    "caption": "Mithun & Sakhi Sacred Union — Illustrative Preview Portrait",
    "source": "Pexels",
    "sourceId": "19609201",
    "pageUrl": "https://www.pexels.com/photo/19609201/",
    "author": "Pexels Contributor",
    "license": "Pexels License (Free to use, non-commercial & commercial)",
    "localPath": "/media/temporary/photos/hero_couple_portrait.jpg",
    "width": 1600,
    "height": 1067,
    "isTemporaryPlaceholder": true
  },
  {
    "id": "bride-solo-portrait",
    "category": "portraits",
    "use": "bride_family_card",
    "title": "Elegant Indian Bridal Portrait",
    "alt": "Illustrative preview: Bride in traditional red lehenga, gold ornaments and veil",
    "caption": "Sakhi Gorain (Bride) — Illustrative Preview Portrait",
    "source": "Pexels",
    "sourceId": "28941551",
    "pageUrl": "https://www.pexels.com/photo/28941551/",
    "author": "Pexels Contributor",
    "license": "Pexels License",
    "localPath": "/media/temporary/photos/bride_solo_portrait.jpg",
    "width": 1200,
    "height": 1600,
    "isTemporaryPlaceholder": true
  },
  {
    "id": "groom-solo-portrait",
    "category": "portraits",
    "use": "groom_family_card",
    "title": "Traditional Indian Groom in Festive Sherwani",
    "alt": "Illustrative preview: Groom in regal ivory and gold embroidered sherwani",
    "caption": "Mithun Gorain (Groom) — Illustrative Preview Portrait",
    "source": "Pexels",
    "sourceId": "33049965",
    "pageUrl": "https://www.pexels.com/photo/33049965/",
    "author": "Pexels Contributor",
    "license": "Pexels License",
    "localPath": "/media/temporary/photos/groom_solo_portrait.jpg",
    "width": 1200,
    "height": 1600,
    "isTemporaryPlaceholder": true
  },
  {
    "id": "ceremony-haldi",
    "category": "haldi",
    "use": "haldi_ceremony_card",
    "title": "Joyful Haldi Ceremony Turmeric Ritual",
    "alt": "Illustrative preview: Family members lovingly applying golden turmeric paste",
    "caption": "Gaye Holud (Haldi Blessing) — Illustrative Ceremony Preview",
    "source": "Pexels",
    "sourceId": "36883007",
    "pageUrl": "https://www.pexels.com/photo/36883007/",
    "author": "Pexels Contributor",
    "license": "Pexels License",
    "localPath": "/media/temporary/photos/ceremony_haldi.jpg",
    "width": 1400,
    "height": 933,
    "isTemporaryPlaceholder": true
  },
  {
    "id": "ceremony-mehndi",
    "category": "mehndi",
    "use": "mehndi_ceremony_card",
    "title": "Intricate Bridal Mehndi and Henna Art",
    "alt": "Illustrative preview: Detailed henna artwork on bride hands adorned with gold bangles",
    "caption": "Mehndi Ceremony (Henna Artistry) — Illustrative Ceremony Preview",
    "source": "Pexels",
    "sourceId": "8819837",
    "pageUrl": "https://www.pexels.com/photo/8819837/",
    "author": "Pexels Contributor",
    "license": "Pexels License",
    "localPath": "/media/temporary/photos/ceremony_mehndi.jpg",
    "width": 1400,
    "height": 933,
    "isTemporaryPlaceholder": true
  },
  {
    "id": "ceremony-reception",
    "category": "reception",
    "use": "reception_ceremony_card",
    "title": "Grand Evening Wedding Reception Stage",
    "alt": "Illustrative preview: Beautifully illuminated royal banquet hall and reception stage",
    "caption": "Reception (Celebratory Gathering) — Illustrative Ceremony Preview",
    "source": "Pexels",
    "sourceId": "29040997",
    "pageUrl": "https://www.pexels.com/photo/29040997/",
    "author": "Pexels Contributor",
    "license": "Pexels License",
    "localPath": "/media/temporary/photos/ceremony_reception.jpg",
    "width": 1400,
    "height": 933,
    "isTemporaryPlaceholder": true
  },
  {
    "id": "wedding-decor-flowers",
    "category": "wedding",
    "use": "gallery_decor",
    "title": "Traditional Marigold & Jasmine Floral Wedding Decor",
    "alt": "Illustrative preview: Festive yellow and orange marigold garlands decorating mandap",
    "caption": "Floral Grandeur & Mandap Decor — Illustrative Preview",
    "source": "Pexels",
    "sourceId": "10838755",
    "pageUrl": "https://www.pexels.com/photo/10838755/",
    "author": "Pexels Contributor",
    "license": "Pexels License",
    "localPath": "/media/temporary/photos/wedding_decor_flowers.jpg",
    "width": 1400,
    "height": 933,
    "isTemporaryPlaceholder": true
  }
];

export const TEMPORARY_VIDEOS: TemporaryVideoItem[] = [
  {
    "id": "film-haldi-celebration",
    "category": "haldi",
    "title": "Vibrant Haldi Ceremony Rituals & Family Blessings",
    "caption": "Haldi Celebration Highlights — Illustrative Preview Film",
    "source": "Pexels",
    "sourceId": "35067978",
    "pageUrl": "https://www.pexels.com/video/35067978/",
    "author": "Pexels Video Creator",
    "license": "Pexels License",
    "localPath": "/media/temporary/videos/film_haldi_celebration.mp4",
    "posterPath": "/media/temporary/posters/poster_haldi_film.jpg",
    "durationSeconds": 15,
    "isTemporaryPlaceholder": true
  },
  {
    "id": "film-bridal-adornment",
    "category": "portraits",
    "title": "Traditional Bridal Adornment & Anklet Ceremony",
    "caption": "Sacred Bridal Preparation — Illustrative Preview Film",
    "source": "Pexels",
    "sourceId": "11035010",
    "pageUrl": "https://www.pexels.com/video/11035010/",
    "author": "Pexels Video Creator",
    "license": "Pexels License",
    "localPath": "/media/temporary/videos/film_bridal_adornment.mp4",
    "posterPath": "/media/temporary/posters/poster_bridal_film.jpg",
    "durationSeconds": 18,
    "isTemporaryPlaceholder": true
  }
];

export function getTemporaryPhoto(id: string): TemporaryPhotoItem | undefined {
  return TEMPORARY_PHOTOS.find((p) => p.id === id);
}

export function getTemporaryPhotosByCategory(category: string): TemporaryPhotoItem[] {
  if (category === "all") return TEMPORARY_PHOTOS;
  return TEMPORARY_PHOTOS.filter((p) => p.category === category);
}
