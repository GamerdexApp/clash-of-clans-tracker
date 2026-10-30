export interface OreAmounts {
  shiny: number;
  glowing: number;
  starry: number;
}

export interface EquipmentStep {
  level: number;
  ore: OreAmounts;
  /** The Blacksmith level this level needs. */
  blacksmith: number;
}

export interface EquipmentPiece {
  id: string;
  name: string;
  heroId: string;
  rarity: "Common" | "Epic";
  imageUrl: string;
  maxLevel: number;
  /** Every level from 1 to the top, lowest first. Upgrades take no time. */
  steps: EquipmentStep[];
}
