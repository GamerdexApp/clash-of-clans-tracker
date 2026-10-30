import { messages } from "@/i18n/text";
import type { SyncProviderId } from "@/lib/sync/providers";

export const syncText = messages<{
  tab: {
    title: string;
  };
  unavailable: string;
  provider: {
    github: {
      name: string;
      tile: (repository: string) => string;
      badge: string;
    };
    google: {
      name: string;
      tile: () => string;
      badge: string;
    };
    dropbox: {
      name: string;
      tile: () => string;
      badge: string;
    };
    microsoft: {
      name: string;
      tile: () => string;
      badge: string;
    };
  };
  connect: {
    title: string;
    pill: string;
    intro: string;
    pickerLabel: string;
    panelTitle: (provider: string) => string;
    another: string;
    firstSync: string;
    steps: {
      google: {
        step1: () => string;
        step2: () => string;
        button: string;
      };
      github: {
        step1: (repository: string) => string;
        step2: () => string;
        button: string;
      };
      dropbox: {
        step1: () => string;
        step2: () => string;
        button: string;
      };
      microsoft: {
        step1: () => string;
        step2: () => string;
        button: string;
      };
    };
  };
  how: {
    title: string;
    points: readonly string[];
  };
  repository: {
    title: string;
    body: (name: string) => string;
    checking: (name: string) => string;
    checkFailed: string;
    public: (fullName: string) => string;
    missing: (name: string) => string;
    steps: {
      create: (name: string) => string;
      install: (name: string) => string;
      recheck: string;
    };
    createButton: string;
    installButton: string;
    recheckButton: string;
  };
  connected: {
    repository: string;
    lastSync: string;
    never: string;
    syncNow: string;
    signOut: string;
    folder: (name: string) => string;
    signInWith: (provider: string) => string;
  };
  status: {
    idle: string;
    syncing: string;
    offline: string;
    reauth: string;
    needsChoice: string;
    error: string;
    signedOut: string;
    needsRepository: string;
    conflicts: string;
  };
  error: {
    rateLimit: string;
    notFound: string;
    server: string;
    data: string;
    busy: string;
    other: string;
    reauth: string;
    forbidden: string;
    httpStatus: (status: string) => string;
    notFoundFolder: (provider: string) => string;
    forbiddenFolder: (provider: string) => string;
    httpStatusFolder: (provider: string, status: string) => string;
  };
  choice: {
    title: string;
    body: string;
    merge: string;
    mergeHint: string;
    keepLocal: string;
    keepLocalHint: string;
    keepCloud: string;
    keepCloudHint: string;
  };
  first: {
    thisDevice: string;
    cloud: string;
    recommended: string;
    later: string;
    apply: string;
    optionsLabel: string;
  };
  villageCount: (count: number, amount: string) => string;
  conflicts: {
    title: string;
    body: string;
    cloudValue: string;
    deviceValue: string;
    keepDevice: string;
    dismiss: string;
    empty: string;
    deletedEdited: string;
  };
  banner: {
    title: (count: number, amount: string) => string;
    body: string;
    review: string;
    waiting: string;
    choose: string;
  };
  villages: {
    title: string;
    thisDevice: string;
    cloud: string;
    notInCloud: string;
    review: string;
    note: string;
    status: {
      synced: string;
      changedHere: string;
      conflict: string;
      newHere: string;
    };
    describe: (townHall: string) => string;
  };
  activity: {
    title: string;
    empty: string;
    connected: (provider: string) => string;
    uploaded: string;
    downloaded: string;
    merged: string;
    conflicts: (count: number, amount: string) => string;
    failed: string;
  };
  settings: {
    title: string;
    auto: string;
    autoHint: string;
    focus: string;
    focusHint: string;
    metered: string;
    meteredHint: string;
  };
  lives: {
    title: string;
    storage: string;
    folder: string;
    dataFile: string;
    metaFile: string;
    size: string;
    kb: (amount: string) => string;
    note: string;
    notes: {
      google: string;
      github: string;
      dropbox: string;
      microsoft: string;
    };
  };
  device: {
    title: string;
    name: string;
    nameHint: string;
    activeVillage: string;
    noVillage: string;
    login: string;
    loginValue: string;
    loginHint: string;
  };
  disconnect: {
    title: string;
    body: string;
    button: (provider: string) => string;
    hints: {
      google: string;
      github: string;
      dropbox: string;
      microsoft: string;
    };
  };
  callback: {
    title: string;
    working: string;
    back: string;
    denied: string;
    state: string;
    missing: string;
    failed: string;
  };
}>("sync", {
  fns: {
    "provider.github.tile": ["repository"],
    "provider.google.tile": [],
    "provider.dropbox.tile": [],
    "provider.microsoft.tile": [],
    "connect.panelTitle": ["provider"],
    "connect.steps.google.step1": [],
    "connect.steps.google.step2": [],
    "connect.steps.github.step1": ["repository"],
    "connect.steps.github.step2": [],
    "connect.steps.dropbox.step1": [],
    "connect.steps.dropbox.step2": [],
    "connect.steps.microsoft.step1": [],
    "connect.steps.microsoft.step2": [],
    "repository.body": ["name"],
    "repository.checking": ["name"],
    "repository.public": ["fullName"],
    "repository.missing": ["name"],
    "repository.steps.create": ["name"],
    "repository.steps.install": ["name"],
    "connected.folder": ["name"],
    "connected.signInWith": ["provider"],
    "error.httpStatus": ["status"],
    "error.notFoundFolder": ["provider"],
    "error.forbiddenFolder": ["provider"],
    "error.httpStatusFolder": ["provider", "status"],
    villageCount: ["count:plural", "amount"],
    "banner.title": ["count:plural", "amount"],
    "villages.describe": ["townHall"],
    "activity.connected": ["provider"],
    "activity.conflicts": ["count:plural", "amount"],
    "lives.kb": ["amount"],
    "disconnect.button": ["provider"],
  },
  arrays: ["how.points"],
});
