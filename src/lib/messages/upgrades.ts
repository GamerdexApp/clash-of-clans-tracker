import { messages } from "@/i18n/text";

export const upgradeText = messages<{
  massEdit: {
    hint: string;
    link: string;
  };
  hideMax: string;
  strip: {
    free: (free: number, total: number) => string;
    idle: string;
    unassigned: string;
    taskLevels: (from: number, to: number) => string;
  };
  start: {
    title: string;
    levelChange: (from: number, to: number) => string;
    time: string;
    cost: string;
    doneAt: string;
    wasBoosted: (base: string, percent: number) => string;
    wasCost: (base: string, resource: string) => string;
    resource: (resource: string) => string;
    storedNote: string;
    storedNoteUnboosted: string;
    instant: string;
    lanes: {
      builder: {
        label: string;
        choose: string;
        noneFree: string;
      };
      research: {
        label: string;
        choose: string;
        noneFree: string;
      };
      bbBuilder: {
        label: string;
        choose: string;
        noneFree: string;
      };
      bbResearch: {
        label: string;
        choose: string;
        noneFree: string;
      };
      pet: {
        label: string;
        choose: string;
        noneFree: string;
      };
    };
    requires: {
      laboratory: (level: number) => string;
      "pet-house": (level: number) => string;
      "star-laboratory": (level: number) => string;
      noPetHouse: string;
    };
    free: string;
    cancel: string;
    confirm: string;
    confirmInstant: string;
  };
  finish: {
    title: string;
    left: string;
    methodLabel: string;
    methods: {
      timePassed: {
        label: string;
        description: string;
      };
      gems: {
        label: string;
        description: string;
      };
      book: {
        label: string;
        description: string;
      };
      hammer: {
        label: string;
        description: string;
      };
    };
    stores: string;
    storesLevel: (level: number) => string;
    storesSaved: (time: string) => string;
    storesSavedNone: string;
    gemFigure: (gems: number) => string;
    notTracked: {
      timePassed: string;
      gems: string;
      book: string;
      hammer: string;
    };
    keep: string;
    confirm: string;
  };
  cancel: {
    title: string;
    body: (name: string, level: number, builder: string) => string;
    refundTitle: string;
    refundBody: (refund: string, paid: string, resource: string) => string;
    undoNote: string;
    keep: string;
    confirm: string;
  };
}>("upgrade", {
  fns: {
    "strip.free": ["free", "total"],
    "strip.taskLevels": ["from", "to"],
    "start.levelChange": ["from", "to"],
    "start.wasBoosted": ["base", "percent"],
    "start.wasCost": ["base", "resource"],
    "start.resource": ["resource"],
    "start.requires.laboratory": ["level"],
    "start.requires.pet-house": ["level"],
    "start.requires.star-laboratory": ["level"],
    "finish.storesLevel": ["level"],
    "finish.storesSaved": ["time"],
    "finish.gemFigure": ["gems"],
    "cancel.body": ["name", "level", "builder"],
    "cancel.refundBody": ["refund", "paid", "resource"],
  },
  arrays: [],
});
