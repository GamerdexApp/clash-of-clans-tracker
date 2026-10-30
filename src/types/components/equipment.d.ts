import type { Playthrough } from "@/types/app";
import type { EquipmentPiece, OreAmounts } from "@/types/app/equipment";

export interface EquipmentCardProps {
  piece: EquipmentPiece;
  heroName: string;
  level: number;
  blacksmith: number;
  onUpgrade: () => void;
  onSetLevel: (level: number) => void;
}

export interface EquipmentPageContentProps {
  village: Playthrough;
}

export interface OreStockCardProps {
  stock: OreAmounts;
  /** The ore the pieces on screen still need. */
  needed: OreAmounts;
  deduct: boolean;
  onStockChange: (stock: OreAmounts) => void;
  onDeductChange: (deduct: boolean) => void;
}
