import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem } from "flowbite-react";
import Link from "next/link";
import { LuChevronsUpDown, LuPlus } from "react-icons/lu";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";

export const PlaythroughSwitcher = () => {
	const { playthroughs, activePlaythrough, setActivePlaythrough } = usePlaythrough();

	const handlePlaythroughSelect = (playthroughId: string) => {
		if (activePlaythrough?.id === playthroughId) return;
		setActivePlaythrough(playthroughId);
	};

	return (
		<>
			<div className="mb-2">
				<Dropdown
					dismissOnClick={true}
					renderTrigger={() => (
						<button
							type="button"
							className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-left hover:bg-white/10 focus:ring-2 focus:ring-white/20 focus:outline-none dark:hover:bg-white/10 dark:focus:ring-white/20"
						>
							<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
								{activePlaythrough?.name?.[0]?.toUpperCase() ?? "?"}
							</div>
							<div className="min-w-0 flex-1">
								<span className="truncate text-sm font-medium text-white">
									{activePlaythrough?.name || "None Selected"}
								</span>
							</div>
							<LuChevronsUpDown className="size-4 shrink-0 text-white/80" />
						</button>
					)}
				>
					<DropdownHeader>Villages</DropdownHeader>
					{playthroughs.length === 0 ? (
						<DropdownItem disabled>No villages yet</DropdownItem>
					) : (
						playthroughs.map((playthrough) => (
							<DropdownItem
								key={playthrough.id}
								onClick={() => handlePlaythroughSelect(playthrough.id)}
							>
								<div className="flex w-full items-center gap-2">
									<span className="truncate">{playthrough.name}</span>
									{activePlaythrough?.id === playthrough.id && (
										<span className="ml-auto text-xs font-medium text-primary">
											Active
										</span>
									)}
								</div>
							</DropdownItem>
						))
					)}
					<DropdownDivider />
					<DropdownItem as={Link} href="/villages?new=1">
						<div className="flex items-center gap-2">
							<div className="flex size-6 items-center justify-center rounded-md border border-gray-300 bg-transparent dark:border-gray-600">
								<LuPlus className="size-4" />
							</div>
							<span className="font-medium text-gray-500 dark:text-gray-400">
								Add Village
							</span>
						</div>
					</DropdownItem>
				</Dropdown>
			</div>

		</>
	);
}
