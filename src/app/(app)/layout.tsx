import { AppShell } from "@/comps/shell/AppShell";

const AppLayout = ({ children }: { children: React.ReactNode }) => (
	<AppShell>{children}</AppShell>
);

export default AppLayout;
