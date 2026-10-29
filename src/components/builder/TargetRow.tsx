"use client";

import { formatCountdown } from "@/lib/format";
import { builderText } from "@/lib/messages/builder";
import { builderLabelFor, readLevel, readUpgrade } from "@/service/upgradeEngine";
import { nextStep } from "@/service/upgradeSteps";
import { Button } from "@/comps/ui/Button";
import { ValueStepper } from "@/comps/ui/ValueStepper";
import type { RunningSubject } from "@/types/components/upgrades";
import type { TargetRowProps } from "@/types/components/builder";

const text = builderText.card;

/** One thing a builder can upgrade: its level, and either an Upgrade button or the running timer. */
export const TargetRow = ({
	village,
	target,
	name,
	maxLevel,
	now,
	prefix,
	note,
	hideStepperAtZero = true,
	onStart,
	onFinish,
	onCancel,
	onLevelChange,
}: TargetRowProps) => {
	const level = readLevel(village, target);
	const running = readUpgrade(village, target);
	const step = nextStep(village, target);

	const runningSubject = (finishesAt: string, builderId: number): RunningSubject => ({
		target,
		name,
		fromLevel: level,
		finishesAt,
		builderLabel: builderLabelFor(builderId),
		step,
	});

	const upgradeLabel = () => {
		if (!step) return "";
		if (level === 0) return text.build;
		return step.isSupercharge ? text.superchargeTo(step.level) : text.upgradeTo(step.level);
	};

	return (
		<li className="border-line flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t-[1.5px] pt-2 first:border-t-0 first:pt-0">
			<div className="flex min-w-0 flex-col gap-0.5">
				<span className="flex items-center gap-2">
					{prefix}
					{hideStepperAtZero && level === 0 && !running ? (
						<span className="text-muted">{text.notBuilt}</span>
					) : (
						<ValueStepper
							label={name}
							value={level}
							min={0}
							max={maxLevel}
							onChange={(next) => onLevelChange(target, next)}
							suffix={`/ ${maxLevel}`}
							disabled={running !== undefined}
						/>
					)}
				</span>
				{note}
			</div>
			{running ? (
				<div className="flex flex-wrap items-center gap-2">
					<span className="flex flex-col items-end">
						<span className="text-xs">{text.running(level + 1)}</span>
						<span className="font-mono text-sm font-medium">
							{formatCountdown(Date.parse(running.finishesAt) - now)}
						</span>
					</span>
					<Button onClick={() => onFinish(runningSubject(running.finishesAt, running.builderId))}>
						{text.finish}
					</Button>
					<Button variant="danger" onClick={() => onCancel(runningSubject(running.finishesAt, running.builderId))}>
						{text.cancel}
					</Button>
				</div>
			) : step ? (
				<Button variant="primary" onClick={() => onStart({ name, fromLevel: level, step }, target)}>
					{upgradeLabel()}
				</Button>
			) : (
				<span className="text-muted font-medium">{text.maxed}</span>
			)}
		</li>
	);
};
