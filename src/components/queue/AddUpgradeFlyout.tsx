"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";

import { formatDuration, formatNumber } from "@/lib/format";
import { queueText } from "@/lib/messages/queue";
import { availableFor, queueItemForGroup } from "@/service/queueAvailability";
import { boostedStep } from "@/service/upgradeEngine";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { Checkbox } from "@/comps/ui/Checkbox";
import { Dialog } from "@/comps/ui/Dialog";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Field } from "@/comps/ui/Field";
import { Input } from "@/comps/ui/Input";
import { Select } from "@/comps/ui/Select";
import type { AvailableGroup } from "@/types/app/available";
import type { AddUpgradeFlyoutProps, GroupCardProps } from "@/types/components/upgradeQueue";
import { queueLanes } from "./queueLanes";

const text = queueText.add;
const LEVELS_SHOWN = 3;
const GROUPS_SHOWN = 40;
const LOCKED_SHOWN = 5;

/** The group's steps up to and including a level, in order. */
const stepsUpTo = (group: AvailableGroup, level: number) => group.steps.filter((step) => step.level <= level);

const groupLabel = (group: AvailableGroup) =>
	group.target.kind === "building" ? `${group.name} #${group.target.instanceIndex + 1}` : group.name;

const GroupCard = ({ lane, group, boostPercent, onAdd }: GroupCardProps) => {
	const [showAll, setShowAll] = useState(false);
	const steps = showAll ? group.steps : group.steps.slice(0, LEVELS_SHOWN);

	return (
		<Card className="flex flex-col gap-2 p-3">
			<div className="flex items-center gap-2.5">
				{group.imageUrl && (
					<Image src={group.imageUrl} alt="" width={36} height={36} style={{ width: 36, height: 36 }} className="shrink-0 object-contain" />
				)}
				<span className="truncate font-medium">{groupLabel(group)}</span>
			</div>
			<ul className="flex flex-col gap-1.5">
				{steps.map((step, index) => {
					const boosted = boostedStep(step, boostPercent, lane);
					return (
						<li key={step.level} className="border-line flex flex-wrap items-center justify-between gap-2 border-t-[1.5px] pt-1.5 first:border-t-0 first:pt-0">
							<span className="flex flex-col">
								<span className="font-mono text-sm font-medium">
									Lv {step.level}
									{step.isSupercharge ? " supercharge" : ""}
								</span>
								<span className="text-muted text-xs">
									{formatDuration(boosted.durationMs)}, {formatNumber(boosted.cost)} {step.costResource}
								</span>
							</span>
							<span className="flex flex-wrap gap-2">
								<Button onClick={() => onAdd(step.level, false)}>{text.add}</Button>
								{index > 0 && (
									<Button variant="link" onClick={() => onAdd(step.level, true)}>
										{text.addUpToHere}
									</Button>
								)}
							</span>
						</li>
					);
				})}
			</ul>
			{group.steps.length > LEVELS_SHOWN && !showAll && (
				<div>
					<Button variant="link" onClick={() => setShowAll(true)}>
						{text.showMore}
					</Button>
				</div>
			)}
		</Card>
	);
};

