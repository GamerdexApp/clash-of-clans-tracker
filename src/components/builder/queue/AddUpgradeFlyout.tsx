"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";

import { formatDuration, formatNumber } from "@/lib/format";
import { queueText } from "@/lib/messages/queue";
import { availableUpgrades, queueItemFor, stepsUpTo } from "@/service/availableUpgrades";
import { boostedStep } from "@/service/upgradeEngine";
import { Button } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { Checkbox } from "@/comps/ui/Checkbox";
import { Dialog } from "@/comps/ui/Dialog";
import { EmptyState } from "@/comps/ui/EmptyState";
import { Field } from "@/comps/ui/Field";
import { Input } from "@/comps/ui/Input";
import { Select } from "@/comps/ui/Select";
import type { AvailableCategory } from "@/types/app/available";
import type { AddUpgradeFlyoutProps, GroupCardProps } from "@/types/components/builderQueue";

const text = queueText.add;
const CATEGORY_ORDER: AvailableCategory[] = [
	"defenses",
	"armyBuildings",
	"resourceBuildings",
	"traps",
	"heroes",
	"townHall",
	"craftedDefenses",
	"guardians",
	"supercharges",
];
const LEVELS_SHOWN = 3;
const GROUPS_SHOWN = 40;

const GroupCard = ({ group, boostPercent, onAdd }: GroupCardProps) => {
	const [showAll, setShowAll] = useState(false);
	const steps = showAll ? group.steps : group.steps.slice(0, LEVELS_SHOWN);

	return (
		<Card className="flex flex-col gap-2 p-3">
			<div className="flex items-center gap-2.5">
				{group.imageUrl && (
					<Image src={group.imageUrl} alt="" width={36} height={36} style={{ width: 36, height: 36 }} className="shrink-0 object-contain" />
				)}
				<span className="truncate font-medium">
					{group.target.kind === "building" ? `${group.name} #${group.target.instanceIndex + 1}` : group.name}
				</span>
			</div>
			<ul className="flex flex-col gap-1.5">
				{steps.map((step, index) => {
					const boosted = boostedStep(step, boostPercent);
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
	village,
	lanes,
	initialLaneId,
	boostPercent,
	hiddenCategories,
	onHiddenCategoriesChange,
	onAdd,
	onClose,
}: Omit<AddUpgradeFlyoutProps, "open">) => {
	const [laneId, setLaneId] = useState<number>(initialLaneId ?? lanes[0]?.slot.id ?? 1);
	const [category, setCategory] = useState<AvailableCategory | "all">("all");
	const [search, setSearch] = useState("");
	const [choosing, setChoosing] = useState(false);
	const [limit, setLimit] = useState(GROUPS_SHOWN);

	const groups = useMemo(() => availableUpgrades(village), [village]);
	const counts = useMemo(() => {
		const byCategory = new Map<AvailableCategory, number>();
		for (const group of groups) byCategory.set(group.category, (byCategory.get(group.category) ?? 0) + 1);
		return byCategory;
	}, [groups]);

	const needle = search.trim().toLowerCase();
	const visible = groups.filter((group) => {
		if (needle && !group.name.toLowerCase().includes(needle)) return false;
		if (category === "all") return !hiddenCategories.includes(group.category);
		return group.category === category;
	});
	const hiddenNames = hiddenCategories.map((id) => text.categories[id as AvailableCategory]).filter(Boolean);

	const addGroup = (group: (typeof groups)[number], level: number, upTo: boolean) => {
		const steps = upTo ? stepsUpTo(group, level) : group.steps.filter((step) => step.level === level);
		const label = group.target.kind === "building" ? `${group.name} #${group.target.instanceIndex + 1}` : group.name;
		onAdd(laneId, steps.map((step) => queueItemFor(group, step)), label);
	};

	const toggleHidden = (id: AvailableCategory, hidden: boolean) =>
		onHiddenCategoriesChange(hidden ? [...hiddenCategories, id] : hiddenCategories.filter((value) => value !== id));

	return (
		<Dialog
			open
			onClose={onClose}
			variant="flyout"
			title={text.title}
			description={text.description}
			footer={<Button variant="primary" onClick={onClose}>{text.close}</Button>}
		>
			<Field label={text.lane}>
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
				aria-label={text.search}
				placeholder={text.search}
				leadingIcon={<LuSearch size={16} aria-hidden="true" />}
				onChange={(event) => setSearch(event.target.value)}
			/>
			<div role="group" aria-label={text.title} className="flex flex-wrap gap-2">
				{(["all", ...CATEGORY_ORDER] as const)
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
							{text.categories[id]}
							{id !== "all" && <span className="ms-1.5 font-mono text-xs">{counts.get(id)}</span>}
						</button>
					))}
			</div>
			<div className="text-muted flex flex-wrap items-center gap-x-3 text-sm">
				{hiddenNames.length > 0 && <span>{text.hiddenFromAll(hiddenNames.join(", "))}</span>}
				<Button variant="link" onClick={() => setChoosing((open) => !open)}>
					{text.chooseCategories}
				</Button>
			</div>
			{choosing && (
				<div className="bg-bg flex flex-col gap-2 rounded-md p-3">
					<p className="text-muted">{text.chooseCategoriesHelp}</p>
					{CATEGORY_ORDER.map((id) => (
						<Checkbox
							key={id}
							label={text.categories[id]}
							checked={!hiddenCategories.includes(id)}
							onChange={(shown) => toggleHidden(id, !shown)}
						/>
					))}
				</div>
			)}
			{visible.length === 0 ? (
				<EmptyState title={text.nothing} description={text.nothingDescription} />
			) : (
				<div className="flex flex-col gap-3">
					{visible.slice(0, limit).map((group) => (
						<GroupCard
							key={group.key}
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
