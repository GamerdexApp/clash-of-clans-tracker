import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Reads and writes values in the address, such as `?tag=Ship&q=copper`, so a reload or a shared
 * link keeps them. A value of null removes the parameter and the rest of the query stays. The page
 * must sit inside a Suspense boundary.
 */
export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const set = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [name, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(name);
      else next.set(name, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return { get: (name: string) => searchParams.get(name), set };
}
