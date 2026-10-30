import type { Metadata } from "next";

import { LeaveGuardProvider } from "@/lib/contexts/LeaveGuardContext";
import { AppShell } from "@/comps/shell/AppShell";

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

const AppLayout = ({ children }: { children: React.ReactNode }) => (
	<LeaveGuardProvider>
		<AppShell>{children}</AppShell>
	</LeaveGuardProvider>
);

export default AppLayout;
