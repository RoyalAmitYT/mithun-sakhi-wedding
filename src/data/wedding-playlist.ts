/**
 * Wedding Playlist Manifest
 * Maps the 6 supplied MP3 files in public/audio/ to their display titles.
 */

export interface WeddingTrack {
  id: string;
  title: string;
  src: string;
  originalFilename: string;
}

export const WEDDING_PLAYLIST: WeddingTrack[] = [
  {
    id: "sajna",
    title: "Sajna",
    src: "/audio/sajna.mp3",
    originalFilename: "Sajna.mp3",
  },
  {
    id: "o-piya",
    title: "O Piya",
    src: "/audio/o-piya.mp3",
    originalFilename: "O Piya.mp3",
  },
  {
    id: "madhanya",
    title: "Madhanya",
    src: "/audio/madhanya.mp3",
    originalFilename: "Madhanya.mp3",
  },
  {
    id: "kudmayi-ke-din",
    title: "Kudmayi Ke Din",
    src: "/audio/kudmayi-ke-din.mp3",
    originalFilename: "Kudmayi Ke Din.mp3",
  },
  {
    id: "dekha-tenu",
    title: "Dekha Tenu",
    src: "/audio/dekha-tenu.mp3",
    originalFilename: "Dekha Tenu.mp3",
  },
  {
    id: "aaj-sajeya",
    title: "Aaj Sajeya",
    src: "/audio/aaj-sajeya.mp3",
    originalFilename: "Aaj Sajeya.mp3",
  },
];
