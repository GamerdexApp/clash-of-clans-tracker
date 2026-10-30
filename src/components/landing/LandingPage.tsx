"use client";

import { formatRelative } from "@/lib/format";
import Link from "next/link";
import { useId, useState } from "react";
import type { IconType } from "react-icons";
import { LuChartColumn, LuDatabaseBackup, LuLayers, LuListChecks, LuMinus, LuMoon, LuPlus, LuShieldCheck } from "react-icons/lu";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { landingText } from "@/lib/messages/landing";
import { VILLAGES_HREF } from "@/data/nav";
import { DISCORD_URL, GITHUB_URL } from "@/data/site";
import { BrandMark } from "@/comps/shell/BrandMark";
import { Footer } from "@/comps/shell/Footer";
import { TownHallIcon } from "@/comps/shell/TownHallIcon";
import { ButtonLink } from "@/comps/ui/Button";
import { Card } from "@/comps/ui/Card";
import { SectionLabel } from "@/comps/ui/SectionLabel";
import type { Playthrough } from "@/types/app";

const text = landingText;
const NEW_VILLAGE_HREF = `${VILLAGES_HREF}?new=1`;
const FEATURE_ICONS: IconType[] = [LuLayers, LuListChecks, LuChartColumn, LuDatabaseBackup, LuShieldCheck, LuMoon];
const linkClasses = "flex min-h-11 items-center px-2 hover:underline lg:min-h-9";

const relativeTime = (iso: string) => {
	const minutes = Math.round((Date.parse(iso) - Date.now()) / 60_000);
	if (Math.abs(minutes) < 1) return text.updated.justNow;
	if (Math.abs(minutes) < 60) return formatRelative(minutes, "minute");
	if (Math.abs(minutes) < 60 * 24) return formatRelative(Math.round(minutes / 60), "hour");
	return formatRelative(Math.round(minutes / (60 * 24)), "day");
};

/** A new visitor creates a village. A returning visitor goes to the Overview or starts another village. */
const Actions = ({ returning, ready }: { returning: boolean; ready: boolean }) => {
	if (!ready) return <div className="min-h-11" aria-hidden="true" />;
	return returning ? (
		<div className="flex flex-wrap gap-3">
			<ButtonLink href="/overview" variant="primary">
				{text.cta.overview}
			</ButtonLink>
			<ButtonLink href={NEW_VILLAGE_HREF}>{text.cta.newVillage}</ButtonLink>
		</div>
	) : (
		<div className="flex flex-wrap gap-3">
			<ButtonLink href={NEW_VILLAGE_HREF} variant="primary">
				{text.cta.create}
			</ButtonLink>
			<ButtonLink href="#features">{text.cta.learnMore}</ButtonLink>
		</div>
	);
};

const Header = ({ returning, ready }: { returning: boolean; ready: boolean }) => (
	<header className="border-line bg-surface sticky top-0 z-30 border-b-[1.5px]">
		<div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 lg:px-8">
			<span className="bg-sb-bg rounded-md px-3 py-1 [--ring:var(--color-sb-ring)]">
				<BrandMark />
			</span>
			<nav aria-label={text.header.label} className="ms-auto hidden items-center gap-1 md:flex">
				<a href="#features" className={linkClasses}>
					{text.header.features}
				</a>
				<a href="#faq" className={linkClasses}>
					{text.header.faq}
				</a>
				{returning && (
					<Link href={VILLAGES_HREF} className={linkClasses}>
						{text.header.villages}
					</Link>
				)}
				<Link href="/settings" className={linkClasses}>
					{text.header.settings}
				</Link>
				<a
					href={GITHUB_URL}
					target="_blank"
					rel="noopener noreferrer"
					className={linkClasses}
				>
					{/* i18n-ignore */}
					GitHub
				</a>
				<a
					href={DISCORD_URL}
					target="_blank"
					rel="noopener noreferrer"
					className={linkClasses}
				>
					{/* i18n-ignore */}
					Discord
				</a>
			</nav>
			<span className="ms-auto md:ms-3">
				{ready &&
					(returning ? (
						<ButtonLink href="/overview" variant="primary">
							{text.cta.overview}
						</ButtonLink>
					) : (
						<ButtonLink href={NEW_VILLAGE_HREF} variant="primary">
							{text.cta.create}
						</ButtonLink>
					))}
			</span>
		</div>
	</header>
);

