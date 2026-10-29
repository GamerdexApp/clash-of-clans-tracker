"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { BuildersApprenticeCard } from "@/components/helpers/BuildersApprenticeCard";
import { LabAssistantCard } from "@/components/helpers/LabAssistantCard";
import { AlchemistCard } from "@/components/helpers/AlchemistCard";
import { ProspectorCard } from "@/components/helpers/ProspectorCard";
import { defaultDailies } from "@/components/dashboard/DailiesSection";
import type { HelperAssignment, HelpersData } from "@/types/app/playthrough";

const HelpersPage = () => {
  const router = useRouter();
  const { activePlaythrough, isLoaded, updatePlaythrough } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  if (!activePlaythrough) return null;

  const dailies = activePlaythrough.dailies ?? defaultDailies;
  const helpers = dailies.helpers;
  const hv = activePlaythrough.data.homeVillage;
  const thLevel = hv.townHallLevel;

  const patchHelpers = (patch: Partial<HelpersData>) => {
    updatePlaythrough(activePlaythrough.id, {
      dailies: { ...dailies, helpers: { ...helpers, ...patch } },
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Helpers</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BuildersApprenticeCard
            hv={hv}
            level={helpers.buildersApprenticeLevel}
            assignment={helpers.buildersApprenticeAssignment}
            thLevel={thLevel}
            onLevelChange={(level) => patchHelpers({ buildersApprenticeLevel: level })}
            onAssignmentChange={(assignment: HelperAssignment | undefined) =>
              patchHelpers({ buildersApprenticeAssignment: assignment })
            }
          />
          <LabAssistantCard
            hv={hv}
            level={helpers.labAssistantLevel}
            assignment={helpers.labAssistantAssignment}
            thLevel={thLevel}
            onLevelChange={(level) => patchHelpers({ labAssistantLevel: level })}
            onAssignmentChange={(assignment: HelperAssignment | undefined) =>
              patchHelpers({ labAssistantAssignment: assignment })
            }
          />
          <AlchemistCard
            level={helpers.alchemistLevel}
            thLevel={thLevel}
            onLevelChange={(level) => patchHelpers({ alchemistLevel: level })}
          />
          <ProspectorCard
            thLevel={thLevel}
            prospectorUnlocked={helpers.prospectorUnlocked}
          />
        </div>
      </div>
    </div>
  );
};
export default HelpersPage;
