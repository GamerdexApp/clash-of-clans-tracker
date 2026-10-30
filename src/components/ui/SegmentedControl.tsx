"use client";

import { useId } from "react";
import type { ReactNode } from "react";

interface SegmentedControlProps<Value extends string> {
	label: string;
	options: { id: Value; label: string; icon?: ReactNode }[];
	value: Value;
	onChange: (value: Value) => void;
	/** Shares the width of its container between the options. */
	fullWidth?: boolean;
}

export function SegmentedControl<Value extends string>({
	label,
	options,
	value,
	onChange,
	fullWidth = false,
}: SegmentedControlProps<Value>) {
	const name = useId();

	return (
		<fieldset
			className={`border-line overflow-hidden rounded-md border-[1.5px] ${fullWidth ? "flex" : "inline-flex"}`}
		>
			<legend className="sr-only">{label}</legend>
			{options.map((option) => (
				<label
					key={option.id}
					className={`flex min-h-11 min-w-11 ${fullWidth ? "flex-1 px-2 text-center" : "px-3"} cursor-pointer items-center justify-center gap-1.5 font-medium has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-[:focus-visible]:outline-(--ring) lg:min-h-9 ${
						option.id === value ? "bg-tint text-ink" : "bg-surface text-muted"
					}`}
				>
					<input
						type="radio"
						name={name}
						value={option.id}
						checked={option.id === value}
						onChange={() => onChange(option.id)}
						className="sr-only"
					/>
					{option.icon}
					{option.label}
				</label>
			))}
		</fieldset>
	);
}
