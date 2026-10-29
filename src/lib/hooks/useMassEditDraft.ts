import { useEffect, useMemo, useRef, useState } from "react";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useLeaveGuard } from "@/lib/contexts/LeaveGuardContext";
import { massEditText } from "@/lib/messages/massEdit";
import {
  allRows,
  applyBulk,
  applyChanges,
  changedRows,
  homeCategories,
  type MassCategory,
  type RowChange,
} from "@/service/massEdit";
import { useToast } from "@/comps/ui/Toast";
import type { Playthrough } from "@/types/app";

export interface MassEditDraft {
  draft: Playthrough;
  categories: MassCategory[];
  changes: RowChange[];
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

/**
 * One staged draft of the active village. Every edit changes the draft only. Save copies the
 * changed rows onto the latest saved village, so a timer that finished meanwhile is kept.
 */
export const useMassEditDraft = (village: Playthrough): MassEditDraft => {
  const { updateData } = usePlaythrough();
  const { registerDraft } = useLeaveGuard();
  const showToast = useToast();
  const [state, setState] = useState<DraftState>({ source: village, base: village, draft: village });
  const categories = useMemo(() => homeCategories(state.base), [state.base]);
  const rows = useMemo(() => allRows(categories), [categories]);
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
    discard,
    save,
  };
};
