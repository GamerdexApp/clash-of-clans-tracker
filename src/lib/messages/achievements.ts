import { messages } from "@/i18n/text";

export const achievementsText = messages<{
  title: string;
  description: string;
  subline: (
    name: string,
    count: number,
    stars: number,
    maxStars: number,
    percent: number,
  ) => string;
  tiles: {
    all: string;
    home: string;
    builder: string;
    capital: string;
    gems: string;
    xp: string;
    stars: (stars: number, maxStars: number) => string;
    left: (amount: string, unit: string) => string;
    gemsUnit: string;
    xpUnit: string;
  };
  sections: {
    home: string;
    builderBase: string;
    clanCapital: string;
    summary: (
      count: number,
      stars: number,
      maxStars: number,
      gems: string,
      xp: string,
    ) => string;
    more: (count: number, name: string) => string;
    less: string;
  };
  card: {
    manual: string;
    nextStar: string;
    xp: string;
    gems: string;
    edit: (name: string) => string;
    done: string;
    stars: string;
    starsHelp: string;
    star: (number: number) => string;
    value: string;
    target: string;
    manualLabel: string;
    saves: string;
    progress: (name: string) => string;
    starsEarned: (stars: number) => string;
  };
  toast: {
    stars: (name: string, stars: number) => string;
    targetMoved: (target: string) => string;
    value: (name: string, value: string) => string;
    target: (name: string, target: string) => string;
    undo: string;
  };
}>("achievements", {
  fns: {
    subline: ["name", "count", "stars", "maxStars", "percent"],
    "tiles.stars": ["stars", "maxStars"],
    "tiles.left": ["amount", "unit"],
    "sections.summary": ["count", "stars", "maxStars", "gems", "xp"],
    "sections.more": ["count", "name"],
    "card.edit": ["name"],
    "card.star": ["number:plural"],
    "card.progress": ["name"],
    "card.starsEarned": ["stars"],
    "toast.stars": ["name", "stars:plural"],
    "toast.targetMoved": ["target"],
    "toast.value": ["name", "value"],
    "toast.target": ["name", "target"],
  },
  arrays: [],
});
