import { messages } from "@/i18n/text";

export const dailiesText = messages<{
  locked: {
    title: string;
    subline: (name: string, townHall: number) => string;
    open: string;
    lockedBadge: string;
    now: (townHall: number) => string;
    nowNoHut: string;
    needsHut: string;
    toBuilder: string;
    cards: {
      forge: {
        title: string;
        what: string;
      };
      helpers: {
        title: string;
        what: string;
      };
      seasonPass: {
        title: string;
        what: string;
      };
      starBonus: {
        title: string;
        what: string;
        open: string;
      };
    };
  };
  timer: {
    notSet: string;
    setTime: string;
    setAndUse: string;
    notSetHelp: string;
    savedIn: (zone: string) => string;
    available: string;
    use: string;
    adjust: string;
    adjustTitle: string;
    save: string;
    cancel: string;
    resetsAt: (time: string, zone: string) => string;
    untilReset: (time: string, zone: string) => string;
    usedAt: (time: string) => string;
    timeLabel: string;
    deviceClock: string;
    used: (name: string) => string;
    undo: string;
  };
  forge: {
    title: string;
    description: string;
    subline: (name: string, townHall: number, builderHall: number) => string;
    daily: {
      title: string;
      amount: (gold: number, townHall: number) => string;
      none: string;
      name: string;
    };
    slots: {
      title: string;
      craftingTime: string;
      open: (open: number, total: number, townHall: number) => string;
      boost: (percent: number, time: string) => string;
      slot: (number: number) => string;
      requires: (townHall: number) => string;
      locked: string;
      idle: string;
      idleHelp: string;
      running: string;
      done: string;
      result: string;
      start: string;
      stop: string;
      reset: string;
      resource: string;
      rate: (
        amount: string,
        resource: string,
        capitalGold: string,
        time: string,
      ) => string;
      left: (time: string) => string;
      ready: (capitalGold: string) => string;
      finished: (ago: string) => string;
      stopped: (number: number) => string;
      resetDone: (number: number, resource: string) => string;
      runningTitle: (resource: string, amount: string) => string;
    };
    auto: {
      title: string;
      subtitle: string;
      repeats: (
        amount: string,
        resource: string,
        capitalGold: string,
        time: string,
      ) => string;
      nextRun: string;
      stop: string;
      stopped: string;
      confirm: {
        title: string;
        body: (
          amount: string,
          resource: string,
          capitalGold: string,
          time: string,
        ) => string;
        undoHint: string;
        keep: string;
        stop: string;
      };
    };
    rates: {
      title: string;
      description: (townHall: number, builderHall: number) => string;
      autoTitle: string;
      autoDescription: string;
      resource: string;
      cost: string;
      capitalGold: string;
      requires: (requirement: string) => string;
    };
  };
  helpers: {
    title: string;
    description: string;
    subline: (name: string, townHall: number, builderHall: number) => string;
    banner: string;
    names: {
      buildersApprentice: string;
      labAssistant: string;
      alchemist: string;
      prospector: string;
    };
    from: (townHall: number) => string;
    lockedCard: (townHall: number) => string;
    dailyUse: string;
    level: string;
    levelOption: (level: number) => string;
    levelTownHall: (townHall: number) => string;
    none: string;
    noLevel: string;
    noLevelCalculator: string;
    nextLevel: (level: number, gems: string) => string;
    saves: (time: string) => string;
    levelRequires: (townHall: number) => string;
    assignment: {
      builderTitle: string;
      researchTitle: string;
      none: string;
      builderHelp: string;
      researchHelp: string;
      builderEmpty: string;
      researchEmpty: string;
      once: string;
      untilDone: string;
      assignedTo: string;
      clearsAfterUse: string;
      staysUntilDone: string;
      clear: string;
      cleared: string;
      select: string;
      mode: string;
      preview: (before: string, after: string) => string;
      previewDone: (before: string) => string;
      upgradeTo: (name: string, level: number, left: string) => string;
    };
    used: {
      plain: (name: string) => string;
      saved: (name: string, target: string, time: string) => string;
    };
    alchemist: {
      stats: {
        goldElixir: string;
        darkElixir: string;
        bonus: string;
      };
      calculator: string;
      from: string;
      to: string;
      amount: string;
      result: (
        amount: string,
        from: string,
        output: string,
        to: string,
      ) => string;
      help: (bonus: number) => string;
      nothingSaved: string;
    };
    prospector: {
      lockedTitle: string;
      lockedHelp: string;
      toSeasonPass: string;
      subtitle: string;
      lockedBadge: string;
      unlockedBadge: string;
      levelOnly: string;
      limits: {
        shiny: string;
        glowy: string;
        starry: string;
      };
      calculator: string;
      ores: {
        shiny: string;
        glowy: string;
        starry: string;
      };
      help: string;
    };
  };
  seasonPass: {
    title: string;
    description: string;
    subline: (name: string, townHall: number) => string;
    lockedTitle: string;
    lockedBody: (townHall: number) => string;
    month: {
      title: (month: string) => string;
      subtitle: (reset: string) => string;
      key: string;
      rolled: string;
      undoReset: string;
      dismiss: string;
      restored: string;
      undo: string;
    };
    boosts: {
      title: string;
      description: string;
      builder: string;
      research: string;
      applies: string;
      saved: string;
      value: (percent: number) => string;
      option: (percent: number) => string;
      builderEffect: (percent: number, time: string) => string;
      researchEffect: (percent: number) => string;
    };
    unlocks: {
      title: string;
      description: string;
      prospector: string;
      prospectorHelp: string;
      shows: string;
    };
    perks: {
      title: string;
      description: string;
      referenceOnly: string;
      referenceNote: string;
      hoggyBank: {
        label: string;
        note: string;
      };
      gemDonations: {
        label: string;
        note: string;
      };
      autoForge: {
        label: string;
        note: string;
      };
      autoForgeEffect: string;
      requestTimeReduction: {
        label: string;
        note: string;
      };
    };
  };
}>("dailies", {
  fns: {
    "locked.subline": ["name", "townHall"],
    "locked.now": ["townHall"],
    "timer.savedIn": ["zone"],
    "timer.resetsAt": ["time", "zone"],
    "timer.untilReset": ["time", "zone"],
    "timer.usedAt": ["time"],
    "timer.used": ["name"],
    "forge.subline": ["name", "townHall", "builderHall"],
    "forge.daily.amount": ["gold:number", "townHall"],
    "forge.slots.open": ["open", "total", "townHall"],
    "forge.slots.boost": ["percent", "time"],
    "forge.slots.slot": ["number"],
    "forge.slots.requires": ["townHall"],
    "forge.slots.rate": ["amount", "resource", "capitalGold", "time"],
    "forge.slots.left": ["time"],
    "forge.slots.ready": ["capitalGold"],
    "forge.slots.finished": ["ago"],
    "forge.slots.stopped": ["number"],
    "forge.slots.resetDone": ["number", "resource"],
    "forge.slots.runningTitle": ["resource", "amount"],
    "forge.auto.repeats": ["amount", "resource", "capitalGold", "time"],
    "forge.auto.confirm.body": ["amount", "resource", "capitalGold", "time"],
    "forge.rates.description": ["townHall", "builderHall"],
    "forge.rates.requires": ["requirement"],
    "helpers.subline": ["name", "townHall", "builderHall"],
    "helpers.from": ["townHall"],
    "helpers.lockedCard": ["townHall"],
    "helpers.levelOption": ["level"],
    "helpers.levelTownHall": ["townHall"],
    "helpers.nextLevel": ["level", "gems"],
    "helpers.saves": ["time"],
    "helpers.levelRequires": ["townHall"],
    "helpers.assignment.preview": ["before", "after"],
    "helpers.assignment.previewDone": ["before"],
    "helpers.assignment.upgradeTo": ["name", "level", "left"],
    "helpers.used.plain": ["name"],
    "helpers.used.saved": ["name", "target", "time"],
    "helpers.alchemist.result": ["amount", "from", "output", "to"],
    "helpers.alchemist.help": ["bonus"],
    "seasonPass.subline": ["name", "townHall"],
    "seasonPass.lockedBody": ["townHall"],
    "seasonPass.month.title": ["month"],
    "seasonPass.month.subtitle": ["reset"],
    "seasonPass.boosts.value": ["percent"],
    "seasonPass.boosts.option": ["percent"],
    "seasonPass.boosts.builderEffect": ["percent", "time"],
    "seasonPass.boosts.researchEffect": ["percent"],
  },
  arrays: [],
});
