import { defaultDailies } from "./defaultDailies";
import type { Playthrough } from "@/types/app";
import type { UpgradeTarget } from "@/types/app/engine";
import type { HelperAssignment, HelperAssignmentTarget } from "@/types/app/playthrough";

export type AssigningHelper = "buildersApprentice" | "labAssistant";

export const assigningHelpers: AssigningHelper[] = ["buildersApprentice", "labAssistant"];

const assignmentField = {
  buildersApprentice: "buildersApprenticeAssignment",
  labAssistant: "labAssistantAssignment",
} as const;

/** Older saves wrote the Town Hall as a defense named town-hall and kept a pet target no page offers. */
export const toUpgradeTarget = (target: HelperAssignmentTarget): UpgradeTarget | null => {
  switch (target.type) {
    case "building":
      return target.buildingId === "town-hall" && target.recordKey === "defenses"
        ? { kind: "townHall" }
        : { kind: "building", record: target.recordKey, buildingId: target.buildingId, instanceIndex: target.instanceIndex };
    case "hero":
      return { kind: "hero", name: target.name };
    case "research":
      return { kind: "research", record: target.researchKey, name: target.name };
    case "townHall":
      return { kind: "townHall" };
    case "townHallWeapon":
      return { kind: "townHallWeapon" };
    case "crafted":
      return { kind: "crafted", defenseId: target.defenseId, moduleIndex: target.moduleIndex };
    case "pet":
      return null;
  }
};

export const toAssignmentTarget = (target: UpgradeTarget): HelperAssignmentTarget | null => {
  switch (target.kind) {
    case "building":
      return { type: "building", recordKey: target.record, buildingId: target.buildingId, instanceIndex: target.instanceIndex };
    case "hero":
      return { type: "hero", name: target.name };
    case "research":
      return { type: "research", researchKey: target.record, name: target.name };
    case "townHall":
      return { type: "townHall" };
    case "townHallWeapon":
      return { type: "townHallWeapon" };
    case "crafted":
      return { type: "crafted", defenseId: target.defenseId, moduleIndex: target.moduleIndex };
    default:
      return null;
  }
};

export const sameUpgradeTarget = (a: UpgradeTarget, b: UpgradeTarget) => JSON.stringify(a) === JSON.stringify(b);

export const readAssignment = (village: Playthrough, helper: AssigningHelper): HelperAssignment | undefined =>
  (village.dailies ?? defaultDailies).helpers[assignmentField[helper]];

export const writeAssignment = (
  village: Playthrough,
  helper: AssigningHelper,
  assignment: HelperAssignment | undefined,
): Playthrough => {
  const dailies = village.dailies ?? defaultDailies;
  return { ...village, dailies: { ...dailies, helpers: { ...dailies.helpers, [assignmentField[helper]]: assignment } } };
};

/** An upgrade that ends or is cancelled frees the helper assigned to it. */
export const dropAssignmentsFor = (village: Playthrough, target: UpgradeTarget): Playthrough =>
  assigningHelpers.reduce((current, helper) => {
    const assigned = readAssignment(current, helper);
    const assignedTarget = assigned && toUpgradeTarget(assigned.target);
    return assignedTarget && sameUpgradeTarget(assignedTarget, target) ? writeAssignment(current, helper, undefined) : current;
  }, village);
