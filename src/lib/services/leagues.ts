import { builder, rankedBattles } from "clash-of-clans-data";
import rankedBattlesJson from "clash-of-clans-data/data/ranked-battles/ranked-battles.json";

import type { Playthrough } from "@/types/app";
import { RESOURCE_ICONS } from "@/lib/constants/leagueIcons";
import { formatNumber } from "@/lib/format";
import { gameText } from "@/lib/messages/game";
import { leagueDataText } from "@/lib/messages/leagueData";

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
        {
          label: gameText.resources.gold,
          value: loot.goldAndElixir,
          icon: "gold" as const,
        },
        {
          label: gameText.resources.elixir,
          value: loot.goldAndElixir,
          icon: "elixir" as const,
        },
      ]
    : []),
  ...(loot.darkElixir
    ? [
        {
          label: gameText.resources.darkElixir,
          value: loot.darkElixir,
          icon: "darkElixir" as const,
        },
      ]
    : []),
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
    ...(league.attacksPerWeek != null
      ? [
          {
            label: leagueDataText.stats.attacksPerWeek,
            value: String(league.attacksPerWeek),
          },
        ]
      : []),
    ...(league.percentPromoted != null
      ? [
          {
            label: leagueDataText.stats.promoted,
            value: `${league.percentPromoted}%`,
          },
        ]
      : []),
    ...(league.percentDemoted != null
      ? [
          {
            label: leagueDataText.stats.demoted,
            value: `${league.percentDemoted}%`,
          },
        ]
      : []),
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
      {
        title: leagueDataText.sections.maxLoot,
        lines: lootLines(loot.maxAvailableLoot),
      },
      {
        title: leagueDataText.sections.leagueBonus,
        lines: lootLines(loot.maxLeagueBonus),
      },
      {
        title: leagueDataText.sections.weeklyStarBonus,
        lines: [
          ...lootLines(star),
          ...(positive(star.shinyOre)
            ? [
                {
                  label: gameText.resources.shinyOre,
                  value: star.shinyOre,
                  icon: "shinyOre" as const,
                },
              ]
            : []),
          ...(positive(star.glowyOre)
            ? [
                {
                  label: gameText.resources.glowyOre,
                  value: star.glowyOre,
                  icon: "glowyOre" as const,
                },
              ]
            : []),
          ...(positive(star.starryOre)
            ? [
                {
                  label: gameText.resources.starryOre,
                  value: star.starryOre,
                  icon: "starryOre" as const,
                },
              ]
            : []),
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
        ? leagueDataText.rangeOpen(formatNumber(league.trophyMin))
        : leagueDataText.range(
            formatNumber(league.trophyMin),
            formatNumber(league.trophyMax),
          );
  return {
    kind: "builder",
    name: league.name,
    image: league.image,
    stats: [
      ...(range
        ? [{ label: leagueDataText.stats.trophyRange, value: range }]
        : []),
      ...(league.starBonus
        ? [
            {
              label: leagueDataText.stats.starsForBonus,
              value: String(league.starBonus.starsRequired),
            },
          ]
        : []),
    ],
    sections: league.starBonus
      ? [
          {
            title: leagueDataText.sections.starBonusReward,
            lines: [
              {
                label: gameText.resources.builderGold,
                value: league.starBonus.reward,
                icon: "goldB",
              },
              {
                label: gameText.resources.builderElixir,
                value: league.starBonus.reward,
                icon: "elixirB",
              },
            ],
          },
        ]
      : [],
    battle: (league.battleResults ?? []).map((result, stars) => ({ stars, attacker: result.attackerGold, defender: result.defenderElixir })),
    noData: !league.starBonus && (league.battleResults ?? []).length === 0,
  };
};
