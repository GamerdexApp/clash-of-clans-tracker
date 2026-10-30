import { useEffect, useMemo, useRef, useState } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useLeaveGuard } from "@/lib/contexts/LeaveGuardContext";
import { massEditText } from "@/lib/messages/massEdit";
import {
  allRows,
  applyBulk,
  applyChanges,
  builderCategories,
  builderProfileRows,
  capitalCategories,
  capitalProfileRows,
  changedRows,
  homeCategories,
  scopeOf,
  type MassCategory,
  type MassRow,
  type MassScope,
  type RowChange,
} from "@/service/massEdit";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough } from "@/types/app";

export interface MassEditDraft {
  draft: Playthrough;
  categories: Record<MassScope, MassCategory[]>;
  changes: RowChange[];
  /** The unsaved changes of one scope. */
  countFor: (scope: MassScope) => number;
  edit: (change: (draft: Playthrough, now: Date) => Playthrough) => void;
  applyChanges: (changes: RowChange[]) => void;
  discard: () => void;
  save: () => void;
}

interface DraftState {
  /** The saved village this state last followed. */
  source: Playthrough;
  base: Playthrough;
  draft: Playthrough;
}

/** The rows of both scopes. The Builder Base rows of the base and of the draft both count, because the Builder Hall decides which rows exist. */
const rowsToCompare = (base: Playthrough, categories: Record<MassScope, MassCategory[]>): MassRow[] => {
  const all = [
    ...allRows(categories.home),
    ...allRows(builderCategories(base)),
    ...allRows(categories.builder),
    ...builderProfileRows(),
    ...allRows(capitalCategories(base)),
    ...allRows(categories.capital),
    ...capitalProfileRows(),
  ];
  return [...new Map(all.map((row) => [row.key, row])).values()];
};

/**
 * One staged draft of the active village. Every edit changes the draft only. Save copies the
 * changed rows onto the latest saved village, so a timer that finished meanwhile is kept.
 */
export const useMassEditDraft = (village: Playthrough): MassEditDraft => {
  const { updateData } = usePlaythrough();
  const { registerDraft } = useLeaveGuard();
  const showToast = useToast();
  const [state, setState] = useState<DraftState>({ source: village, base: village, draft: village });
  const categories = useMemo(
    () => ({ home: homeCategories(state.base), builder: builderCategories(state.draft), capital: capitalCategories(state.draft) }),
    [state.base, state.draft],
  );
  const rows = useMemo(() => rowsToCompare(state.base, categories), [state.base, categories]);
  const changes = useMemo(() => changedRows(rows, state.base, state.draft), [rows, state]);
  const count = changes.length;

  // A clean draft follows the saved village, so a finished upgrade or a sync shows up. A dirty one keeps its base.
  if (state.source !== village) {
    setState(count === 0 ? { source: village, base: village, draft: village } : { ...state, source: village });
  }

  const discard = () => setState((current) => ({ ...current, draft: current.base }));

  const save = () => {
    const now = new Date();
    const previous = updateData((data) => ({
      ...data,
      playthroughs: data.playthroughs.map((candidate) =>
        candidate.id === village.id ? { ...applyChanges(candidate, changes, now), lastModified: now.toISOString() } : candidate,
      ),
    }));
    if (!previous) return;
    setState((current) => ({ ...current, base: current.draft }));
    showToast({
      variant: "success",
      title: massEditText.saved(count),
      action: { label: massEditText.undo, onAction: () => updateData(() => previous) },
    });
  };

  const latest = useRef({ save, discard });
  useEffect(() => {
    latest.current = { save, discard };
  });

  useEffect(() => {
    registerDraft(count > 0 ? { count, save: () => latest.current.save(), discard: () => latest.current.discard() } : null);
  }, [count, registerDraft]);
  useEffect(() => () => registerDraft(null), [registerDraft]);

  return {
    draft: state.draft,
    categories,
    changes,
    edit: (change) => setState((current) => ({ ...current, draft: change(current.draft, new Date()) })),
    applyChanges: (planned) => setState((current) => ({ ...current, draft: applyBulk(current.draft, planned, new Date()) })),
    countFor: (scope) => changes.filter((change) => scopeOf(change.row.ref) === scope).length,
    discard,
    save,
  };
};
