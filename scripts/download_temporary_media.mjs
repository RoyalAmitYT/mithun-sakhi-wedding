// scripts/download_temporary_media.mjs
import fs from "fs";
import path from "path";

const PHOTOS_DIR = path.resolve(process.cwd(), "public/media/temporary/photos");
const VIDEOS_DIR = path.resolve(process.cwd(), "public/media/temporary/videos");
const POSTERS_DIR = path.resolve(process.cwd(), "public/media/temporary/posters");

[PHOTOS_DIR, VIDEOS_DIR, POSTERS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

import { execSync } from "child_process";

async function downloadFile(url, destPath) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    console.log(`  Already exists: ${path.basename(destPath)} (${fs.statSync(destPath).size} bytes)`);
    return true;
  }
  try {
    console.log(`  Downloading with curl.exe -> ${path.basename(destPath)}...`);
    execSync(`curl.exe -s -L --retry 3 --max-time 45 -o "${destPath}" "${url}"`, {
      stdio: "inherit",
    });
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      console.log(`  ✓ Success: ${path.basename(destPath)} (${fs.statSync(destPath).size} bytes)`);
      return true;
    } else {
      console.warn(`  Warning: File missing or too small: ${destPath}`);
      return false;
    }
  } catch (err) {
    console.error(`  Error downloading ${url}:`, err.message);
    return false;
  }
}

