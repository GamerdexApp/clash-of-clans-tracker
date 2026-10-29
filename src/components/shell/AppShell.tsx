"use client";

import type { ReactNode } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useUI } from "@/lib/contexts/UIContext";
import { shellText } from "@/lib/messages/shell";
import { ThemeChoice } from "@/comps/settings/ThemeChoice";
import { Drawer } from "@/comps/ui/Drawer";
import { Skeleton } from "@/comps/ui/Skeleton";
import { AppBar } from "./AppBar";
import { Footer } from "./Footer";
import { SidebarContent } from "./SidebarContent";

const PageSkeleton = () => (
	<div className="flex flex-col gap-4" aria-busy="true">
		<Skeleton className="h-8 w-48" />
		<Skeleton className="h-40 w-full" />
		<Skeleton className="h-40 w-full" />
	</div>
);

export const AppShell = ({ children }: { children: ReactNode }) => {
	const { drawerOpen, closeDrawer } = useUI();
	const { isLoaded } = usePlaythrough();

	return (
		<div className="flex min-h-dvh">
			<a
				href="#main"
				className="focus:bg-surface sr-only focus:not-sr-only focus:fixed focus:inset-s-2 focus:top-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2"
			>
				{shellText.skipToContent}
			</a>
			<aside className="bg-sb-bg text-sb-text sticky top-0 hidden h-dvh w-62 shrink-0 flex-col px-4 pt-5 pb-4 lg:flex">
				<SidebarContent />
			</aside>
			<div className="flex min-w-0 flex-1 flex-col">
				<AppBar />
				<main
					id="main"
					tabIndex={-1}
					className="flex flex-1 flex-col gap-4 px-4 py-4 outline-none lg:px-8 lg:py-6"
				>
					{isLoaded ? children : <PageSkeleton />}
				</main>
				<Footer />
			</div>
			<Drawer
				open={drawerOpen}
				onClose={closeDrawer}
				label={shellText.menuLabel}
				closeLabel={shellText.closeMenu}
			>
				<div className="flex min-h-0 flex-1 flex-col gap-3">
					<SidebarContent onNavigate={closeDrawer} />
					<div className="bg-surface text-ink rounded-md p-2 [--ring:var(--primary)]">
						<ThemeChoice />
					</div>
				</div>
			</Drawer>
		</div>
	);
};
