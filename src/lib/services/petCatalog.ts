import { home } from "clash-of-clans-data";

import { toPublicImageUrl } from "@/lib/utils/imageHelpers";

interface RawPet {
  name: string;
  levels: Array<{ level: number; townHallRequired?: number; petHouseLevelRequired?: number }>;
  images?: { icon?: string };
}

export interface CatalogPet {
  name: string;
  imageUrl: string;
  maxLevel: number;
  townHallRequired: number;
  petHouseRequired: number;
}

const catalog: CatalogPet[] = (home().pets().get() as unknown as RawPet[]).map((pet) => ({
  name: pet.name,
  imageUrl: pet.images?.icon ? toPublicImageUrl(pet.images.icon) : "",
  maxLevel: pet.levels[pet.levels.length - 1].level,
  townHallRequired: pet.levels[0]?.townHallRequired ?? 0,
  petHouseRequired: pet.levels[0]?.petHouseLevelRequired ?? 0,
}));

/** Every pet in the game, for the list a village below Town Hall 14 reads. */
export const allPets = (): CatalogPet[] => catalog;
