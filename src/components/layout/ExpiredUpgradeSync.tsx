"use client";

import { useEffect } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { storageService } from "@/service/storage";
import { completeExpiredUpgrades, runningUpgrades } from "@/service/upgradeEngine";
import { completedLabel } from "@/service/upgradeLabels";
import { useToast } from "@/comps/ui/Toast";

const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * Completes every upgrade whose timer has ended, on open and again at the next finish time.
 * All of them save in one write and one toast lists them, with one Undo.
 */
export const ExpiredUpgradeSync = () => {
	const { activePlaythrough, isLoaded, updateData } = usePlaythrough();
	const showToast = useToast();
	const activeId = activePlaythrough?.id;
	const village = activePlaythrough;

	useEffect(() => {
		if (!isLoaded || !village || !activeId) return;

		const completeNow = () => {
			const now = Date.now();
			const latestVillage = storageService.load().playthroughs.find((candidate) => candidate.id === activeId);
			const hasExpired = latestVillage
				? runningUpgrades(latestVillage).some(({ upgrade }) => Date.parse(upgrade.finishesAt) <= now)
				: false;
			if (!hasExpired) return;

			let completedLabels: string[] = [];
			const previous = updateData((current) => {
				const latest = current.playthroughs.find((candidate) => candidate.id === activeId);
				if (!latest) return current;
				const { village: next, completed } = completeExpiredUpgrades(latest, new Date());
				if (completed.length === 0) return current;
				completedLabels = completed.map(completedLabel);
				return { ...current, playthroughs: current.playthroughs.map((p) => (p.id === activeId ? next : p)) };
			});
			if (!previous || completedLabels.length === 0) return;

			showToast({
				variant: "success",
				title: completedLabels.length === 1 ? "Upgrade finished" : `${completedLabels.length} upgrades finished`,
				message: completedLabels.join(", "),
				action: { label: "Undo", onAction: () => updateData(() => previous) },
			});
		};

		completeNow();

		const finishTimes = runningUpgrades(village).map(({ upgrade }) => Date.parse(upgrade.finishesAt));
		const next = Math.min(...finishTimes.filter((time) => time > Date.now()));
		if (!Number.isFinite(next)) return;
		const timer = setTimeout(completeNow, Math.min(next - Date.now() + 250, MAX_TIMEOUT_MS));
		return () => clearTimeout(timer);
	}, [isLoaded, village, activeId, updateData, showToast]);

	return null;
};
