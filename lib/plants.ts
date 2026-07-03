import { put, list, del } from "@vercel/blob";

export interface Plant {
  id: string;
  name: string;
  species: string;
  intervalDays: number;
  lastWatered: string;
  imageUrl?: string;
}

const PLANTS_BLOB = "plants.json";

const DEFAULT_PLANTS: Plant[] = [
  {
    id: "1",
    name: "Orchid",
    species: "Phalaenopsis",
    intervalDays: 7,
    lastWatered: "2026-07-03",
  },
  {
    id: "2",
    name: "Christmas Cactus",
    species: "Schlumbergera",
    intervalDays: 10,
    lastWatered: "2026-07-03",
  },
  {
    id: "3",
    name: "Monstera",
    species: "Monstera deliciosa",
    intervalDays: 7,
    lastWatered: "2026-07-03",
  },
  {
    id: "4",
    name: "ZZ Plant",
    species: "Zamioculcas zamiifolia",
    intervalDays: 14,
    lastWatered: "2026-07-03",
  },
  {
    id: "5",
    name: "Frangipani",
    species: "Plumeria",
    intervalDays: 10,
    lastWatered: "2026-07-03",
  },
  {
    id: "6",
    name: "Dragon Tree",
    species: "Dracaena marginata",
    intervalDays: 10,
    lastWatered: "2026-07-03",
  },
];

export async function getPlants(): Promise<Plant[]> {
  try {
    const { blobs } = await list({ prefix: PLANTS_BLOB });
    if (blobs.length === 0) return DEFAULT_PLANTS;
    const res = await fetch(blobs[0].url);
    const plants = (await res.json()) as Plant[];
    return plants.length > 0 ? plants : DEFAULT_PLANTS;
  } catch {
    return DEFAULT_PLANTS;
  }
}

export async function savePlants(plants: Plant[]): Promise<void> {
  const { blobs } = await list({ prefix: PLANTS_BLOB });
  for (const blob of blobs) {
    await del(blob.url);
  }
  await put(PLANTS_BLOB, JSON.stringify(plants, null, 2), {
    access: "public",
    contentType: "application/json",
  });
}

export async function addPlant(plant: Plant): Promise<void> {
  const plants = await getPlants();
  plants.push(plant);
  await savePlants(plants);
}

export async function updatePlant(
  id: string,
  updates: Partial<Plant>
): Promise<void> {
  const plants = await getPlants();
  const idx = plants.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Plant ${id} not found`);
  plants[idx] = { ...plants[idx], ...updates };
  await savePlants(plants);
}

export async function deletePlant(id: string): Promise<void> {
  const plants = await getPlants();
  await savePlants(plants.filter((p) => p.id !== id));
}
