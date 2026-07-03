import { NextRequest, NextResponse } from "next/server";
import { getPlants, addPlant, deletePlant } from "@/lib/plants";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const plants = await getPlants();
  return NextResponse.json(plants);
}

export async function POST(request: NextRequest) {
  const { name, species, intervalDays, imageUrl } = await request.json();

  if (!name || !species || !intervalDays) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const plant = {
    id: uuidv4(),
    name,
    species,
    intervalDays,
    lastWatered: new Date().toISOString().split("T")[0],
    imageUrl,
  };

  await addPlant(plant);
  return NextResponse.json(plant, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing plant id" }, { status: 400 });
  }
  await deletePlant(id);
  return NextResponse.json({ success: true });
}
