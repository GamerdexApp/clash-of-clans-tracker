"use client";

import { useState } from "react";
import { Input } from "./Input";

interface CommitNumberInputProps {
	value: number;
	onCommit: (value: number) => void;
	min?: number;
	max?: number;
	"aria-label"?: string;
	className?: string;
}

/**
 * A whole number the player types. The value is saved when the field loses focus or Enter is
 * pressed, so a rule that compares two fields never sees a half typed number. An empty or invalid
 * entry returns to the saved value.
 */
export function CommitNumberInput({
	value,
	onCommit,
	min = 0,
	max = Number.MAX_SAFE_INTEGER,
	className = "",
	...props
}: CommitNumberInputProps) {
	const [typed, setTyped] = useState<string | null>(null);

	const commit = () => {
		if (typed === null) return;
		const parsed = Math.floor(Number(typed));
		setTyped(null);
		if (typed.trim() !== "" && Number.isFinite(parsed) && parsed !== value) {
			onCommit(Math.min(max, Math.max(min, parsed)));
		}
	};

	return (
		<Input
			type="text"
			inputMode="numeric"
			value={typed ?? String(value)}
			className={`font-mono ${className}`}
			onFocus={() => setTyped(String(value))}
			onChange={(event) => setTyped(event.target.value)}
			onBlur={commit}
			onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
			{...props}
		/>
	);
}
