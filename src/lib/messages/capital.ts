import { messages } from "@/i18n/text";

export const capitalText = messages<{
  districts: {
    title: string;
    subline: (name: string, hall: number) => string;
    description: string;
  };
  troops: {
    title: string;
    subline: (name: string) => string;
    tiles: {
      troops: string;
      spells: string;
      caption: (current: number, max: number) => string;
    };
    sections: {
      troops: string;
      spells: string;
    };
    card: {
      level: (name: string) => string;
      raise: (name: string) => string;
      lower: (name: string) => string;
      maxAt: (level: number) => string;
      from: (zone: string) => string;
      progress: (name: string) => string;
    };
    locked: {
      title: string;
      districtHall: (level: number, zone: string) => string;
      capitalHall: (level: number, zone: string) => string;
      kept: (level: number) => string;
    };
    empty: {
      title: string;
      description: string;
    };
  };
  tracking: {
    label: string;
    onHelp: string;
    turnOnTitle: string;
    turnedOn: string;
    undo: string;
    offDialog: {
      title: string;
      body: string;
      confirm: string;
      cancel: string;
    };
  };
  off: {
    title: string;
    description: string;
    turnOn: string;
    keptTitle: string;
    kept: string;
  };
  locked: {
    title: string;
    description: (townHall: number) => string;
    action: string;
  };
  notSet: {
    title: string;
    description: string;
    action: string;
  };
  hall: {
    label: string;
    none: string;
    level: (level: number) => string;
    nextCost: (level: number, cost: string, opens: string[]) => string;
    atTop: string;
    raised: (from: number, to: number) => string;
    changed: (from: number, to: number) => string;
    districtRaised: (zone: string, from: number, to: number) => string;
    districtChanged: (zone: string, from: number, to: number) => string;
  };
  contributions: {
    label: string;
    unit: string;
    help: string;
  };
  tiles: {
    progress: string;
    progressCaption: (current: number, max: number) => string;
    zones: string;
    zonesCaption: (open: number, total: number) => string;
  };
  zones: {
    title: string;
    help: string;
    hall: (level: number) => string;
    peakHall: (level: number) => string;
    locked: (hall: number) => string;
    levels: (current: number, max: number) => string;
  };
  panel: {
    districtHall: string;
    requires: (hall: number) => string;
    noHall: string;
    empty: string;
    groupsLabel: string;
    groups: {
      defenses: string;
      traps: string;
      army: string;
      walls: string;
    };
    max: string;
    clear: string;
    maxAll: string;
    resetAll: string;
    instances: (count: number) => string;
    maxLevel: (level: number) => string;
    instance: (name: string, index: number) => string;
    raise: (name: string) => string;
    lower: (name: string) => string;
    wallLevel: (level: number) => string;
    wallsLeft: (left: number, total: number) => string;
    wallsNote: string;
    wallsNone: string;
    wallCount: (level: number) => string;
    wallRaise: (level: number) => string;
    wallLower: (level: number) => string;
    groupMaxed: (zone: string, group: string) => string;
    groupCleared: (zone: string, group: string) => string;
  };
  confirm: {
    title: string;
    description: string;
    confirm: string;
    cancel: string;
    more: (count: number) => string;
  };
  toast: {
    undo: string;
  };
}>("capital", {
  fns: {
    "districts.subline": ["name", "hall"],
    "troops.subline": ["name"],
    "troops.tiles.caption": ["current", "max"],
    "troops.card.level": ["name"],
    "troops.card.raise": ["name"],
    "troops.card.lower": ["name"],
    "troops.card.maxAt": ["level"],
    "troops.card.from": ["zone"],
    "troops.card.progress": ["name"],
    "troops.locked.districtHall": ["level", "zone"],
    "troops.locked.capitalHall": ["level", "zone"],
    "troops.locked.kept": ["level"],
    "locked.description": ["townHall"],
    "hall.level": ["level"],
    "hall.nextCost": ["level", "cost", "opens:list"],
    "hall.raised": ["from", "to"],
    "hall.changed": ["from", "to"],
    "hall.districtRaised": ["zone", "from", "to"],
    "hall.districtChanged": ["zone", "from", "to"],
    "tiles.progressCaption": ["current:number", "max:number"],
    "tiles.zonesCaption": ["open", "total"],
    "zones.hall": ["level"],
    "zones.peakHall": ["level"],
    "zones.locked": ["hall"],
    "zones.levels": ["current:number", "max:number"],
    "panel.requires": ["hall"],
    "panel.instances": ["count:plural"],
    "panel.maxLevel": ["level"],
    "panel.instance": ["name", "index:plusOne"],
    "panel.raise": ["name"],
    "panel.lower": ["name"],
    "panel.wallLevel": ["level"],
    "panel.wallsLeft": ["left", "total"],
    "panel.wallCount": ["level"],
    "panel.wallRaise": ["level"],
    "panel.wallLower": ["level"],
    "panel.groupMaxed": ["zone", "group"],
    "panel.groupCleared": ["zone", "group"],
    "confirm.more": ["count"],
  },
  arrays: [],
});
