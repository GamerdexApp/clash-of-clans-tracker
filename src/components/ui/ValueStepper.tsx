"use client";

import { LuMinus, LuPlus } from "react-icons/lu";
import { uiText } from "@/lib/messages/ui";
import { IconButton } from "./IconButton";

interface ValueStepperProps {
	label: string;
	value: number;
	min: number;
	max: number;
	onChange: (value: number) => void;
	display?: string;
	suffix?: string;
	disabled?: boolean;
	/** How much one press changes the value. */
	step?: number;
}

const BUTTON_CLASSES = "border-line bg-surface hover:bg-tint border-[1.5px]";
const SPACER_CLASSES = "size-8 shrink-0 lg:size-7";

/**
 * A button that cannot act is removed and an empty space of the same size keeps the rows aligned.
 * It steps by one unless a caller passes `step`. A caller with labelled stops passes `display`.
 */
export function ValueStepper({
	label,
	value,
	min,
	max,
	onChange,
	display,
	suffix,
	disabled = false,
	step = 1,
}: ValueStepperProps) {
	return (
		<span className="relative inline-flex items-center gap-1">
			{value > min ? (
				<IconButton
					compact
					label={uiText.stepper.lower(label)}
					disabled={disabled}
					onClick={() => onChange(Math.max(min, value - step))}
					className={BUTTON_CLASSES}
				>
					<LuMinus size={14} aria-hidden="true" />
				</IconButton>
			) : (
				<span aria-hidden="true" className={SPACER_CLASSES} />
			)}
			<span className="min-w-8 text-center font-mono font-medium">
				<span className="sr-only">{uiText.stepper.labelPrefix(label)}</span>
				{display ?? value}
			</span>
			{value < max ? (
				<IconButton
					compact
					label={uiText.stepper.raise(label)}
					disabled={disabled}
					onClick={() => onChange(Math.min(max, value + step))}
					className={BUTTON_CLASSES}
				>
					<LuPlus size={14} aria-hidden="true" />
				</IconButton>
			) : (
				<span aria-hidden="true" className={SPACER_CLASSES} />
			)}
			{suffix && <span className="text-muted font-mono text-xs">{suffix}</span>}
		</span>
	);
}
