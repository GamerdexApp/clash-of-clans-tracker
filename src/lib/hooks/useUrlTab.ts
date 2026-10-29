import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";

const TAB_PARAM = "tab";
const TAB_CHANGED_EVENT = "url-tab-changed";

/**
 * A tab that lives in the address as `?tab=<id>`, so a reload or a shared link opens the same tab.
 * A missing or unknown value gives the fallback, and the rest of the query stays. The page must
 * sit inside a Suspense boundary.
 */
export function useUrlTab<TabId extends string>(
  ids: readonly TabId[],
  fallback: TabId,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get(TAB_PARAM);
  const tab = ids.find((id) => id === requested) ?? fallback;

  const setTab = (id: TabId) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set(TAB_PARAM, id);
    router.replace(`${pathname}?${next}`, { scroll: false });
  };

  return [tab, setTab] as const;
}

const subscribeToAddress = (notify: () => void) => {
  window.addEventListener("popstate", notify);
  window.addEventListener(TAB_CHANGED_EVENT, notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener(TAB_CHANGED_EVENT, notify);
  };
};

const requestedTab = () =>
  new URLSearchParams(window.location.search).get(TAB_PARAM);