const ASSET_CATALOG = {
  photos: [
    {
      id: "hero-couple-portrait",
      category: "portraits",
      use: "homepage_hero",
      title: "Cinematic Indian Wedding Couple Portrait",
      alt: "Illustrative preview: Indian wedding couple in royal ceremonial red and ivory attire",
      caption: "Mithun & Kabita Sacred Union — Illustrative Preview Portrait",
      source: "Pexels",
      sourceId: "19609201",
      pageUrl: "https://www.pexels.com/photo/19609201/",
      author: "Pexels Contributor",
      license: "Pexels License (Free to use, non-commercial & commercial)",
      downloadUrl: "https://images.pexels.com/photos/19609201/pexels-photo-19609201.jpeg?auto=compress&cs=tinysrgb&w=1600",
      localFile: "hero_couple_portrait.jpg",
      localPath: "/media/temporary/photos/hero_couple_portrait.jpg",
      width: 1600,
      height: 1067,
    },
    {
      id: "bride-solo-portrait",
      category: "portraits",
      use: "bride_family_card",
      title: "Elegant Indian Bridal Portrait",
      alt: "Illustrative preview: Bride in traditional red lehenga, gold ornaments and veil",
      caption: "Kabita Gorain (Bride) — Illustrative Preview Portrait",
      source: "Pexels",
      sourceId: "28941551",
      pageUrl: "https://www.pexels.com/photo/28941551/",
      author: "Pexels Contributor",
      license: "Pexels License",
      downloadUrl: "https://images.pexels.com/photos/28941551/pexels-photo-28941551.jpeg?auto=compress&cs=tinysrgb&w=1200",
      localFile: "bride_solo_portrait.jpg",
      localPath: "/media/temporary/photos/bride_solo_portrait.jpg",
      width: 1200,
      height: 1600,
    },
    {
      id: "groom-solo-portrait",
      category: "portraits",
      use: "groom_family_card",
      title: "Traditional Indian Groom in Festive Sherwani",
      alt: "Illustrative preview: Groom in regal ivory and gold embroidered sherwani",
      caption: "Mithun Gorain (Groom) — Illustrative Preview Portrait",
      source: "Pexels",
      sourceId: "33049965",
      pageUrl: "https://www.pexels.com/photo/33049965/",
      author: "Pexels Contributor",
      license: "Pexels License",
      downloadUrl: "https://images.pexels.com/photos/33049965/pexels-photo-33049965.jpeg?auto=compress&cs=tinysrgb&w=1200",
      localFile: "groom_solo_portrait.jpg",
      localPath: "/media/temporary/photos/groom_solo_portrait.jpg",
      width: 1200,
      height: 1600,
    },
    {
      id: "ceremony-haldi",
      category: "haldi",
      use: "haldi_ceremony_card",
      title: "Joyful Haldi Ceremony Turmeric Ritual",
      alt: "Illustrative preview: Family members lovingly applying golden turmeric paste",
      caption: "Gaye Holud (Haldi Blessing) — Illustrative Ceremony Preview",
      source: "Pexels",
      sourceId: "36883007",
      pageUrl: "https://www.pexels.com/photo/36883007/",
      author: "Pexels Contributor",
      license: "Pexels License",
      downloadUrl: "https://images.pexels.com/photos/36883007/pexels-photo-36883007.jpeg?auto=compress&cs=tinysrgb&w=1400",
      localFile: "ceremony_haldi.jpg",
      localPath: "/media/temporary/photos/ceremony_haldi.jpg",
      width: 1400,
      height: 933,
    },
    {
      id: "ceremony-mehndi",
      category: "mehndi",
      use: "mehndi_ceremony_card",
      title: "Intricate Bridal Mehndi and Henna Art",
      alt: "Illustrative preview: Detailed henna artwork on bride hands adorned with gold bangles",
      caption: "Mehndi Utsav (Henna Artistry) — Illustrative Ceremony Preview",
      source: "Pexels",
      sourceId: "8819837",
      pageUrl: "https://www.pexels.com/photo/8819837/",
      author: "Pexels Contributor",
      license: "Pexels License",
      downloadUrl: "https://images.pexels.com/photos/8819837/pexels-photo-8819837.jpeg?auto=compress&cs=tinysrgb&w=1400",
      localFile: "ceremony_mehndi.jpg",
      localPath: "/media/temporary/photos/ceremony_mehndi.jpg",
      width: 1400,
      height: 933,
    },
    {
      id: "ceremony-wedding-mandap",
      category: "wedding",
      use: "wedding_ceremony_card",
      title: "Sacred Vedic Wedding Mandap & Saat Phere Rites",
      alt: "Illustrative preview: Sacred fire Agni Kund and floral mandap for Vedic wedding ceremony",
      caption: "The Sacred Vivaha (Seven Vows) — Illustrative Ceremony Preview",
      source: "Pexels",
      sourceId: "10454182",
      pageUrl: "https://www.pexels.com/photo/10454182/",
      author: "Pexels Contributor",
      license: "Pexels License",
      downloadUrl: "https://images.pexels.com/photos/10454182/pexels-photo-10454182.jpeg?auto=compress&cs=tinysrgb&w=1400",
      localFile: "ceremony_wedding_mandap.jpg",
      localPath: "/media/temporary/photos/ceremony_wedding_mandap.jpg",
      width: 1400,
      height: 933,
    },
    {
      id: "ceremony-reception",
      category: "reception",
      use: "reception_ceremony_card",
      title: "Grand Evening Wedding Reception Stage",
      alt: "Illustrative preview: Beautifully illuminated royal banquet hall and reception stage",
      caption: "Preetibhoj (Celebratory Reception) — Illustrative Ceremony Preview",
      source: "Pexels",
      sourceId: "29040997",
      pageUrl: "https://www.pexels.com/photo/29040997/",
      author: "Pexels Contributor",
      license: "Pexels License",
      downloadUrl: "https://images.pexels.com/photos/29040997/pexels-photo-29040997.jpeg?auto=compress&cs=tinysrgb&w=1400",
      localFile: "ceremony_reception.jpg",
      localPath: "/media/temporary/photos/ceremony_reception.jpg",
      width: 1400,
      height: 933,
    },
    {
      id: "wedding-decor-flowers",
      category: "wedding",
      use: "gallery_decor",
      title: "Traditional Marigold & Jasmine Floral Wedding Decor",
      alt: "Illustrative preview: Festive yellow and orange marigold garlands decorating mandap",
      caption: "Floral Grandeur & Mandap Decor — Illustrative Preview",
      source: "Pexels",
      sourceId: "10838755",
      pageUrl: "https://www.pexels.com/photo/10838755/",
      author: "Pexels Contributor",
      license: "Pexels License",
      downloadUrl: "https://images.pexels.com/photos/10838755/pexels-photo-10838755.jpeg?auto=compress&cs=tinysrgb&w=1400",
      localFile: "wedding_decor_flowers.jpg",
      localPath: "/media/temporary/photos/wedding_decor_flowers.jpg",
      width: 1400,
      height: 933,
    },
    {
      id: "couple-mandap-night",
      category: "portraits",
      use: "gallery_night_portrait",
      title: "Newlyweds Under Decorated Pavilion at Night",
      alt: "Illustrative preview: Couple in wedding finery under warm twinkling lights",
      caption: "Evening Mandap Serenade — Illustrative Preview Portrait",
      source: "Pexels",
      sourceId: "18361996",
      pageUrl: "https://www.pexels.com/photo/18361996/",
      author: "Pexels Contributor",
      license: "Pexels License",
      downloadUrl: "https://images.pexels.com/photos/18361996/pexels-photo-18361996.jpeg?auto=compress&cs=tinysrgb&w=1400",
      localFile: "couple_mandap_night.jpg",
      localPath: "/media/temporary/photos/couple_mandap_night.jpg",
      width: 1400,
      height: 933,
    },
  ],
  videos: [
    {
      id: "film-haldi-celebration",
      category: "haldi",
      title: "Vibrant Haldi Ceremony Rituals & Family Blessings",
      caption: "Haldi Celebration Highlights — Illustrative Preview Film",
      source: "Pexels",
      sourceId: "35067978",
      pageUrl: "https://www.pexels.com/video/35067978/",
      author: "Pexels Video Creator",
      license: "Pexels License",
      downloadUrl: "https://videos.pexels.com/video-files/35067978/14854576_1920_1080_50fps.mp4",
      localFile: "film_haldi_celebration.mp4",
      localPath: "/media/temporary/videos/film_haldi_celebration.mp4",
      posterUrl: "https://images.pexels.com/photos/36883007/pexels-photo-36883007.jpeg?auto=compress&cs=tinysrgb&w=800",
      posterFile: "poster_haldi_film.jpg",
      posterPath: "/media/temporary/posters/poster_haldi_film.jpg",
      durationSeconds: 15,
    },
    {
      id: "film-bridal-adornment",
      category: "portraits",
      title: "Traditional Bridal Adornment & Anklet Ceremony",
      caption: "Sacred Bridal Preparation — Illustrative Preview Film",
      source: "Pexels",
      sourceId: "11035010",
      pageUrl: "https://www.pexels.com/video/11035010/",
      author: "Pexels Video Creator",
      license: "Pexels License",
      downloadUrl: "https://videos.pexels.com/video-files/11035010/11035010-hd_1920_1080_24fps.mp4",
      localFile: "film_bridal_adornment.mp4",
      localPath: "/media/temporary/videos/film_bridal_adornment.mp4",
      posterUrl: "https://images.pexels.com/photos/28941551/pexels-photo-28941551.jpeg?auto=compress&cs=tinysrgb&w=800",
      posterFile: "poster_bridal_film.jpg",
      posterPath: "/media/temporary/posters/poster_bridal_film.jpg",
      durationSeconds: 18,
    },
  ],
};

