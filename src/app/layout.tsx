import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Lilita_One } from "next/font/google";
import { PlaythroughProvider } from "@/lib/contexts/PlaythroughContext";
import { SyncProvider } from "@/lib/contexts/SyncContext";
import { UIProvider } from "@/lib/contexts/UIContext";
import { ActiveHoursSync } from "@/comps/layout/ActiveHoursSync";
import { ExpiredUpgradeSync } from "@/comps/layout/ExpiredUpgradeSync";
import { ThemeSync } from "@/comps/layout/ThemeSync";
import { ToastProvider } from "@/comps/ui/Toast";
import { STORAGE_KEY } from "@/service/storage";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
	variable: "--font-plex-sans",
	subsets: ["latin"],
	weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
	variable: "--font-plex-mono",
	subsets: ["latin"],
	weight: ["400", "500"],
});

const lilita = Lilita_One({
	variable: "--font-lilita",
	subsets: ["latin"],
	weight: "400",
});

// Runs before the first paint so a dark theme never flashes light.
const applyThemeBeforePaint = `try{var s=JSON.parse(localStorage.getItem("${STORAGE_KEY}")||"{}").settings;var t=s&&s.theme||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}`;

const siteUrl = "https://coc.gamerdex.app";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Clash of Clans Tracker",
		template: "%s | Clash of Clans Tracker",
	},
	description:
		"Track your Clash of Clans progress — manage upgrades, achievements, and multiple accounts in one place.",
	keywords: [
		"Clash of Clans",
		"Clash of Clans tracker",
		"Clash of Clans companion",
		"Clash of Clans progress",
	],
	authors: [{ name: "GamerDex" }],
	creator: "GamerDex",
	alternates: {
		canonical: "/",
	},
	robots: {
		index: true,
		follow: true,
	},
	manifest: "/site.webmanifest",
	icons: {
		icon: [
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: "/apple-touch-icon.png",
		other: [
			{ rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
			{ rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
		],
	},
	openGraph: {
		type: "website",
		siteName: "Clash of Clans Tracker",
		title: "Clash of Clans Tracker",
		description:
			"Track your Clash of Clans progress — manage upgrades, achievements, and multiple accounts in one place.",
		url: siteUrl,
		images: [
			{
				url: "/Site Screenshot.png",
				width: 1200,
				alt: "Clash of Clans Tracker dashboard preview",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Clash of Clans Tracker",
		description:
			"Track your Clash of Clans progress — manage upgrades, achievements, and multiple accounts in one place.",
		images: ["/Site Screenshot.png"],
	},
};

const RootLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${plexSans.variable} ${plexMono.variable} ${lilita.variable} h-full`}
		>
			<head>
				<script dangerouslySetInnerHTML={{ __html: applyThemeBeforePaint }} />
			</head>
			<body className="bg-bg min-h-dvh antialiased">
				<UIProvider>
					<ToastProvider>
						<PlaythroughProvider>
							<SyncProvider>
								<ThemeSync />
								<ActiveHoursSync />
								<ExpiredUpgradeSync />
								{children}
							</SyncProvider>
						</PlaythroughProvider>
					</ToastProvider>
				</UIProvider>
			</body>
		</html>
	);
};
export default RootLayout;
