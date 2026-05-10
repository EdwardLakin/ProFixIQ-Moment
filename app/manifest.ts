import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ProFixIQ Moment",
    short_name: "Moment",
    description: "AI executive-function operating system for ADHD/anxiety/school overwhelm",
    start_url: "/",
    display: "standalone",
    background_color: "#140f2a",
    theme_color: "#140f2a",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
