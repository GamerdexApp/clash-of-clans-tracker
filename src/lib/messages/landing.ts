import { messages } from "@/i18n/text";

export const landingText = messages<{
  header: {
    label: string;
    features: string;
    faq: string;
    villages: string;
    settings: string;
  };
  hero: {
    title: string;
    description: string;
    note: string;
    continue: string;
    continueLine: (
      townHall: number,
      builderHall: number,
      updated: string,
    ) => string;
  };
  cta: {
    create: string;
    learnMore: string;
    overview: string;
    newVillage: string;
  };
  features: {
    label: string;
    title: string;
    description: string;
    items: readonly {
      title: string;
      text: string;
    }[];
  };
  faq: {
    label: string;
    title: string;
    items: readonly {
      question: string;
      answer: string;
    }[];
  };
  final: {
    title: string;
    description: string;
  };
  updated: {
    justNow: string;
  };
}>("landing", {
  fns: { "hero.continueLine": ["townHall", "builderHall", "updated"] },
  arrays: ["features.items", "faq.items"],
});
