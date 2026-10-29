"use client";

import Image from "next/image";
import { useId } from "react";

import { dailiesText } from "@/lib/messages/dailies";
import { forgeResource, type ForgeRate } from "@/service/forge";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { ForgeResourceType } from "@/types/app/playthrough";

interface ResourcePickerProps {
	rates: ForgeRate[];
	value: ForgeResourceType;
	onChange: (type: ForgeResourceType) => void;
}

/** Five labeled radios. A resource the village cannot forge yet says which hall it needs. */
export const ResourcePicker = ({ rates, value, onChange }: ResourcePickerProps) => {
	const name = useId();
	return (
		<fieldset className="flex flex-wrap gap-2">
			<legend className="sr-only">{dailiesText.forge.slots.resource}</legend>
			{rates.map((rate) => {
				const resource = forgeResource(rate.type);
				return (
					<label
						key={rate.type}
						className={`flex min-h-11 items-center gap-2 rounded-md border-[1.5px] px-3 lg:min-h-10 ${
							rate.available ? "cursor-pointer" : "cursor-not-allowed opacity-60"
						} ${rate.type === value ? "border-primary bg-tint" : "border-line"}`}
					>
						<input
							type="radio"
							name={name}
							value={rate.type}
							checked={rate.type === value}
							disabled={!rate.available}
							onChange={() => onChange(rate.type)}
							className="accent-primary size-4"
						/>
						<Image
							src={toPublicImageUrl(resource.image)}
							alt=""
							width={20}
							height={20}
							style={{ width: 20, height: 20 }}
							className="object-contain"
						/>
						<span className="flex flex-col leading-tight">
							<span className="font-medium">{resource.label}</span>
							{rate.requirement && <span className="text-muted text-xs">{dailiesText.forge.rates.requires(rate.requirement)}</span>}
						</span>
					</label>
				);
			})}
		</fieldset>
	);
};
