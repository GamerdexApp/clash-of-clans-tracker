"use client";

import { LuLock } from "react-icons/lu";

import { massEditText } from "@/lib/messages/massEdit";

interface CategoryOption {
	id: string;
	label: string;
	/** Rows at max out of rows, such as "27 / 45". */
	count?: string;
	locked?: boolean;
}

interface CategoryPickerProps {
	label: string;
	options: CategoryOption[];
	activeId: string;
	onChange: (id: string) => void;
}

/** Categories as buttons that wrap onto more lines, so none runs off the page. */
export const CategoryPicker = ({ label, options, activeId, onChange }: CategoryPickerProps) => (
	<nav aria-label={label}>
		<ul className="flex flex-wrap gap-2">
			{options.map((option) => {
				const active = option.id === activeId;
				return (
					<li key={option.id}>
						<button
							type="button"
							aria-current={active ? "true" : undefined}
							onClick={() => onChange(option.id)}
							className={`flex min-h-11 items-center gap-2 rounded-md border-[1.5px] px-3 lg:min-h-9 ${
								active ? "border-primary bg-tint font-semibold" : "border-line bg-surface hover:bg-tint"
							} ${option.locked ? "text-muted border-dashed" : ""}`}
						>
							{option.locked && <LuLock aria-hidden="true" size={14} />}
							{option.label}
							{option.count && <span className="text-muted font-mono text-xs">{option.count}</span>}
							{option.locked && <span className="sr-only">{massEditText.category.lockedSuffix}</span>}
						</button>
					</li>
				);
			})}
		</ul>
	</nav>
);
