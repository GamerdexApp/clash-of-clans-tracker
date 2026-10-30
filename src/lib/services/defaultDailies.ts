import type { DailiesData } from "@/types/app/playthrough";

const emptyTimer = { resetTime: null, lastCollectedAt: null };

export const defaultDailies: DailiesData = {
  helpers: {
    prospectorUnlocked: false,
    prospector: emptyTimer,
    alchemist: emptyTimer,
    buildersApprentice: emptyTimer,
    labAssistant: emptyTimer,
  },
  starBonus: emptyTimer,
  capitalGold: emptyTimer,
  goldPass: {
    builderBoostPct: 0,
    researchBoostPct: 0,
    monthKey: "",
    hoggyBankUnlocked: false,
    gemDonationsUnlocked: false,
    autoForgeUnlocked: false,
    requestTimeReductionUnlocked: false,
  },
  autoForge: { endsAt: null, resourceType: "gold", resourceAmount: 0, capitalGoldOutput: 0, durationMs: 0 },
  forgeSlots: Array.from({ length: 4 }, () => ({
    resourceType: null,
    endsAt: null,
    durationMs: 0,
    capitalGoldOutput: 0,
    resourceCost: 0,
  })),
};
