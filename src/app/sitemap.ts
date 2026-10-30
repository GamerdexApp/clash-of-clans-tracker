import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";

/** The landing page is the only public page. The tracker pages hold private data and ask not to be indexed. */
const sitemap = (): MetadataRoute.Sitemap => [
  { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
];

export default sitemap;
