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
		{ path: "/mass-edit", priority: 0.6, changeFrequency: "monthly" as const },
		{ path: "/mass-edit/capital", priority: 0.6, changeFrequency: "monthly" as const },
		{ path: "/equipment", priority: 0.6, changeFrequency: "weekly" as const },
		{ path: "/pets", priority: 0.6, changeFrequency: "weekly" as const },
		{ path: "/pets/queue", priority: 0.5, changeFrequency: "weekly" as const },
		{ path: "/research", priority: 0.6, changeFrequency: "weekly" as const },
		{ path: "/research/queue", priority: 0.5, changeFrequency: "weekly" as const },
		{ path: "/walls", priority: 0.6, changeFrequency: "weekly" as const },
		{ path: "/builder-base/walls", priority: 0.6, changeFrequency: "weekly" as const },
		{ path: "/builder-base/queue", priority: 0.5, changeFrequency: "weekly" as const },
		{ path: "/clan-capital/districts", priority: 0.6, changeFrequency: "weekly" as const },
		{ path: "/clan-capital/troops", priority: 0.6, changeFrequency: "weekly" as const },
		{ path: "/builder-base/troops/queue", priority: 0.5, changeFrequency: "weekly" as const },
	];

	return routes.map(({ path, priority, changeFrequency }) => ({
		url: `${siteUrl}${path}`,
		lastModified: new Date(),
		changeFrequency,
		priority,
	}));
};

export default sitemap;
