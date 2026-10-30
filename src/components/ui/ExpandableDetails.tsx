"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";

interface ExpandableDetailsProps {
	showLabel: string;
	hideLabel: string;
	children: ReactNode;
}

/** A card section that opens in place instead of in a dialog. It always starts closed. */
export function ExpandableDetails({ showLabel, hideLabel, children }: ExpandableDetailsProps) {
	const [open, setOpen] = useState(false);
	const regionId = useId();

	return (
		<>
			<button
				type="button"
				aria-expanded={open}
				aria-controls={regionId}
				onClick={() => setOpen(!open)}
				className="text-link flex min-h-11 items-center gap-1.5 self-start font-semibold underline-offset-2 hover:underline lg:min-h-6"
			>
				<LuChevronDown
					aria-hidden="true"
					size={16}
					className={`transition-transform ${open ? "rotate-180" : ""}`}
				/>
				{open ? hideLabel : showLabel}
			</button>
			<div id={regionId} hidden={!open} className="flex flex-col gap-2.5">
				{children}
			</div>
		</>
	);
}
