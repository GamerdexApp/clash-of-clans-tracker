"use client";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { shellText } from "@/lib/messages/shell";
import { HOME_HREF } from "@/data/nav";
import { ButtonLink } from "@/comps/ui/Button";
import { AppShell } from "./AppShell";

const text = shellText.notFound;

export const NotFoundPage = () => {
	const { activePlaythrough } = usePlaythrough();

	return (
		<AppShell>
			<div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
				<p className="font-brand text-primary text-8xl leading-none">404</p>
				<h1 className="text-2xl font-semibold">{text.title}</h1>
				<p className="text-muted">{text.body}</p>
				<div className="mt-4 flex flex-wrap justify-center gap-3">
					{activePlaythrough && (
						<ButtonLink href="/overview" variant="primary">
							{text.toOverview}
						</ButtonLink>
					)}
					<ButtonLink href={HOME_HREF} variant="secondary">
						{text.toHome}
					</ButtonLink>
				</div>
			</div>
		</AppShell>
	);
};
