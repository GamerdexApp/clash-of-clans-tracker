import withFlowbiteReact from "flowbite-react/plugin/nextjs";
import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

const { version } = JSON.parse(readFileSync("./package.json", "utf8")) as { version: string };

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_APP_VERSION: version },
  async redirects() {
    return [
      { source: "/playthrough/list", destination: "/villages", permanent: true },
      { source: "/playthrough/new", destination: "/villages?new=1", permanent: true },
    ];
  },
  images: {
    // All public images are WebP files (named .png) — serve directly so browsers detect format by magic bytes
    unoptimized: true,
  },
};

export default withFlowbiteReact(nextConfig);
