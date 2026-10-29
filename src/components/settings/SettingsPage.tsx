"use client";

import { Suspense } from "react";

import { useUrlTab } from "@/lib/hooks/useUrlTab";
import { settingsText } from "@/lib/messages/settings";
import { PageHeader } from "@/comps/shell/PageHeader";
import { Tabs } from "@/comps/ui/Tabs";
import { AboutTab } from "./AboutTab";
import { DataTab } from "./DataTab";
import { PreferencesTab } from "./PreferencesTab";

const text = settingsText;
const TAB_IDS = ["preferences", "data", "about"] as const;

const SettingsContent = () => {
	const [activeTab, setActiveTab] = useUrlTab(TAB_IDS, "preferences");

	return (
		<>
			<PageHeader title={text.title} subline={text.subline} />
			<Tabs
				label={text.tabsLabel}
				tabs={TAB_IDS.map((id) => ({ id, label: text.tabs[id] }))}
				activeId={activeTab}
				onChange={setActiveTab}
			>
				{activeTab === "preferences" && <PreferencesTab />}
				{activeTab === "data" && <DataTab />}
				{activeTab === "about" && <AboutTab />}
			</Tabs>
		</>
	);
};

export const SettingsPage = () => (
	<Suspense fallback={null}>
		<SettingsContent />
	</Suspense>
);
