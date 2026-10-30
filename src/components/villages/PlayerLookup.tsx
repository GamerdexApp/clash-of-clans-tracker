"use client";

import { fetchPlayerByTag, type PlayerLookupError } from "@/app/actions/fetchPlayer";
import { useState } from "react";
import { useApiCooldown } from "@/lib/hooks/useApiCooldown";
import { commonText } from "@/lib/messages/common";
import { villagesText } from "@/lib/messages/villages";
import { normalizePlayerTag } from "@/service/playerTag";
import { mapPlayerApiToVillageData } from "@/lib/utils/playerApiMapper";
import { Button } from "@/comps/ui/Button";
import { Field } from "@/comps/ui/Field";
import { Input } from "@/comps/ui/Input";
import { Note } from "@/comps/ui/Note";
import type { PlayerLookupProps } from "@/types/components/villages";

const text = villagesText.lookup;

const lookupErrorText = (error: PlayerLookupError) => {
	switch (error.kind) {
		case "rateLimit":
			return commonText.lookupError.rateLimit(error.seconds);
		case "unavailable":
			return text.unavailable;
		case "notFound":
			return commonText.lookupError.notFound(error.tag);
		case "api":
			return commonText.lookupError.api(error.status);
		case "network":
			return commonText.lookupError.network;
	}
};

export const PlayerLookup = ({
	tag,
	onTagChange,
	onFetched,
	fetchLabel,
	result,
}: PlayerLookupProps) => {
	const { secondsLeft, isOnCooldown, startCooldown } = useApiCooldown();
	const [fetching, setFetching] = useState(false);
	const [error, setError] = useState("");

	const fetchPlayer = async () => {
		const normalized = normalizePlayerTag(tag);
		if (!normalized) return;
		onTagChange(normalized);
		setFetching(true);
		setError("");

		const response = await fetchPlayerByTag(normalized);
		setFetching(false);

		if (!response.success) {
			if (response.error.kind === "rateLimit") startCooldown(response.error.seconds);
			setError(lookupErrorText(response.error));
			return;
		}
		startCooldown();
		onFetched(response.player, mapPlayerApiToVillageData(response.player));
	};

	return (
		<div className="flex flex-col gap-2">
			<Field label={text.tagLabel} hint={text.serverNote}>
				<div className="flex gap-2">
					<Input
						value={tag}
						placeholder={text.tagPlaceholder}
						className="flex-1"
						onChange={(event) => onTagChange(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								void fetchPlayer();
							}
						}}
					/>
					<Button
						onClick={fetchPlayer}
						loading={fetching}
						disabled={!tag.trim() || isOnCooldown}
					>
						{isOnCooldown ? text.wait(secondsLeft) : fetchLabel}
					</Button>
				</div>
			</Field>
			{error && <Note tone="warning">{error}</Note>}
			{result}
		</div>
	);
};
