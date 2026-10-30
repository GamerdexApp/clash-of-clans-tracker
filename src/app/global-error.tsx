"use client";

import { useEffect } from "react";

import { ErrorView } from "@/comps/shell/ErrorView";
import "./globals.css";

const GlobalError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
	useEffect(() => {
		console.error("App-level error:", error);
	}, [error]);

	return (
		<html lang="en">
			<body>
				<ErrorView error={error} reset={reset} />
			</body>
		</html>
	);
};

export default GlobalError;
