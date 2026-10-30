import { messages } from "@/i18n/text";

export const shellText = messages<{
  skipToContent: string;
  closeMenu: string;
  openMenu: string;
  menuLabel: string;
  mainNav: string;
  brandTitle: string;
  brandSubtitle: string;
  switcher: {
    sectionLabel: string;
    loading: string;
    none: string;
    noneDetail: string;
    switch: string;
    villages: string;
    active: string;
    all: string;
    create: string;
    halls: (townHall: number, builderHall: number) => string;
  };
  locked: {
    townHall: (level: number) => string;
    blacksmith: string;
    helperHut: string;
    off: string;
    srLabel: (requirement: string) => string;
  };
  footer: {
    tagline: string;
    support: string;
    about: string;
    settings: string;
    discord: string;
    github: string;
    game: string;
    privacy: string;
    terms: string;
    disclaimerTitle: string;
    disclaimer: string;
    framework: string;
    visitGamerdex: string;
  };
  notFound: {
    title: string;
    body: string;
    toOverview: string;
    toVillages: string;
    toHome: string;
    didYouMean: string;
    noVillage: string;
    jumpTo: string;
  };
  error: {
    title: string;
    body: string;
    digest: (digest: string) => string;
    tryAgain: string;
    download: string;
    clear: string;
    confirmTitle: string;
    confirmBody: string;
    cancel: string;
    confirm: string;
    noData: string;
  };
}>("shell", {
  fns: {
    "switcher.halls": ["townHall", "builderHall"],
    "locked.townHall": ["level"],
    "locked.srLabel": ["requirement"],
    "error.digest": ["digest"],
  },
  arrays: [],
});
