"use client";

import { useState } from "react";
import { Input } from "./Input";

interface NumberInputProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	"aria-label"?: string;
	className?: string;
}

/**
 * A number the player types. A valid number is passed on as it is typed and kept inside the
 * range. A half typed value stays on screen while the field has focus, and the field shows the
 * saved value again when it loses focus.
 */
export function NumberInput({
	value,
	onChange,
	min = 0,
	max = Number.MAX_SAFE_INTEGER,
	step = 1,
	className = "",
	...props
}: NumberInputProps) {
	const [typed, setTyped] = useState<string | null>(null);

	return (
		<Input
			type="text"
			inputMode={step < 1 ? "decimal" : "numeric"}
			value={typed ?? String(value)}
			className={`font-mono ${className}`}
			onFocus={() => setTyped(String(value))}
			onBlur={() => setTyped(null)}
			onChange={(event) => {
				const raw = event.target.value;
				setTyped(raw);
				const parsed = Number(raw);
				if (raw.trim() !== "" && Number.isFinite(parsed)) {
					onChange(Math.min(max, Math.max(min, parsed)));
				}
			}}
			{...props}
		/>
	);
}
