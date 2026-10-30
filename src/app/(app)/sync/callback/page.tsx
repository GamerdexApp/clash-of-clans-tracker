"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { type CallbackOutcome, useSync } from "@/lib/contexts/SyncContext";
import { syncText } from "@/lib/messages/sync";
import { SYNC_HREF } from "@/data/nav";
import { PageHeader } from "@/comps/shell/PageHeader";
import { ButtonLink } from "@/comps/ui/Button";
import { Note } from "@/comps/ui/Note";

const text = syncText.callback;

const SyncCallbackPage = () => {
	const router = useRouter();
	const { completeSignIn } = useSync();
	const started = useRef(false);
	const [problem, setProblem] = useState<Exclude<CallbackOutcome, "ok"> | null>(null);

	useEffect(() => {
		if (started.current) return;
		started.current = true;
		completeSignIn(window.location.search).then((outcome) => {
			if (outcome === "ok") router.replace(SYNC_HREF);
			else setProblem(outcome);
		});
	}, [completeSignIn, router]);

	return (
		<>
			<PageHeader title={text.title} />
			{problem ? (
				<div className="flex flex-col gap-3">
					<Note tone="warning">{text[problem]}</Note>
					<div>
						<ButtonLink href={SYNC_HREF}>{text.back}</ButtonLink>
					</div>
				</div>
			) : (
				<p className="text-muted">{text.working}</p>
			)}
		</>
	);
};

export default SyncCallbackPage;
