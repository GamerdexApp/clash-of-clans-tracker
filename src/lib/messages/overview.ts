import { messages } from "@/i18n/text";

export const overviewText = messages<{
  title: string;
  description: string;
  subline: (name: string) => string;
  header: {
    clanLevel: (level: number, role: string) => string;
    achievements: string;
    ringCaption: (stars: number, maxStars: number) => string;
    viewAll: string;
    townHall: (level: number) => string;
  };
  dailies: {
    title: string;
    closedTitle: string;
    closedBody: string;
    closedLink: string;
    groups: {
      helpers: string;
      daily: string;
      goldPass: string;
    };
    requires: (requirement: string) => string;
    openForge: string;
    openHelpers: string;
    unlockProspector: string;
    helperHut: string;
    townHall: (level: number) => string;
    starBonus: string;
    capitalGold: string;
    autoForge: string;
    forgeSlots: string;
    notRunning: string;
    running: string;
    stopAuto: string;
    autoLine: (amount: string, resource: string, capitalGold: string) => string;
    slotsLine: (running: number, open: number) => string;
    slotsDone: (done: number) => string;
    autoPerk: string;
    helperPreview: (before: string, after: string) => string;
    goldPass: {
      edit: string;
      builder: string;
      research: string;
      hoggyBank: string;
      gemDonations: string;
      autoForge: string;
      requestReduction: string;
      on: string;
      off: string;
      resets: (date: string) => string;
      readOnly: string;
    };
  };
  league: {
    open: (name: string) => string;
    homeKind: string;
    builderKind: string;
    noData: string;
    battle: string;
    stars: string;
    attacker: string;
    defender: string;
  };
  builder: {
    title: string;
    hall: (level: number) => string;
    trophies: (trophies: number) => string;
    daysAt: (level: number) => string;
    notSetTitle: string;
    notSetBody: string;
    notSetAction: string;
    lockedBody: string;
    troops: string;
    heroes: string;
  };
  capital: {
    title: string;
    hall: (level: number) => string;
    notSetTitle: string;
    notSetBody: string;
    notSetAction: string;
    lockedBody: string;
    districtHall: (level: number) => string;
    notUnlocked: string;
    unlocksAt: (level: number) => string;
    needsDistrictHall: string;
    noData: string;
    more: (count: number) => string;
    showFewer: string;
    openDistricts: string;
  };
  home: {
    title: string;
    townHall: (level: number) => string;
    daysAt: (level: number) => string;
    perHour: string;
    stored: string;
    cards: {
      locked: (requirement: string) => string;
    };
    queue: string;
    troops: string;
    spells: string;
    heroes: string;
    siege: string;
    pets: string;
    legend: string;
    tile: (
      name: string,
      level: number,
      max: number,
      requirement?: string,
    ) => string;
    heroLocked: (requirement: string) => string;
    petsLocked: string;
  };
}>("overview", {
  fns: {
    subline: ["name"],
    "header.clanLevel": ["level", "role"],
    "header.ringCaption": ["stars", "maxStars"],
    "header.townHall": ["level"],
    "dailies.requires": ["requirement"],
    "dailies.townHall": ["level"],
    "dailies.autoLine": ["amount", "resource", "capitalGold"],
    "dailies.slotsLine": ["running", "open"],
    "dailies.slotsDone": ["done:plural"],
    "dailies.helperPreview": ["before", "after"],
    "dailies.goldPass.resets": ["date"],
    "league.open": ["name"],
    "builder.hall": ["level"],
    "builder.trophies": ["trophies:number"],
    "builder.daysAt": ["level"],
    "capital.hall": ["level"],
    "capital.districtHall": ["level"],
    "capital.unlocksAt": ["level"],
    "capital.more": ["count"],
    "home.townHall": ["level"],
    "home.daysAt": ["level"],
    "home.cards.locked": ["requirement"],
    "home.tile": ["name", "level", "max", "requirement"],
    "home.heroLocked": ["requirement"],
  },
  arrays: [],
});
