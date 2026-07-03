import { NextRequest, NextResponse } from "next/server";
import { getPlants } from "@/lib/plants";
import { sendNotification } from "@/lib/ntfy";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plants = await getPlants();
  const today = new Date();
  const needsWater: string[] = [];

  for (const plant of plants) {
    const lastWatered = new Date(plant.lastWatered);
    const daysSince = Math.floor(
      (today.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince >= plant.intervalDays) {
      needsWater.push(`${plant.name} (${daysSince} days ago)`);
    }
  }

  if (needsWater.length > 0) {
    const message = `These plants need water:\n${needsWater.map((p) => `? ${p}`).join("\n")}`;
    await sendNotification(message);
  }

  return NextResponse.json({
    checked: plants.length,
    needsWater: needsWater.length,
  });
}