async function execute() {
  console.log("\n1. DOWNLOADING TEMPORARY STOCK PHOTOS FROM PEXELS...");
  for (const photo of ASSET_CATALOG.photos) {
    console.log(`Downloading [${photo.id}]: ${photo.title}...`);
    const dest = path.join(PHOTOS_DIR, photo.localFile);
    await downloadFile(photo.downloadUrl, dest);
  }

  console.log("\n2. DOWNLOADING TEMPORARY STOCK VIDEOS FROM PEXELS...");
  for (const video of ASSET_CATALOG.videos) {
    console.log(`Downloading [${video.id}]: ${video.title}...`);
    const dest = path.join(VIDEOS_DIR, video.localFile);
    await downloadFile(video.downloadUrl, dest);

    console.log(`Downloading poster for [${video.id}]...`);
    const posterDest = path.join(POSTERS_DIR, video.posterFile);
    await downloadFile(video.posterUrl, posterDest);
  }

  console.log("\n3. GENERATING CENTRALIZED TYPESCRIPT MANIFEST...");
  const manifestTs = `/**
 * Temporary Stock Media Manifest (Phase P-15.2.3)
 * 
 * IMPORTANT DISCLAIMER & PLACEHOLDER HONESTY:
 * The assets in this catalog are royalty-free stock photographs and videos from Pexels,
 * utilized exclusively as temporary visual placeholders. They do not depict the actual
 * couple (Mithun & Kabita), their parents, or their authentic wedding rituals.
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

export const TEMPORARY_PHOTOS: TemporaryPhotoItem[] = ${JSON.stringify(
    ASSET_CATALOG.photos.map((p) => ({
      ...p,
      isTemporaryPlaceholder: true,
      downloadUrl: undefined,
      localFile: undefined,
    })),
    null,
    2
  )};

export const TEMPORARY_VIDEOS: TemporaryVideoItem[] = ${JSON.stringify(
    ASSET_CATALOG.videos.map((v) => ({
      ...v,
      isTemporaryPlaceholder: true,
      downloadUrl: undefined,
      localFile: undefined,
      posterUrl: undefined,
      posterFile: undefined,
    })),
    null,
    2
  )};

export function getTemporaryPhoto(id: string): TemporaryPhotoItem | undefined {
  return TEMPORARY_PHOTOS.find((p) => p.id === id);
}

export function getTemporaryPhotosByCategory(category: string): TemporaryPhotoItem[] {
  if (category === "all") return TEMPORARY_PHOTOS;
  return TEMPORARY_PHOTOS.filter((p) => p.category === category);
}
`;

  fs.writeFileSync("src/data/temporary-media.ts", manifestTs);
  console.log("✓ Generated src/data/temporary-media.ts");

  console.log("\n4. ASSET INTEGRITY REPORT:");
  let allValid = true;
  for (const p of ASSET_CATALOG.photos) {
    const file = path.join(PHOTOS_DIR, p.localFile);
    const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
    console.log(`  Photo: ${p.localFile} — ${size > 0 ? `OK (${(size / 1024).toFixed(1)} KB)` : "MISSING"}`);
    if (size === 0) allValid = false;
  }
  for (const v of ASSET_CATALOG.videos) {
    const file = path.join(VIDEOS_DIR, v.localFile);
    const pfile = path.join(POSTERS_DIR, v.posterFile);
    const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
    const psize = fs.existsSync(pfile) ? fs.statSync(pfile).size : 0;
    console.log(`  Video: ${v.localFile} — ${size > 0 ? `OK (${(size / 1024 / 1024).toFixed(2)} MB)` : "MISSING"}`);
    console.log(`  Poster: ${v.posterFile} — ${psize > 0 ? `OK (${(psize / 1024).toFixed(1)} KB)` : "MISSING"}`);
    if (size === 0 || psize === 0) allValid = false;
  }

  console.log(`\nOverall Asset Status: ${allValid ? "ALL ASSETS READY" : "SOME ASSETS FAILED"}`);
}

execute().catch(console.error);
