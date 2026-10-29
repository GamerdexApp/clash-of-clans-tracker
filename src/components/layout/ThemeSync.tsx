"use client";

import { useEffect } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export const ThemeSync = () => {
	const { appSettings } = usePlaythrough();
	const theme = appSettings.theme ?? "system";

	useEffect(() => {
		const systemDark = window.matchMedia(DARK_QUERY);
		const apply = () => {
			const dark = theme === "dark" || (theme === "system" && systemDark.matches);
			document.documentElement.classList.toggle("dark", dark);
		};

		apply();
		systemDark.addEventListener("change", apply);
		return () => systemDark.removeEventListener("change", apply);
	}, [theme]);

	return null;
};
