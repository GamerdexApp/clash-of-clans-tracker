"use client";

import { useEffect } from "react";

import { ErrorView } from "@/comps/shell/ErrorView";

const ErrorPage = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
	useEffect(() => {
		console.error("App error:", error);
	}, [error]);
	return <ErrorView error={error} reset={reset} />;
};

export default ErrorPage;
