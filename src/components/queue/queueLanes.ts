import type { AppSettings, QueueWindows } from "@/types/app";
import type { LaneKind } from "@/types/app/engine";

interface QueueLaneConfig {
	backHref: string;
	/** The setting that turns the extra lane on, or null when the queue has none. */
	goblinSetting: keyof Pick<AppSettings, "goblinBuilderEnabled" | "goblinResearchEnabled"> | null;
	/** The key of the saved timeline length. */
	windowKey: keyof QueueWindows;
	/** The key of the saved hidden categories, or null when the queue has no categories to hide. */
	hiddenKey: "builder" | "research" | null;
	categoryOrder: string[];
}

export const queueLanes: Record<LaneKind, QueueLaneConfig> = {
	builder: {
		backHref: "/builder",
		goblinSetting: "goblinBuilderEnabled",
		windowKey: "builder",
		hiddenKey: "builder",
		categoryOrder: [
			"defenses",
			"armyBuildings",
			"resourceBuildings",
			"traps",
			"heroes",
			"townHall",
			"craftedDefenses",
			"guardians",
			"supercharges",
		],
	},
	research: {
		backHref: "/research",
		goblinSetting: "goblinResearchEnabled",
		windowKey: "research",
		hiddenKey: "research",
		categoryOrder: ["troops", "spells", "siegeMachines"],
	},
	pet: {
		backHref: "/pets",
		goblinSetting: null,
		windowKey: "pets",
		hiddenKey: null,
		categoryOrder: ["pets"],
	},
	bbBuilder: {
		backHref: "/builder-base/upgrades",
		goblinSetting: null,
		windowKey: "bbBuilder",
		hiddenKey: null,
		categoryOrder: ["defenses", "armyBuildings", "resourceBuildings", "traps", "heroes", "other"],
	},
	bbResearch: {
		backHref: "/builder-base/troops",
		goblinSetting: null,
		windowKey: "bbResearch",
		hiddenKey: null,
		categoryOrder: ["troops"],
	},
};
