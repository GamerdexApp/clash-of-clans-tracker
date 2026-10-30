"use client";

import { useSync } from "@/lib/contexts/SyncContext";
import { syncText } from "@/lib/messages/sync";
import { Button } from "@/comps/ui/Button";

const text = syncText.disconnect;

export const DisconnectCard = () => {
	const { provider, signOut } = useSync();
	if (!provider) return null;
	return (
		<div className="border-danger bg-surface flex flex-col gap-3 rounded-md border-[1.5px] p-4">
			<h2 className="text-danger text-base font-semibold">{text.title}</h2>
			<p>{text.body}</p>
			<div>
				<Button variant="danger" onClick={signOut}>
					{text.button(syncText.provider[provider].name)}
				</Button>
			</div>
			<p className="text-muted">{text.hints[provider]}</p>
		</div>
	);
};
