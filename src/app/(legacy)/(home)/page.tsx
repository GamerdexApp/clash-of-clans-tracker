"use client";

import { Button } from "flowbite-react";
import Link from "next/link";
import { useState } from "react";
import {
	HiChartBar,
	HiCheckCircle,
	HiClipboardList,
	HiDatabase,
	HiDeviceMobile,
	HiMinus,
	HiPlus,
	HiShieldCheck,
} from "react-icons/hi";
import { RiArrowRightLine } from "react-icons/ri";

const APP_NAME = "Clash of Clans Tracker";
const APP_TAGLINE = "Track Your Clash of Clans Progress";
const APP_DESCRIPTION =
	"The ultimate companion app for Clash of Clans. Manage multiple accounts and track your upgrades, achievements, and progress with ease.";

const FEATURES = [
	{
		icon: HiClipboardList,
		title: "Multiple Villages",
		description:
			"Create and manage unlimited villages. Track different accounts and bases separately.",
	},
	{
		icon: HiCheckCircle,
		title: "Progress Tracking",
		description:
			"Track exactly what you've completed, collected, or unlocked across every village.",
	},
	{
		icon: HiChartBar,
		title: "Dashboard Overview",
		description: "See your progress at a glance with summary stats and completion indicators.",
	},
	{
		icon: HiDatabase,
		title: "Data Export/Import",
		description:
			"Export your progress as JSON for backup or share with friends. Import data anytime.",
	},
	{
		icon: HiShieldCheck,
		title: "Private & Offline",
		description:
			"All data is stored locally in your browser. No account required, no data sent to servers.",
	},
	{
		icon: HiDeviceMobile,
		title: "Dark Mode",
		description: "Comfortable to use day or night with full dark mode support.",
	},
];

const FAQS = [
	{
		question: `What is ${APP_NAME}?`,
		answer: `${APP_NAME} is a progress tracking tool for Clash of Clans. It helps you manage multiple accounts and track your upgrades, achievements, and overall progress all in one place.`,
	},
	{
		question: "How does it store my data?",
		answer: "All your data is stored locally in your browser using localStorage. Your progress is private and doesn't require any server or account. You can export and import data as JSON files for backup.",
	},
	{
		question: "Can I track multiple villages?",
		answer: "Yes! Create and manage multiple villages, each with its own progress. Switch between them using the sidebar dropdown.",
	},
	{
		question: "Is this app free to use?",
		answer: `Yes, ${APP_NAME} is completely free to use. No subscriptions, no ads, no hidden costs.`,
	},
];

const Home = () => {
	const [openFaq, setOpenFaq] = useState<number | null>(null);

	return (
		<div className="bg-highlight dark:bg-gray-900">
			<main>
				<div className="relative isolate overflow-hidden pt-14 pb-16 sm:pb-20">
					<div
						aria-hidden="true"
						className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
					>
						<div
							style={{
								clipPath:
									"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
							}}
							className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#80b5ff] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"
						/>
					</div>
					<div className="mx-auto max-w-7xl px-6 lg:px-8">
						<div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
							<div className="text-center">
								<h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white">
									{APP_TAGLINE}
								</h1>
								<p className="mt-8 text-lg font-medium text-pretty text-gray-600 sm:text-xl/8 dark:text-gray-400">
									{APP_DESCRIPTION}
								</p>
								<div className="mt-10 flex items-center justify-center gap-x-6">
									<Button
										as={Link}
										href="/playthrough/list"
										color="action"
										size="lg"
									>
										Get Started
									</Button>
									<Link
										href="#features"
										className="text-sm/6 font-semibold text-gray-900 dark:text-white"
									>
										Learn more <RiArrowRightLine size={14} className="inline ml-0.5" />
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div
						aria-hidden="true"
						className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
					>
						<div
							style={{
								clipPath:
									"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
							}}
							className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#80b5ff] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-288.75"
						/>
					</div>
				</div>

				<div className="mt-8 sm:mt-16" id="features">
					<div className="mx-auto max-w-7xl px-6 lg:px-8">
						<div className="mx-auto max-w-2xl sm:text-center">
							<h2 className="text-base/7 font-semibold text-accent dark:text-accent/80">
								Everything you need
							</h2>
							<p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
								All your progress in one place
							</p>
						</div>
					</div>
					<div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
						<dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base/7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16 dark:text-gray-400">
							{FEATURES.map(({ icon: Icon, title, description }) => (
								<div key={title} className="relative pl-9">
									<dt className="inline font-semibold text-gray-900 dark:text-white">
										<Icon className="absolute top-1 left-1 size-5 text-accent dark:text-accent/80" />
										{title}
									</dt>
									<dd> {description}</dd>
								</div>
							))}
						</dl>
					</div>
				</div>

				<div className="mx-auto mt-32 px-6 sm:mt-56 lg:px-8">
					<div className="mx-auto max-w-4xl">
						<h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
							Frequently asked questions
						</h2>
						<dl className="mt-16 divide-y divide-gray-900/80 dark:divide-white/80">
							{FAQS.map((faq, index) => (
								<div key={index} className="py-6 first:pt-0 last:pb-0">
									<dt>
										<button
											type="button"
											onClick={() =>
												setOpenFaq(openFaq === index ? null : index)
											}
											className="flex w-full cursor-pointer items-start justify-between text-left text-gray-900 dark:text-white"
											aria-expanded={openFaq === index}
										>
											<span className="text-base/7 font-semibold">
												{faq.question}
											</span>
											<span className="ml-6 flex h-7 items-center">
												{openFaq === index ? (
													<HiMinus className="size-6" aria-hidden="true" />
												) : (
													<HiPlus className="size-6" aria-hidden="true" />
												)}
											</span>
										</button>
									</dt>
									{openFaq === index && (
										<dd className="mt-2 pr-12">
											<p className="text-base/7 text-gray-600 dark:text-gray-400">
												{faq.answer}
											</p>
										</dd>
									)}
								</div>
							))}
						</dl>
					</div>
				</div>
			</main>

			<footer className="mt-32">
				<div className="mx-auto border-t border-gray-200 px-6 py-16 lg:px-8 dark:border-white/80">
					<div className="xl:grid xl:grid-cols-3 xl:gap-8">
						<div className="space-y-8">
							<p className="text-xl font-bold text-gray-900 dark:text-white">
								{APP_NAME}
							</p>
							<p className="text-sm/6 text-gray-600 dark:text-gray-400">
									Track your Clash of Clans progress with ease.
							</p>
						</div>
						<div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
							<div>
								<h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">
									Navigation
								</h3>
								<ul role="list" className="mt-6 space-y-4">
									<li>
										<Link
											href="/playthrough/list"
											className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
										>
											Villages
										</Link>
									</li>
									<li>
										<Link
											href="/settings"
											className="text-sm/6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
										>
											Settings
										</Link>
									</li>
								</ul>
							</div>
							<div>
								<h3 className="text-sm/6 font-semibold text-gray-900 dark:text-white">
									Disclaimer
								</h3>
								<p className="mt-6 text-xs/5 text-gray-600 dark:text-gray-400">
									This application is not affiliated with or endorsed by Supercell.
									Clash of Clans is a trademark of Supercell. All trademarks are
									property of their respective owners.
								</p>
							</div>
						</div>
					</div>
					<div className="mt-16 border-t border-gray-900/80 pt-8 sm:mt-20 lg:mt-24 dark:border-white/80">
						<p className="text-xs/5 text-gray-500 dark:text-gray-400">
							&copy; {new Date().getFullYear()} {APP_NAME}
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
export default Home;
