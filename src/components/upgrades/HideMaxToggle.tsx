"use client";

import { useId } from "react";

import { upgradeText } from "@/lib/messages/upgrades";
import { Switch } from "@/comps/ui/Switch";

/** The one Hide Max setting every upgrade page shares. */
export const HideMaxToggle = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => {
	const labelId = useId();
	return (
		<span className="flex items-center gap-2">
			<span id={labelId} className="font-medium">
				{upgradeText.hideMax}
			</span>
			<Switch checked={checked} onChange={onChange} labelledBy={labelId} />
		</span>
	);
};
