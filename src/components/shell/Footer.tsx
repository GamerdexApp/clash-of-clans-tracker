import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import { shellText } from "@/lib/messages/shell";
import { APP_NAME } from "@/data/nav";
import { DISCORD_URL, GAME_URL, GAMERDEX_URL, GITHUB_URL } from "@/data/site";
import { SectionLabel } from "@/comps/ui/SectionLabel";
import { BrandMark } from "./BrandMark";

const text = shellText.footer;
const linkClasses = "flex min-h-11 items-center gap-1 hover:underline md:min-h-9";

function ExternalLink({
	href,
	children,
	sameTab = false,
}: {
	href: string;
	children: string;
	sameTab?: boolean;
}) {
	return (
		<a
			href={href}
			{...(sameTab ? {} : { target: "_blank", rel: "noopener noreferrer" })}
			className={linkClasses}
		>
			{children}
			<LuArrowUpRight size={14} aria-hidden="true" className="shrink-0 rtl:-scale-x-100" />
		</a>
	);
}

export const Footer = () => {
	return (
		<footer className="bg-primary text-on-primary flex flex-col gap-6 px-4 pt-10 pb-7 [--ring:var(--color-on-primary)] lg:px-8">
			<div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.4fr_1fr_1.2fr] md:gap-8">
				<div className="col-span-2 flex min-w-0 flex-col gap-3 md:col-span-1">
					<span className="bg-sb-bg w-fit rounded-md px-3 py-2 [--ring:var(--color-sb-ring)]">
						<BrandMark />
					</span>
					<span className="max-w-sm">{text.tagline}</span>
				</div>
				<nav aria-label={text.support} className="flex min-w-0 flex-col gap-1.5">
					<SectionLabel className="text-on-primary">{text.support}</SectionLabel>
					<Link href="/settings" className={linkClasses}>
						{text.settings}
					</Link>
					<ExternalLink href={DISCORD_URL}>{text.discord}</ExternalLink>
					<ExternalLink href={GITHUB_URL}>{text.github}</ExternalLink>
					<ExternalLink href={`${GAMERDEX_URL}/privacy`} sameTab>
						{text.privacy}
					</ExternalLink>
					<ExternalLink href={`${GAMERDEX_URL}/terms`} sameTab>
						{text.terms}
					</ExternalLink>
				</nav>
				<div className="contents md:flex md:min-w-0 md:flex-col md:gap-3">
					<nav aria-label={text.about} className="flex min-w-0 flex-col gap-1.5">
						<SectionLabel className="text-on-primary">{text.about}</SectionLabel>
						<ExternalLink href={GAME_URL}>{text.game}</ExternalLink>
					</nav>
					<div className="border-on-primary/40 col-span-2 flex flex-col gap-1 rounded-md border-[1.5px] px-3.5 py-3 md:col-span-1">
						<span className="font-semibold">{text.disclaimerTitle}</span>
						<span className="text-[13px]">{text.disclaimer}</span>
					</div>
				</div>
			</div>
			<div className="border-on-primary/40 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t-[1.5px] pt-4 text-[13px]">
				<span>
					© {new Date().getFullYear()} {APP_NAME}
				</span>
				<span className="flex flex-wrap items-center gap-x-3">
					{text.framework}
					<ExternalLink href={GAMERDEX_URL}>{text.visitGamerdex}</ExternalLink>
				</span>
			</div>
		</footer>
	);
};
