"use client";

import { useState } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";

import { wallsText } from "@/lib/messages/walls";
import { IconButton } from "@/comps/ui/IconButton";
import { Input } from "@/comps/ui/Input";

interface CountFieldProps {
	level: number;
	value: number;
	max: number;
	onCommit: (count: number) => void;
}

const BUTTON_CLASSES = "border-line bg-surface hover:bg-tint border-[1.5px]";

/** A count the player types or steps. A typed number is saved when the field loses focus or Enter is pressed. */
export const CountField = ({ level, value, max, onCommit }: CountFieldProps) => {
	const [typed, setTyped] = useState<string | null>(null);

	const commit = () => {
		if (typed === null) return;
		const parsed = Math.floor(Number(typed));
		setTyped(null);
		if (typed.trim() !== "" && Number.isFinite(parsed) && parsed !== value) onCommit(Math.max(0, parsed));
	};

	return (
		<span className="inline-flex items-center gap-1">
			<IconButton label={wallsText.row.lower(level)} compact disabled={value <= 0} onClick={() => onCommit(value - 1)} className={BUTTON_CLASSES}>
				<LuMinus size={14} aria-hidden="true" />
			</IconButton>
			<Input
				type="text"
				inputMode="numeric"
				aria-label={wallsText.row.ownLabel(level)}
				value={typed ?? String(value)}
				className="w-20 text-center font-mono"
				onFocus={() => setTyped(String(value))}
				onChange={(event) => setTyped(event.target.value)}
				onBlur={commit}
				onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
			/>
			<IconButton label={wallsText.row.raise(level)} compact disabled={value >= max} onClick={() => onCommit(value + 1)} className={BUTTON_CLASSES}>
				<LuPlus size={14} aria-hidden="true" />
			</IconButton>
		</span>
	);
};
