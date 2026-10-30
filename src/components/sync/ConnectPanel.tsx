"use client";

import { ROOT_FOLDER } from "@gamerdexapp/gamerdex-sync";

import { syncText } from "@/lib/messages/sync";
import { type SyncProviderId, usesRepository } from "@/lib/sync/providers";
import { DATA_REPOSITORY_NAME } from "@/lib/sync/repository";
import { Button } from "@/comps/ui/Button";

const text = syncText.connect;

const Step = ({ number, children }: { number: number; children: string }) => (
	<li className="flex items-start gap-3">
		<span aria-hidden="true" className="bg-primary text-on-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
			{number}
		</span>
		<span className="pt-0.5">{children}</span>
	</li>
);

interface ConnectPanelProps {
	provider: SyncProviderId;
	pickAnother: boolean;
	onConnect: () => void;
}

export const ConnectPanel = ({ provider, pickAnother, onConnect }: ConnectPanelProps) => {
	const name = usesRepository(provider) ? DATA_REPOSITORY_NAME : ROOT_FOLDER;
	const steps = text.steps[provider];
	return (
		<div className="border-primary bg-tint flex flex-col gap-3 rounded-md border-[1.5px] p-4">
			<h3 className="text-base font-semibold">{text.panelTitle(syncText.provider[provider].name)}</h3>
			<ol className="flex flex-col gap-3">
				<Step number={1}>{steps.step1(name)}</Step>
				<Step number={2}>{steps.step2()}</Step>
				<Step number={3}>{text.firstSync}</Step>
			</ol>
			<div className="flex flex-wrap items-center gap-3">
				<Button variant="primary" onClick={onConnect}>
					{steps.button}
				</Button>
				{pickAnother && <span className="text-muted">{text.another}</span>}
			</div>
		</div>
	);
};
