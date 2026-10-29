"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { useUpgradeActions } from "@/lib/hooks/useUpgradeActions";
import { goldPassBoosts } from "@/service/goldPass";
import { CancelUpgradeDialog } from "@/comps/upgrades/CancelUpgradeDialog";
import { FinishUpgradeDialog } from "@/comps/upgrades/FinishUpgradeDialog";
import { StartUpgradeDialog } from "@/comps/upgrades/StartUpgradeDialog";
import type { Playthrough } from "@/types/app";
import type { BoostPercent, BuilderSlotState, UpgradeLaneKind, UpgradeTarget } from "@/types/app/engine";
import type { UpgradeHandlers } from "@/types/components/builder";
import type { RunningSubject, StartUpgradeSubject } from "@/types/components/upgrades";

/** The handlers a page passes to its rows, and the Start, Finish and Cancel dialogs they open. */
export const useUpgradeFlow = (
	village: Playthrough,
	now: number,
	lane: UpgradeLaneKind,
	lanes: BuilderSlotState[],
): { handlers: UpgradeHandlers; dialogs: ReactNode } => {
	const actions = useUpgradeActions(village);
	const [starting, setStarting] = useState<{ subject: StartUpgradeSubject; target: UpgradeTarget } | null>(null);
	const [finishing, setFinishing] = useState<RunningSubject | null>(null);
	const [cancelling, setCancelling] = useState<RunningSubject | null>(null);
	const boosts = goldPassBoosts(village, new Date(now));
	const boostFor = (kind: UpgradeLaneKind): BoostPercent => {
		if (kind === "builder") return boosts.builder;
		return kind === "bbBuilder" || kind === "bbResearch" ? 0 : boosts.research;
	};

	const handlers: UpgradeHandlers = {
		onStart: (subject, target) => setStarting({ subject, target }),
		onFinish: setFinishing,
		onCancel: setCancelling,
		onLevelChange: actions.changeLevel,
	};

	const dialogs = (
		<>
			<StartUpgradeDialog
				subject={starting?.subject ?? null}
				village={village}
				boostPercent={boostFor(lane)}
				lane={lane}
				lanes={lanes}
				now={now}
				onConfirm={(builderId) => starting && actions.start(starting.target, starting.subject.step, builderId)}
				onClose={() => setStarting(null)}
			/>
			<FinishUpgradeDialog
				subject={finishing}
				now={now}
				onConfirm={(method) => finishing && actions.finish(finishing.target, method)}
				onClose={() => setFinishing(null)}
			/>
			<CancelUpgradeDialog
				subject={cancelling}
				now={now}
				onConfirm={() => cancelling && actions.cancel(cancelling.target, cancelling.fromLevel)}
				onClose={() => setCancelling(null)}
			/>
		</>
	);

	return { handlers, dialogs };
};
