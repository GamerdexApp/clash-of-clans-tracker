import { LuMinus, LuPlus } from "react-icons/lu";
import { IconButton } from "./IconButton";
import { NumberInput } from "./NumberInput";

interface NumberStepperProps {
	value: number;
	label: string;
	raiseLabel: string;
	lowerLabel: string;
	/** How much one press of a button changes the value. */
	step: number;
	min?: number;
	max?: number;
	onChange: (value: number) => void;
}

/** A number field with a button on each side. The buttons move the value by `step`. */
export function NumberStepper({
	value,
	label,
	raiseLabel,
	lowerLabel,
	step,
	min = 0,
	max = Number.MAX_SAFE_INTEGER,
	onChange,
}: NumberStepperProps) {
	return (
		<span className="flex items-center gap-1">
			<IconButton
				compact
				label={lowerLabel}
				disabled={value <= min}
				onClick={() => onChange(Math.max(min, value - step))}
				className="border-line bg-surface hover:bg-tint border-[1.5px]"
			>
				<LuMinus size={14} aria-hidden="true" />
			</IconButton>
			<NumberInput
				aria-label={label}
				className="w-20 text-center"
				value={value}
				min={min}
				max={max}
				onChange={onChange}
			/>
			<IconButton
				compact
				label={raiseLabel}
				disabled={value >= max}
				onClick={() => onChange(Math.min(max, value + step))}
				className="border-line bg-surface hover:bg-tint border-[1.5px]"
			>
				<LuPlus size={14} aria-hidden="true" />
			</IconButton>
		</span>
	);
}
