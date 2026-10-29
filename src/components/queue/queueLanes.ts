import type { AppSettings } from "@/types/app";
import type { LaneKind } from "@/types/app/engine";

interface QueueLaneConfig {
	backHref: string;
	/** Which Gold Pass boost applies to this queue. */
	boost: "builder" | "research";
	/** The setting that turns the extra lane on, or null when the queue has none. */
	goblinSetting: keyof Pick<AppSettings, "goblinBuilderEnabled" | "goblinResearchEnabled"> | null;
	/** The key of the saved timeline length. */
	windowKey: "builder" | "research" | "pets";
	/** The key of the saved hidden categories, or null when the queue has no categories to hide. */
	hiddenKey: "builder" | "research" | null;
	categoryOrder: string[];
}

export const queueLanes: Record<LaneKind, QueueLaneConfig> = {
	builder: {
		backHref: "/builder",
		boost: "builder",
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
		boost: "research",
		goblinSetting: "goblinResearchEnabled",
		windowKey: "research",
		hiddenKey: "research",
		categoryOrder: ["troops", "spells", "siegeMachines"],
	},
	pet: {
		backHref: "/pets",
		boost: "research",
		goblinSetting: null,
		windowKey: "pets",
		hiddenKey: null,
		categoryOrder: ["pets"],
	},
};
