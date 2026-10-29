"use client";

import { useState } from "react";

import { formatNumber } from "@/lib/format";
import { dailiesText } from "@/lib/messages/dailies";
import { Field } from "@/comps/ui/Field";
import { Select } from "@/comps/ui/Select";

const text = dailiesText.helpers.alchemist;

interface ConversionCalculatorProps<Kind extends string> {
	title: string;
	options: { id: Kind; label: string }[];
	limit: (from: Kind) => number;
	step: (from: Kind) => number;
	output: (amount: number, from: Kind, to: Kind) => number;
	help: string;
}

/** Converts one amount into another resource. Nothing here is saved. */
export const ConversionCalculator = <Kind extends string>({
	title,
	options,
	limit,
	step,
	output,
	help,
}: ConversionCalculatorProps<Kind>) => {
	const [from, setFrom] = useState<Kind>(options[0].id);
	const [to, setTo] = useState<Kind>(options[options.length - 1].id);
	const [amount, setAmount] = useState(0);
	const max = limit(from);
	const shown = Math.min(amount, max);
	const labelOf = (id: Kind) => options.find((option) => option.id === id)!.label;

	return (
		<div className="flex flex-col gap-3">
			<h3 className="font-semibold">{title}</h3>
			<div className="grid grid-cols-2 gap-3">
				<Field label={text.from}>
					<Select value={from} onChange={(event) => setFrom(event.target.value as Kind)}>
						{options.map((option) => (
							<option key={option.id} value={option.id}>
								{option.label}
							</option>
						))}
					</Select>
				</Field>
				<Field label={text.to}>
					<Select value={to} onChange={(event) => setTo(event.target.value as Kind)}>
						{options.map((option) => (
							<option key={option.id} value={option.id}>
								{option.label}
							</option>
						))}
					</Select>
				</Field>
			</div>
			<label className="flex flex-col gap-1.5">
				<span className="font-medium">{text.amount}</span>
				<input
					type="range"
					min={0}
					max={max}
					step={step(from)}
					value={shown}
					onChange={(event) => setAmount(Number(event.target.value))}
					className="accent-primary h-8 w-full"
				/>
			</label>
			<p className="font-medium" aria-live="polite">
				{text.result(formatNumber(shown), labelOf(from), formatNumber(output(shown, from, to)), labelOf(to))}
			</p>
			<p className="text-muted text-xs">
				{help} {text.nothingSaved}
			</p>
		</div>
	);
};
