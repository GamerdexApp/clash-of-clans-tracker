"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { massEditText } from "@/lib/messages/massEdit";
import { Button } from "@/comps/ui/Button";
import { Dialog } from "@/comps/ui/Dialog";

const text = massEditText.leave;

export interface DraftHandle {
  count: number;
  save: () => void;
  discard: () => void;
}

interface LeaveGuardValue {
  /** The number of unsaved changes the open page holds, 0 when there is none. */
  unsavedCount: number;
  /** A page with a draft registers it here and clears it with null. */
  registerDraft: (draft: DraftHandle | null) => void;
  /** Runs the action now, or after the player answers the leave confirm when a draft exists. */
  guardedAction: (action: () => void) => void;
}

const LeaveGuardContext = createContext<LeaveGuardValue | undefined>(undefined);

const GUARD_STATE_KEY = "leaveGuard";

const isPlainLeftClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const internalHref = (anchor: HTMLAnchorElement): string | null => {
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  const next = `${url.pathname}${url.search}`;
  return next === `${window.location.pathname}${window.location.search}` || url.hash ? null : next;
};

/**
 * One guard for every way out of a page with unsaved changes: links, the village switcher, the
 * browser Back button and closing the tab. Links are caught in the capture phase so no handler of
 * Next.js sees the click.
 */
export const LeaveGuardProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftHandle | null>(null);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const draftRef = useRef<DraftHandle | null>(null);
  const ignorePopRef = useRef(false);
  const dirty = (draft?.count ?? 0) > 0;

  const registerDraft = useCallback((next: DraftHandle | null) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  const guardedAction = useCallback((action: () => void) => {
    if ((draftRef.current?.count ?? 0) > 0) setPending(() => action);
    else action();
  }, []);

  useEffect(() => {
    if (!dirty) return;

    const warnOnUnload = (event: BeforeUnloadEvent) => event.preventDefault();

    const catchLink = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || event.defaultPrevented || !isPlainLeftClick(event)) return;
      const next = internalHref(anchor);
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      setPending(() => () => router.push(next));
    };

    const catchBack = () => {
      if (ignorePopRef.current) {
        ignorePopRef.current = false;
        return;
      }
      window.history.pushState({ ...window.history.state, [GUARD_STATE_KEY]: true }, "", window.location.href);
      setPending(() => () => window.history.go(-2));
    };

    window.history.pushState({ ...window.history.state, [GUARD_STATE_KEY]: true }, "", window.location.href);
    window.addEventListener("beforeunload", warnOnUnload);
    document.addEventListener("click", catchLink, true);
    window.addEventListener("popstate", catchBack);

    return () => {
      window.removeEventListener("beforeunload", warnOnUnload);
      document.removeEventListener("click", catchLink, true);
      window.removeEventListener("popstate", catchBack);
      if (window.history.state?.[GUARD_STATE_KEY]) {
        ignorePopRef.current = true;
        window.history.back();
      }
    };
  }, [dirty, router]);

  const value = useMemo<LeaveGuardValue>(
    () => ({ unsavedCount: draft?.count ?? 0, registerDraft, guardedAction }),
    [draft?.count, registerDraft, guardedAction],
  );

  const leave = (finish: () => void) => {
    const action = pending;
    setPending(null);
    finish();
    action?.();
  };

  return (
    <LeaveGuardContext.Provider value={value}>
      {children}
      <Dialog
        open={pending !== null}
        onClose={() => setPending(null)}
        title={text.title(draft?.count ?? 0)}
        footer={
          <>
            <Button onClick={() => setPending(null)}>{text.keep}</Button>
            <Button variant="danger" onClick={() => leave(() => draft?.discard())}>
              {text.discard}
            </Button>
            <Button variant="primary" onClick={() => leave(() => draft?.save())}>
              {text.save}
            </Button>
          </>
        }
      >
        <p className="text-muted">{text.body}</p>
      </Dialog>
    </LeaveGuardContext.Provider>
  );
};

export const useLeaveGuard = (): LeaveGuardValue => {
  const context = useContext(LeaveGuardContext);
  if (!context) throw new Error("useLeaveGuard must be used within a LeaveGuardProvider");
  return context;
};
