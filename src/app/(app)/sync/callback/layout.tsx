import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Signing in",
	robots: { index: false, follow: false },
};

const SyncCallbackLayout = ({ children }: { children: React.ReactNode }) => children;

export default SyncCallbackLayout;
