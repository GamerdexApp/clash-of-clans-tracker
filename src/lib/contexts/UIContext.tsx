"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { UIContextType } from "@/types/contexts";

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [drawerOpen, setDrawerOpen] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setSidebarOpen(false);
			} else {
				setSidebarOpen(true);
			}
			if (window.innerWidth >= 1024) setDrawerOpen(false);
		};

		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const toggleSidebar = () => {
		setSidebarOpen((prev) => !prev);
	};

	return (
		<UIContext.Provider
			value={{
				sidebarOpen,
				toggleSidebar,
				setSidebarOpen,
				drawerOpen,
				openDrawer: () => setDrawerOpen(true),
				closeDrawer: () => setDrawerOpen(false),
			}}
		>
			{children}
		</UIContext.Provider>
	);
}

export const useUI = () => {
	const context = useContext(UIContext);
	if (context === undefined) {
		throw new Error("useUI must be used within a UIProvider"); // i18n-ignore
	}
	return context;
}