const FlyoutContent = ({
	lane,
	village,
	lanes,
	initialLaneId,
	boostPercent,
	hiddenCategories,
	onHiddenCategoriesChange,
	onAdd,
	onUnlock,
	onClose,
}: Omit<AddUpgradeFlyoutProps, "open">) => {
	const laneText = queueText.lanes[lane];
	const { categoryOrder, hiddenKey } = queueLanes[lane];
	const categoryName = (id: string) => (laneText.categories as Record<string, string>)[id] ?? id;
	const [laneId, setLaneId] = useState<number>(initialLaneId ?? lanes[0]?.slot.id ?? 1);
	const [category, setCategory] = useState<string>("all");
	const [search, setSearch] = useState("");
	const [choosing, setChoosing] = useState(false);
	const [limit, setLimit] = useState(GROUPS_SHOWN);
	const [showAllLocked, setShowAllLocked] = useState(false);

	const { groups, locked } = useMemo(() => availableFor(village, lane), [village, lane]);
	const counts = useMemo(() => {
		const byCategory = new Map<string, number>();
		for (const group of groups) byCategory.set(group.category, (byCategory.get(group.category) ?? 0) + 1);
		return byCategory;
	}, [groups]);

	const needle = search.trim().toLowerCase();
	const visible = groups.filter((group) => {
		if (needle && !group.name.toLowerCase().includes(needle)) return false;
		if (category === "all") return !hiddenCategories.includes(group.category);
		return group.category === category;
	});
	const hiddenNames = hiddenCategories.map(categoryName);
	const lockedVisible = locked.filter((group) => !needle || group.name.toLowerCase().includes(needle));

	const addGroup = (group: AvailableGroup, level: number, upTo: boolean) => {
		const steps = upTo ? stepsUpTo(group, level) : group.steps.filter((step) => step.level === level);
		onAdd(laneId, steps.map((step) => queueItemForGroup(lane, group, step)), groupLabel(group));
	};

	const toggleHidden = (id: string, hidden: boolean) =>
		onHiddenCategoriesChange(hidden ? [...hiddenCategories, id] : hiddenCategories.filter((value) => value !== id));

	return (
		<Dialog
			open
			onClose={onClose}
			variant="flyout"
			title={laneText.add.title}
			description={laneText.add.description}
			footer={<Button variant="primary" onClick={onClose}>{text.close}</Button>}
		>
			<Field label={laneText.add.lane}>
				<Select value={laneId} onChange={(event) => setLaneId(Number(event.target.value))}>
					{lanes.map((lane) => (
						<option key={lane.slot.id} value={lane.slot.id}>
							{lane.slot.label}
						</option>
					))}
				</Select>
			</Field>
			<Input
				type="search"
				value={search}
				aria-label={laneText.add.search}
				placeholder={laneText.add.search}
				leadingIcon={<LuSearch size={16} aria-hidden="true" />}
				onChange={(event) => setSearch(event.target.value)}
			/>
			{categoryOrder.length > 1 && (
				<div role="group" aria-label={laneText.add.title} className="flex flex-wrap gap-2">
					{["all", ...categoryOrder]
						.filter((id) => id === "all" || (counts.get(id) ?? 0) > 0)
						.map((id) => (
							<button
								key={id}
								type="button"
								aria-pressed={category === id}
								onClick={() => setCategory(id)}
								className={`min-h-11 rounded-full border-[1.5px] px-3 text-sm lg:min-h-9 ${
									category === id ? "border-primary bg-primary text-on-primary" : "border-line bg-surface"
								}`}
							>
								{id === "all" ? text.allLabel : categoryName(id)}
								{id !== "all" && <span className="ms-1.5 font-mono text-xs">{counts.get(id)}</span>}
							</button>
						))}
				</div>
			)}
			{hiddenKey && (
				<div className="text-muted flex flex-wrap items-center gap-x-3 text-sm">
					{hiddenNames.length > 0 && <span>{text.hiddenFromAll(hiddenNames.join(", "))}</span>}
					<Button variant="link" onClick={() => setChoosing((open) => !open)}>
						{text.chooseCategories}
					</Button>
				</div>
			)}
			{hiddenKey && choosing && (
				<div className="bg-bg flex flex-col gap-2 rounded-md p-3">
					<p className="text-muted">{text.chooseCategoriesHelp}</p>
					{categoryOrder.map((id) => (
						<Checkbox
							key={id}
							label={categoryName(id)}
							checked={!hiddenCategories.includes(id)}
							onChange={(shown) => toggleHidden(id, !shown)}
						/>
					))}
				</div>
			)}
			{lockedVisible.length > 0 && (
				<div className="bg-bg flex flex-col gap-2 rounded-md p-3">
					<span className="font-semibold">{text.unlockTitle}</span>
					<p className="text-muted">{text.unlockHelp}</p>
					<ul className="flex flex-col gap-2">
						{(showAllLocked ? lockedVisible : lockedVisible.slice(0, LOCKED_SHOWN)).map((group) => (
							<li key={group.key} className="flex items-center justify-between gap-2">
								<span className="flex min-w-0 items-center gap-2.5">
									{group.imageUrl && (
										<Image src={group.imageUrl} alt="" width={32} height={32} style={{ width: 32, height: 32 }} className="shrink-0 object-contain" />
									)}
									<span className="truncate">{group.name}</span>
								</span>
								<Button onClick={() => onUnlock(group)}>{text.markUnlocked}</Button>
							</li>
						))}
					</ul>
					{lockedVisible.length > LOCKED_SHOWN && (
						<div>
							<Button variant="link" onClick={() => setShowAllLocked((all) => !all)}>
								{showAllLocked ? text.showFewerLocked : text.showAllLocked(lockedVisible.length)}
							</Button>
						</div>
					)}
				</div>
			)}
			{visible.length === 0 ? (
				<EmptyState title={text.nothing} description={text.nothingDescription} />
			) : (
				<div className="flex flex-col gap-3">
					{visible.slice(0, limit).map((group) => (
						<GroupCard
							key={group.key}
							lane={lane}
							group={group}
							boostPercent={boostPercent}
							onAdd={(level, upTo) => addGroup(group, level, upTo)}
						/>
					))}
					{visible.length > limit && (
						<Button onClick={() => setLimit((current) => current + GROUPS_SHOWN)}>{text.showMoreUpgrades}</Button>
					)}
				</div>
			)}
		</Dialog>
	);
};

export const AddUpgradeFlyout = ({ open, ...props }: AddUpgradeFlyoutProps) =>
	open ? <FlyoutContent {...props} /> : null;
