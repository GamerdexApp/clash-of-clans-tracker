"use client";

import { Suspense } from "react";

import { useSync } from "@/lib/contexts/SyncContext";
import { useUrlTab } from "@/lib/hooks/useUrlTab";
import { settingsText } from "@/lib/messages/settings";
import { PageHeader } from "@/comps/shell/PageHeader";
import { Tabs } from "@/comps/ui/Tabs";
import { AboutTab } from "./AboutTab";
import { DataTab } from "./DataTab";
import { PreferencesTab } from "./PreferencesTab";
import { SyncTab } from "./SyncTab";

const text = settingsText;
const BASE_TABS = ["preferences", "data", "about"] as const;
const TABS_WITH_SYNC = ["sync", ...BASE_TABS] as const;

const SettingsContent = () => {
	const { available } = useSync();
	const tabIds = available ? TABS_WITH_SYNC : BASE_TABS;
	const [activeTab, setActiveTab] = useUrlTab(tabIds, available ? "sync" : "preferences");

	return (
		<>
			<PageHeader title={text.title} subline={text.subline} />
			<Tabs
				label={text.tabsLabel}
				tabs={tabIds.map((id) => ({ id, label: text.tabs[id] }))}
				activeId={activeTab}
				onChange={setActiveTab}
			>
				{activeTab === "sync" && <SyncTab />}
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
