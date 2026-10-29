import type { MetadataRoute } from "next";

const siteUrl = "https://coc.gamerdex.app";

const sitemap = (): MetadataRoute.Sitemap => {
	const routes = [
		{ path: "/", priority: 1, changeFrequency: "weekly" as const },
		{ path: "/dashboard", priority: 0.9, changeFrequency: "weekly" as const },
		{ path: "/achievements", priority: 0.8, changeFrequency: "weekly" as const },
		{ path: "/forge", priority: 0.8, changeFrequency: "weekly" as const },
		{ path: "/season-pass", priority: 0.7, changeFrequency: "weekly" as const },
		{ path: "/helpers", priority: 0.7, changeFrequency: "monthly" as const },
		{ path: "/mass-edit/home", priority: 0.6, changeFrequency: "monthly" as const },
		{ path: "/mass-edit/builder", priority: 0.6, changeFrequency: "monthly" as const },
		{ path: "/mass-edit/capital", priority: 0.6, changeFrequency: "monthly" as const },
		{ path: "/upgrade/home/builder/queue", priority: 0.5, changeFrequency: "weekly" as const },
		{ path: "/upgrade/home/equipment", priority: 0.6, changeFrequency: "weekly" as const },
		{ path: "/upgrade/home/pets", priority: 0.6, changeFrequency: "weekly" as const },
		{ path: "/upgrade/home/pets/queue", priority: 0.5, changeFrequency: "weekly" as const },
		{ path: "/upgrade/home/research", priority: 0.6, changeFrequency: "weekly" as const },
		{ path: "/upgrade/home/research/queue", priority: 0.5, changeFrequency: "weekly" as const },
		{ path: "/upgrade/home/walls", priority: 0.6, changeFrequency: "weekly" as const },
	];

	return routes.map(({ path, priority, changeFrequency }) => ({
		url: `${siteUrl}${path}`,
		lastModified: new Date(),
		changeFrequency,
		priority,
	}));
};

export default sitemap;
