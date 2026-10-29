"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { IconType } from "react-icons";
import { LuBan, LuCircleCheck, LuInfo, LuTriangleAlert, LuX } from "react-icons/lu";
import { uiText } from "@/lib/messages/ui";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

type ToastVariant = "success" | "info" | "warning" | "error";

interface ToastAction {
	label: string;
	onAction: () => void;
}

interface ToastOptions {
	variant: ToastVariant;
	title: string;
	message?: string;
	action?: ToastAction;
}

interface ToastItem extends ToastOptions {
	id: number;
}

const SECOND_MS = 1_000;
const PLAIN_CLOSE_MS = 6 * SECOND_MS;
const UNDO_CLOSE_MS = 10 * SECOND_MS;

// An error stays until the player dismisses it. A toast with an action stays longer, so there is
// time to press it.
const closeAfterMs = (options: ToastOptions) => {
	if (options.variant === "error") return null;
	return options.action ? UNDO_CLOSE_MS : PLAIN_CLOSE_MS;
};

const variantStyles: Record<ToastVariant, { Icon: IconType; className: string }> = {
	success: { Icon: LuCircleCheck, className: "text-kept" },
	info: { Icon: LuInfo, className: "text-added" },
	warning: { Icon: LuTriangleAlert, className: "text-warn" },
	error: { Icon: LuBan, className: "text-danger" },
};

const ToastContext = createContext<((options: ToastOptions) => void) | undefined>(undefined);

const ToastHostContext = createContext<(host: HTMLElement | null) => void>(() => {});

/**
 * An open modal dialog makes everything outside it inert, including the toasts. The dialog calls
 * this to have the toasts drawn inside it while it is open, so Undo stays reachable.
 */
export const useToastHost = () => useContext(ToastHostContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const [host, setHost] = useState<HTMLElement | null>(null);
	const nextIdRef = useRef(0);
	const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());

	const dismiss = (id: number) => {
		clearTimeout(timersRef.current.get(id));
		timersRef.current.delete(id);
		setToasts((current) => current.filter((toast) => toast.id !== id));
	};

	const show = (options: ToastOptions) => {
		const id = nextIdRef.current++;
		setToasts((current) => [{ ...options, id }, ...current]);

		const delay = closeAfterMs(options);
		if (delay !== null) {
			timersRef.current.set(
				id,
				setTimeout(() => dismiss(id), delay)
			);
		}
	};

	useEffect(() => {
		const timers = timersRef.current;
		return () => timers.forEach((timer) => clearTimeout(timer));
	}, []);

	const region = (
		<div
			role="status"
			aria-live="polite"
			className="pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md flex-col items-stretch gap-2"
		>
			{toasts.map((toast) => {
				const { Icon, className } = variantStyles[toast.variant];
				return (
					<div
						key={toast.id}
						className="border-line bg-surface text-ink pointer-events-auto flex items-start gap-2 rounded-md border-[1.5px] py-2 ps-4 pe-1"
					>
						<Icon
							aria-hidden="true"
							size={20}
							className={`mt-2.5 shrink-0 ${className}`}
						/>
						<div className="flex min-w-0 flex-1 flex-col gap-0.5 py-1">
							<span className="sr-only">{uiText.toast.variants[toast.variant]}</span>
							<span className="font-medium">{toast.title}</span>
							{toast.message && <span className="text-muted">{toast.message}</span>}
						</div>
						{toast.action && (
							<Button
								variant="link"
								onClick={() => {
									toast.action?.onAction();
									dismiss(toast.id);
								}}
							>
								{toast.action.label}
							</Button>
						)}
						<IconButton
							label={uiText.toast.dismiss}
							className="text-muted hover:bg-tint"
							onClick={() => dismiss(toast.id)}
						>
							<LuX aria-hidden="true" />
						</IconButton>
					</div>
				);
			})}
		</div>
	);

	return (
		<ToastContext.Provider value={show}>
			<ToastHostContext.Provider value={setHost}>
				{children}
				{host ? createPortal(region, host) : region}
			</ToastHostContext.Provider>
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error(uiText.toast.missingProvider);
	}
	return context;
}
