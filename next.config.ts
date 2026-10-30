import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

const { version } = JSON.parse(readFileSync("./package.json", "utf8")) as { version: string };

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_APP_VERSION: version },
  async redirects() {
    return [
      { source: "/playthrough/list", destination: "/villages", permanent: true },
      { source: "/playthrough/new", destination: "/villages?new=1", permanent: true },
      { source: "/upgrade/home/builder", destination: "/builder", permanent: true },
      { source: "/upgrade/home/builder/queue", destination: "/builder/queue", permanent: true },
      { source: "/upgrade/home/research", destination: "/research", permanent: true },
      { source: "/upgrade/home/research/queue", destination: "/research/queue", permanent: true },
      { source: "/upgrade/home/pets", destination: "/pets", permanent: true },
      { source: "/upgrade/home/equipment", destination: "/equipment", permanent: true },
      { source: "/upgrade/home/walls", destination: "/walls", permanent: true },
      { source: "/upgrade/home/pets/queue", destination: "/pets/queue", permanent: true },
      { source: "/upgrade/home/defenses", destination: "/builder?tab=defenses", permanent: true },
      { source: "/upgrade/home/structures", destination: "/builder?tab=defenses", permanent: true },
      { source: "/upgrade/home/army", destination: "/builder?tab=army", permanent: true },
      { source: "/upgrade/home/resources", destination: "/builder?tab=resources", permanent: true },
      { source: "/upgrade/home/traps", destination: "/builder?tab=traps", permanent: true },
      { source: "/upgrade/home/heroes", destination: "/builder?tab=heroes", permanent: true },
      { source: "/upgrade/home/guardians", destination: "/builder?tab=guardians", permanent: true },
      { source: "/upgrade/home/crafted", destination: "/builder?tab=crafted", permanent: true },
    ];
  },
  images: {
    // All public images are WebP files (named .png) — serve directly so browsers detect format by magic bytes
    unoptimized: true,
  },
};

export default nextConfig;
