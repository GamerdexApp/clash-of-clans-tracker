"use client";

import { syncText } from "@/lib/messages/sync";
import type { SyncProviderId } from "@/lib/sync/providers";
import { DATA_REPOSITORY_NAME } from "@/lib/sync/repository";
import { ProviderIcon } from "./ProviderIcon";

const text = syncText;

interface ProviderTilesProps {
	providers: SyncProviderId[];
	selected: SyncProviderId;
	onSelect: (provider: SyncProviderId) => void;
}

export const ProviderTiles = ({ providers, selected, onSelect }: ProviderTilesProps) => (
	<div role="radiogroup" aria-label={text.connect.pickerLabel} className="grid gap-3 sm:grid-cols-2">
		{providers.map((provider) => {
			const active = provider === selected;
			return (
				<button
					key={provider}
					type="button"
					role="radio"
					aria-checked={active}
					onClick={() => onSelect(provider)}
					className={`flex items-start gap-3 rounded-md border-[1.5px] p-3 text-start transition-colors ${
						active ? "border-primary bg-tint" : "border-line bg-surface hover:bg-tint"
					}`}
				>
					<ProviderIcon provider={provider} />
					<span className="flex min-w-0 flex-col gap-0.5">
						<span className="font-semibold">{text.provider[provider].name}</span>
						<span className="text-muted">{text.provider[provider].tile(DATA_REPOSITORY_NAME)}</span>
						<span className="text-link text-xs font-semibold">{text.provider[provider].badge}</span>
					</span>
				</button>
			);
		})}
	</div>
);
