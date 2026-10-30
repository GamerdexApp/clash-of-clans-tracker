import { messages } from "@/i18n/text";

export const settingsText = messages<{
  title: string;
  subline: string;
  tabsLabel: string;
  tabs: {
    sync: string;
    preferences: string;
    data: string;
    about: string;
  };
  appearance: {
    title: string;
    description: string;
    themeLabel: string;
    themes: {
      light: string;
      dark: string;
      system: string;
    };
    themeNote: (mode: string) => string;
  };
  builders: {
    title: string;
    description: string;
    goblinBuilder: string;
    goblinBuilderHelp: string;
    goblinResearch: string;
    goblinResearchHelp: string;
  };
  activeHours: {
    title: string;
    description: string;
    start: string;
    end: string;
    save: string;
    clear: string;
    status: (start: string, end: string) => string;
    none: string;
    sameTime: string;
    overnight: (start: string, end: string) => string;
    unsaved: string;
    clockChanged: (start: string, end: string) => string;
  };
  data: {
    title: string;
    storageNote: {
      title: string;
      body: string;
    };
    export: {
      title: string;
      description: string;
      button: string;
      done: string;
    };
    import: {
      title: string;
      fileLabel: string;
      chooseFile: string;
      noFile: string;
      description: string;
      review: string;
      merged: string;
      replaced: string;
      undo: string;
    };
    reset: {
      title: string;
      warning: string;
      button: string;
      confirmTitle: string;
      confirmBody: (names: string) => string;
      cancel: string;
      confirm: string;
      done: string;
      doneMessage: (count: number) => string;
      doneMessageDisconnected: (count: number) => string;
      syncedCopy: (provider: string) => string;
      syncedOn: string;
      syncedOff: string;
      undo: string;
    };
    villages: {
      title: string;
      description: string;
      manage: string;
    };
    villageCount: (count: number) => string;
  };
  importDialog: {
    title: string;
    fileInfo: (name: string, size: string) => string;
    bytes: (count: number) => string;
    kilobytes: (count: number) => string;
    cancel: string;
    close: string;
    merge: string;
    replace: string;
    failedTitle: string;
    errors: {
      notJson: string;
      playthroughsMissing: string;
    };
    checksTitle: string;
    checks: (read: number, kept: number) => string;
    skipped: (count: number) => string;
    howToApply: string;
    modeLabel: string;
    modes: {
      merge: string;
      replace: string;
    };
    modeNotes: {
      merge: string;
      replace: string;
    };
    whatChanges: string;
    columns: {
      village: string;
      inFile: string;
      onDevice: string;
      result: string;
    };
    notThere: string;
    results: {
      added: string;
      updated: string;
      kept: string;
      replaced: string;
      removed: string;
    };
    summary: {
      added: (count: number) => string;
      updated: (count: number) => string;
      kept: (count: number) => string;
      replaced: (count: number) => string;
      removed: (count: number) => string;
    };
    noVillages: string;
    undoNote: string;
  };
  about: {
    version: (version: string) => string;
    summary: string;
    officialGame: string;
    disclaimer: string;
  };
}>("settings", {
  fns: {
    "appearance.themeNote": ["mode"],
    "activeHours.status": ["start", "end"],
    "activeHours.overnight": ["start", "end"],
    "activeHours.clockChanged": ["start", "end"],
    "data.reset.confirmBody": ["names"],
    "data.reset.doneMessage": ["count:plural"],
    "data.reset.doneMessageDisconnected": ["count:plural"],
    "data.reset.syncedCopy": ["provider"],
    "data.villageCount": ["count:plural"],
    "importDialog.fileInfo": ["name", "size"],
    "importDialog.bytes": ["count"],
    "importDialog.kilobytes": ["count"],
    "importDialog.checks": ["read", "kept"],
    "importDialog.skipped": ["count:plural"],
    "importDialog.summary.added": ["count"],
    "importDialog.summary.updated": ["count"],
    "importDialog.summary.kept": ["count"],
    "importDialog.summary.replaced": ["count"],
    "importDialog.summary.removed": ["count"],
    "about.version": ["version"],
  },
  arrays: [],
});
