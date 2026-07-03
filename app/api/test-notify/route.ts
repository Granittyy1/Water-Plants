import { NextResponse } from "next/server";
import { getPlants } from "@/lib/plants";
import { sendNotification } from "@/lib/ntfy";

export async function POST() {
  try {
    const plants = await getPlants();
    const sample = plants[0];

    const message = sample
      ? `Test: ${sample.name} needs watering!`
      : `Test notification working! Add some plants to get started.`;

    await sendNotification(message);

    return NextResponse.json({ success: true, message });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
