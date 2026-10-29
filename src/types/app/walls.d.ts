export interface WallLevel {
  level: number;
  /** The cost of one wall to reach this level from the level below. */
  cost: number;
  costResource: string;
  imageUrl: string;
  townHallRequired: number;
}

export interface WallPrice {
  amount: number;
  resource: string;
}