const ContinueCard = ({ village }: { village: Playthrough }) => (
	<Link href="/overview" className="block max-w-md">
		<Card className="hover:bg-tint flex items-center gap-3 p-3">
			<TownHallIcon level={village.data.homeVillage.townHallLevel} size={48} />
			<span className="flex min-w-0 flex-col">
				<span className="text-muted text-xs">{text.hero.continue}</span>
				<span className="truncate font-semibold">{village.name}</span>
				<span className="text-muted text-sm">
					{text.hero.continueLine(village.data.homeVillage.townHallLevel, village.data.builderBase.builderHallLevel, relativeTime(village.lastModified))}
				</span>
			</span>
		</Card>
	</Link>
);

const Hero = ({ active, returning, ready }: { active: Playthrough | null; returning: boolean; ready: boolean }) => (
	<section className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-14 lg:px-8 lg:py-20">
		<h1 className="font-brand text-primary max-w-3xl text-4xl leading-tight lg:text-6xl">{text.hero.title}</h1>
		<p className="text-muted max-w-2xl text-lg">{text.hero.description}</p>
		{returning && active && <ContinueCard village={active} />}
		<Actions returning={returning} ready={ready} />
		<p className="text-muted text-sm">{text.hero.note}</p>
	</section>
);

const Features = () => (
	<section id="features" className="mx-auto flex max-w-6xl scroll-mt-20 flex-col gap-6 px-4 py-12 lg:px-8">
		<div className="flex flex-col gap-1">
			<SectionLabel className="text-muted">{text.features.label}</SectionLabel>
			<h2 className="text-3xl font-semibold">{text.features.title}</h2>
			<p className="text-muted max-w-2xl">{text.features.description}</p>
		</div>
		<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{text.features.items.map((item, index) => {
				const Icon = FEATURE_ICONS[index];
				return (
					<li key={item.title}>
						<Card className="flex h-full flex-col gap-2 p-5">
							<Icon aria-hidden="true" size={24} className="text-primary" />
							<h3 className="text-lg font-semibold">{item.title}</h3>
							<p className="text-muted">{item.text}</p>
						</Card>
					</li>
				);
			})}
		</ul>
	</section>
);

const Faq = () => {
	const baseId = useId();
	const [open, setOpen] = useState<number | null>(null);
	return (
		<section id="faq" className="mx-auto flex max-w-3xl scroll-mt-20 flex-col gap-6 px-4 py-12 lg:px-8">
			<div className="flex flex-col gap-1">
				<SectionLabel className="text-muted">{text.faq.label}</SectionLabel>
				<h2 className="text-3xl font-semibold">{text.faq.title}</h2>
			</div>
			<ul className="flex flex-col gap-2">
				{text.faq.items.map((item, index) => {
					const expanded = open === index;
					return (
						<li key={item.question}>
							<Card className="flex flex-col">
								<h3>
									<button
										type="button"
										aria-expanded={expanded}
										aria-controls={`${baseId}-${index}`}
										onClick={() => setOpen(expanded ? null : index)}
										className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-2 text-start font-medium"
									>
										{item.question}
										{expanded ? <LuMinus aria-hidden="true" size={18} /> : <LuPlus aria-hidden="true" size={18} />}
									</button>
								</h3>
								<div id={`${baseId}-${index}`} hidden={!expanded} className="text-muted px-4 pb-4">
									{item.answer}
								</div>
							</Card>
						</li>
					);
				})}
			</ul>
		</section>
	);
};

const FinalCall = ({ returning, ready }: { returning: boolean; ready: boolean }) => (
	<section className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-14 lg:px-8">
		<h2 className="text-3xl font-semibold">{text.final.title}</h2>
		<p className="text-muted max-w-xl">{text.final.description}</p>
		<Actions returning={returning} ready={ready} />
	</section>
);

export const LandingPage = () => {
	const { playthroughs, activePlaythrough, isLoaded } = usePlaythrough();
	const returning = playthroughs.length > 0;

	return (
		<div className="flex min-h-dvh flex-col">
			<Header returning={returning} ready={isLoaded} />
			<main className="flex-1">
				<Hero active={activePlaythrough ?? playthroughs[0] ?? null} returning={returning} ready={isLoaded} />
				<Features />
				<Faq />
				<FinalCall returning={returning} ready={isLoaded} />
			</main>
			<Footer />
		</div>
	);
};
