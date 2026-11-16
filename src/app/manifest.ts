import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mithun & Sakhi Wedding Celebration",
    short_name: "M•S Wedding",
    description:
      "Official wedding celebration website for Mithun Gorain and Sakhi Gorain.",
    start_url: "/",
    display: "standalone",
    background_color: "#48070F",
    theme_color: "#48070F",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
