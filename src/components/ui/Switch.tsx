"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { uiText } from "@/lib/messages/ui";

interface SwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	labelledBy?: string;
	describedBy?: string;
	label?: string;
}

export function Switch({
	checked,
	onChange,
	disabled = false,
	labelledBy,
	describedBy,
	label,
}: SwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			aria-labelledby={labelledBy}
			aria-describedby={describedBy}
			disabled={disabled}
			onClick={() => onChange(!checked)}
			className={`relative z-1 h-7 w-12 shrink-0 rounded-full border-[1.5px] transition-colors before:absolute before:-inset-2.5 before:content-[''] disabled:opacity-50 lg:before:inset-x-0 lg:before:-inset-y-1.5 ${
				checked ? "border-primary bg-primary" : "border-line bg-track"
			}`}
		>
			<span
				aria-hidden="true"
				className={`absolute top-0.5 size-5 rounded-full transition-all ${
					checked ? "bg-on-primary inset-s-5.5" : "bg-muted inset-s-0.5"
				}`}
			/>
			<span className="sr-only">{checked ? uiText.switch.on : uiText.switch.off}</span>
		</button>
	);
}

interface SwitchRowProps {
	label: string;
	description?: ReactNode;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}
