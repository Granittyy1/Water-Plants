import { NextRequest, NextResponse } from "next/server";
import { updatePlant } from "@/lib/plants";

export async function POST(request: NextRequest) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing plant id" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  await updatePlant(id, { lastWatered: today });

  return NextResponse.json({ success: true, lastWatered: today });
}
