import { builder, rankedBattles } from "clash-of-clans-data";
import rankedBattlesJson from "clash-of-clans-data/data/ranked-battles/ranked-battles.json";

import { RESOURCE_ICONS } from "@/lib/constants/leagueIcons";
import type { Playthrough } from "@/types/app";

type ResourceIcon = keyof typeof RESOURCE_ICONS;

export interface LeagueLine {
  label: string;
  value: number;
  icon: ResourceIcon;
}

export interface LeagueSection {
  title: string;
  lines: LeagueLine[];
}

export interface LeagueStat {
  label: string;
  value: string;
}

export interface LeagueInfo {
  kind: "home" | "builder";
  name: string;
  image: string;
  stats: LeagueStat[];
  sections: LeagueSection[];
  /** Builder Base battle results by stars won. */
  battle: Array<{ stars: number; attacker: number; defender: number }>;
  /** True when the data has no reward numbers for this league and Town Hall. */
  noData: boolean;
}

interface Loot {
  goldAndElixir: number | null;
  darkElixir: number | null;
}

interface LootRow {
  leagueId: string;
  maxAvailableLoot: Loot;
  maxLeagueBonus: Loot;
  starBonus: Loot & { shinyOre: number | null; glowyOre: number | null; starryOre: number | null };
}

const lootByTownHall = (rankedBattlesJson as unknown as { lootByTownHall: Record<string, LootRow[]> }).lootByTownHall;

const lootLines = (loot: Loot): LeagueLine[] => [
  ...(loot.goldAndElixir != null
    ? [
        { label: "Gold", value: loot.goldAndElixir, icon: "gold" as const },
        { label: "Elixir", value: loot.goldAndElixir, icon: "elixir" as const },
      ]
    : []),
  ...(loot.darkElixir ? [{ label: "Dark Elixir", value: loot.darkElixir, icon: "darkElixir" as const }] : []),
];

const positive = (value: number | null | undefined): value is number => typeof value === "number" && value > 0;

/** The reward numbers of the Home Village league the village is in, at its Town Hall. Null when the league is not in the data. */
export const homeLeagueInfo = (village: Playthrough): LeagueInfo | null => {
  const hv = village.data.homeVillage;
  if (!hv.leagueName) return null;
  const league = (rankedBattles().leagues() as unknown as { byName: (name: string) => { data?: Array<Record<string, unknown>> } }).byName(
    hv.leagueName.replace(" League", ""),
  ).data?.[0] as
    | { id: string; name: string; image: string; attacksPerWeek: number | null; percentPromoted: number | null; percentDemoted: number | null }
    | undefined;
  if (!league) return null;

  const loot = lootByTownHall[String(hv.townHallLevel)]?.find((row) => row.leagueId === league.id);
  const stats: LeagueStat[] = [
    ...(league.attacksPerWeek != null ? [{ label: "Attacks per week", value: String(league.attacksPerWeek) }] : []),
    ...(league.percentPromoted != null ? [{ label: "Top % promoted", value: `${league.percentPromoted}%` }] : []),
    ...(league.percentDemoted != null ? [{ label: "Bottom % demoted", value: `${league.percentDemoted}%` }] : []),
  ];

  if (!loot) return { kind: "home", name: league.name, image: league.image, stats, sections: [], battle: [], noData: true };

  const star = loot.starBonus;
  return {
    kind: "home",
    name: league.name,
    image: league.image,
    stats,
    noData: false,
    battle: [],
    sections: [
      { title: "Max available loot", lines: lootLines(loot.maxAvailableLoot) },
      { title: "Max league bonus", lines: lootLines(loot.maxLeagueBonus) },
      {
        title: "Weekly star bonus",
        lines: [
          ...lootLines(star),
          ...(positive(star.shinyOre) ? [{ label: "Shiny Ore", value: star.shinyOre, icon: "shinyOre" as const }] : []),
          ...(positive(star.glowyOre) ? [{ label: "Glowy Ore", value: star.glowyOre, icon: "glowyOre" as const }] : []),
          ...(positive(star.starryOre) ? [{ label: "Starry Ore", value: star.starryOre, icon: "starryOre" as const }] : []),
        ],
      },
    ].filter((section) => section.lines.length > 0),
  };
};

interface RawBuilderLeague {
  name: string;
  image: string;
  trophyMin?: number;
  trophyMax?: number | null;
  starBonus?: { starsRequired: number; reward: number };
  battleResults?: Array<{ attackerGold: number; defenderElixir: number }>;
}

export const builderLeagueInfo = (village: Playthrough): LeagueInfo | null => {
  const name = village.data.builderBase.builderBaseLeagueName;
  if (!name) return null;
  const league = ((builder().leagues() as unknown as { byName: (name: string) => { get: () => RawBuilderLeague[] } }).byName(name.replace(" League", "")).get() ?? [])[0];
  if (!league) return null;

  const range =
    league.trophyMin === undefined
      ? null
      : league.trophyMax == null
        ? `${league.trophyMin.toLocaleString()}+`
        : `${league.trophyMin.toLocaleString()} to ${league.trophyMax.toLocaleString()}`;
  return {
    kind: "builder",
    name: league.name,
    image: league.image,
    stats: [
      ...(range ? [{ label: "Trophy range", value: range }] : []),
      ...(league.starBonus ? [{ label: "Stars for the star bonus", value: String(league.starBonus.starsRequired) }] : []),
    ],
    sections: league.starBonus
      ? [
          {
            title: "Star bonus reward",
            lines: [
              { label: "Builder Gold", value: league.starBonus.reward, icon: "goldB" },
              { label: "Builder Elixir", value: league.starBonus.reward, icon: "elixirB" },
            ],
          },
        ]
      : [],
    battle: (league.battleResults ?? []).map((result, stars) => ({ stars, attacker: result.attackerGold, defender: result.defenderElixir })),
    noData: !league.starBonus && (league.battleResults ?? []).length === 0,
  };
};
