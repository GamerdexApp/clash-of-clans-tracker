import { messages } from "@/i18n/text";

export const equipmentText = messages<{
  title: string;
  subline: (name: string, townHall: number, blacksmith: number) => string;
  massEdit: string;
  locked: {
    title: string;
    description: string;
    action: string;
  };
  ore: {
    title: string;
    description: string;
    names: {
      shiny: string;
      glowing: string;
      starry: string;
    };
    short: {
      shiny: string;
      glowing: string;
      starry: string;
    };
    needed: (amount: string) => string;
    enough: string;
    shortBy: (amount: string) => string;
    deduct: string;
    deductHelp: string;
  };
  hideMax: string;
  heroFilter: string;
  allHeroes: string;
  section: (pieces: number, owned: number) => string;
  empty: {
    title: string;
    allMax: string;
  };
  card: {
    heroLine: (hero: string) => string;
    level: (level: number, max: number) => string;
    notOwned: string;
    max: string;
    setLevel: (name: string) => string;
    stepLevel: (level: number) => string;
    free: string;
    time: string;
    requires: (level: number) => string;
    moreLevels: (count: number) => string;
    add: string;
    upgradeTo: (level: number) => string;
    lockedUntil: (level: number) => string;
    allows: (blacksmith: number, level: number) => string;
    allowsNone: (blacksmith: number) => string;
    footer: (levels: number) => string;
    progress: (name: string) => string;
  };
  toast: {
    upgraded: (name: string, from: number, to: number) => string;
    levelSet: (name: string, from: number, to: number) => string;
    undo: string;
  };
}>("equipment", {
  fns: {
    subline: ["name", "townHall", "blacksmith"],
    "ore.needed": ["amount"],
    "ore.shortBy": ["amount"],
    section: ["pieces", "owned"],
    "card.heroLine": ["hero"],
    "card.level": ["level", "max"],
    "card.setLevel": ["name"],
    "card.stepLevel": ["level"],
    "card.requires": ["level"],
    "card.moreLevels": ["count:plural"],
    "card.upgradeTo": ["level"],
    "card.lockedUntil": ["level"],
    "card.allows": ["blacksmith", "level"],
    "card.allowsNone": ["blacksmith"],
    "card.footer": ["levels:plural"],
    "card.progress": ["name"],
    "toast.upgraded": ["name", "from", "to"],
    "toast.levelSet": ["name", "from", "to"],
  },
  arrays: [],
});
