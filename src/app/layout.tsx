import { I18nProvider } from "@/i18n/I18nProvider";
import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Lilita_One } from "next/font/google";
import { PlaythroughProvider } from "@/lib/contexts/PlaythroughContext";
import { SyncProvider } from "@/lib/contexts/SyncContext";
import { UIProvider } from "@/lib/contexts/UIContext";
import { STORAGE_KEY } from "@/service/storage";
import { ActiveHoursSync } from "@/comps/layout/ActiveHoursSync";
import { LegacyKeysMigration } from "@/comps/layout/LegacyKeysMigration";
import { ExpiredUpgradeSync } from "@/comps/layout/ExpiredUpgradeSync";
import { SITE_URL } from "@/data/site";
import { ThemeSync } from "@/comps/layout/ThemeSync";
import { ToastProvider } from "@/comps/ui/Toast";
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


export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: "Clash of Clans Tracker",
		template: "%s | Clash of Clans Tracker",
	},
	description:
		"Track your Clash of Clans progress. Manage upgrades, achievements, and multiple accounts in one place.",
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
			"Track your Clash of Clans progress. Manage upgrades, achievements, and multiple accounts in one place.",
		url: SITE_URL,
		images: [
			{
				url: "/site-screenshot.png",
				width: 1200,
				height: 630,
				alt: "Clash of Clans Tracker dashboard preview",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Clash of Clans Tracker",
		description:
			"Track your Clash of Clans progress. Manage upgrades, achievements, and multiple accounts in one place.",
		images: ["/site-screenshot.png"],
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
				<I18nProvider>
					<UIProvider>
						<ToastProvider>
							<PlaythroughProvider>
								<SyncProvider>
									<ThemeSync />
									<ActiveHoursSync />
									<LegacyKeysMigration />
									<ExpiredUpgradeSync />
									{children}
								</SyncProvider>
							</PlaythroughProvider>
						</ToastProvider>
					</UIProvider>
				</I18nProvider>
			</body>
		</html>
	);
};
export default RootLayout;
