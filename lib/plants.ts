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

export async function getPlants(): Promise<Plant[]> {
  try {
    const { blobs } = await list({ prefix: PLANTS_BLOB });
    if (blobs.length === 0) return [];
    const res = await fetch(blobs[0].url);
    return (await res.json()) as Plant[];
  } catch {
    return [];
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
