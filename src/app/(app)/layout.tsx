import { LeaveGuardProvider } from "@/lib/contexts/LeaveGuardContext";
import { AppShell } from "@/comps/shell/AppShell";

const AppLayout = ({ children }: { children: React.ReactNode }) => (
	<LeaveGuardProvider>
		<AppShell>{children}</AppShell>
	</LeaveGuardProvider>
);

export default AppLayout;
