export const landingText = {
  header: {
    label: "Page sections",
    features: "Features",
    faq: "FAQ",
    villages: "Villages",
    settings: "Settings",
  },
  hero: {
    title: "Track Your Clash of Clans Progress",
    description:
      "Keep every village in one place: buildings, troops, heroes, upgrades and dailies for your Home Village, Builder Base and Clan Capital.",
    note: "Free. No account. All data stays in your browser.",
    continue: "Continue with",
    continueLine: (townHall: number, builderHall: number, updated: string) =>
      builderHall > 0
        ? `Town Hall ${townHall}, Builder Hall ${builderHall}, updated ${updated}`
        : `Town Hall ${townHall}, updated ${updated}`,
  },
  cta: {
    create: "Create your first village",
    learnMore: "Learn more",
    overview: "Go to Overview",
    newVillage: "New village",
  },
  features: {
    label: "Everything you need",
    title: "All your progress in one place",
    description: "From the Town Hall to the Clan Capital, every level you track is saved the moment you change it.",
    items: [
      { title: "Multiple villages", text: "Create and manage unlimited villages. Track different accounts and bases separately." },
      { title: "Progress tracking", text: "Track exactly what you have completed, collected or unlocked across every village." },
      { title: "Overview", text: "See your progress at a glance with summary stats, daily timers and completion indicators." },
      { title: "Backup and sync", text: "Export your progress as a JSON file, or sync it across devices with your own cloud storage." },
      {
        title: "Private",
        text: "Your data stays in your browser. The only server call is the optional player tag lookup, which asks Supercell for your public stats.",
      },
      { title: "Dark mode", text: "Comfortable to use day or night. Choose light, dark or follow your device in Settings." },
    ],
  },
  faq: {
    label: "Got questions?",
    title: "Frequently asked questions",
    items: [
      {
        question: "What is Clash of Clans Tracker?",
        answer:
          "It is a progress tracker for Clash of Clans. It helps you manage multiple accounts and track your upgrades, achievements, dailies and overall progress in one place.",
      },
      {
        question: "How does it store my data?",
        answer:
          "Everything is saved in your browser, so your progress is private and needs no account. You can export and import it as a JSON file for backup. The optional player tag lookup sends the tag to a small server action that asks the Supercell API for your public stats.",
      },
      {
        question: "Can I track multiple villages?",
        answer: "Yes. Create as many villages as you like, each with its own progress, and switch between them in the sidebar.",
      },
      {
        question: "Does it sync across devices?",
        answer:
          "Yes, if you want it to. Open Settings and connect GitHub, Google Drive, Dropbox or OneDrive. Your data is stored in your own account, and syncing stays off until you turn it on.",
      },
      {
        question: "Is this app free to use?",
        answer: "Yes. It is free, with no subscription, no ads and no sign up.",
      },
    ],
  },
  final: {
    title: "Start tracking your villages today",
    description: "No account and no sign up. Your first village takes one name.",
  },
  updated: {
    justNow: "just now",
  },
} as const;
