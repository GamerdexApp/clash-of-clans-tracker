import { messages } from "@/i18n/text";

export const upgradeLabelText = messages<{
  levelTo: (name: string, from: number, to: number) => string;
  toast: {
    undo: string;
    started: (name: string, from: number, to: number) => string;
    finished: (name: string, level: number) => string;
    timeSaved: (time: string) => string;
    cancelled: (name: string, from: number, to: number) => string;
    levelChanged: (name: string, from: number, to: number) => string;
  };
  queue: {
    buildPetHouse: string;
    requires: (building: string, level: number) => string;
    alreadyUpgrading: (name: string) => string;
    finishFirst: (level: number) => string;
    alreadyAt: (level: number) => string;
  };
  conflict: {
    alreadyAt: (name: string, level: number, target: number) => string;
    removeFix: string;
    scheduledBefore: (name: string, level: number, earlier: number) => string;
    moveFix: (level: number, earlier: number) => string;
  };
}>("upgradeLabel", {
  fns: {
    levelTo: ["name", "from", "to"],
    "toast.started": ["name", "from", "to"],
    "toast.finished": ["name", "level"],
    "toast.timeSaved": ["time"],
    "toast.cancelled": ["name", "from", "to"],
    "toast.levelChanged": ["name", "from", "to"],
    "queue.requires": ["building", "level"],
    "queue.alreadyUpgrading": ["name"],
    "queue.finishFirst": ["level"],
    "queue.alreadyAt": ["level"],
    "conflict.alreadyAt": ["name", "level", "target"],
    "conflict.scheduledBefore": ["name", "level", "earlier"],
    "conflict.moveFix": ["level", "earlier"],
  },
  arrays: [],
});
