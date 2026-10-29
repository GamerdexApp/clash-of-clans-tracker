import Image from "next/image";
import Link from "next/link";

import { shellText } from "@/lib/messages/shell";
import { APP_NAME, HOME_HREF } from "@/data/nav";

export const BrandMark = ({ onNavigate }: { onNavigate?: () => void }) => (
	<Link href={HOME_HREF} onClick={onNavigate} className="flex min-h-11 items-center gap-2.5">
		<Image
			src="/clash-of-clans-icon.png"
			alt=""
			width={32}
			height={32}
			className="block size-8 shrink-0 rounded-md"
		/>
		<span className="flex flex-col">
			<span className="font-brand text-sb-text text-[17px] leading-[1.1]">
				{shellText.brandTitle}
			</span>
			<span className="font-brand text-sb-muted text-[15px] leading-[1.1]">
				{shellText.brandSubtitle}
			</span>
		</span>
		<span className="sr-only">{APP_NAME}</span>
	</Link>
);
