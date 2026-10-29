import { LuCheck } from "react-icons/lu";

interface CheckboxProps {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}

export function Checkbox({ label, checked, onChange, disabled = false }: CheckboxProps) {
	return (
		<label
			className={`flex min-h-11 items-center gap-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--ring) lg:min-h-9 ${
				disabled ? "text-muted cursor-not-allowed opacity-60" : "cursor-pointer"
			}`}
		>
			<input
				type="checkbox"
				checked={checked}
				disabled={disabled}
				onChange={(event) => onChange(event.target.checked)}
				className="sr-only"
			/>
			<span
				aria-hidden="true"
				className={`flex size-5 shrink-0 items-center justify-center rounded-sm border-[1.5px] ${
					checked ? "border-primary bg-primary text-on-primary" : "border-line bg-surface"
				}`}
			>
				{checked && <LuCheck size={14} />}
			</span>
			{label}
		</label>
	);
}
