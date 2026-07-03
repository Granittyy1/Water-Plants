"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Plant {
  id: string;
  name: string;
  species: string;
  intervalDays: number;
  lastWatered: string;
  imageUrl?: string;
}

export default function Dashboard() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlants = useCallback(async () => {
    const res = await fetch("/api/plants");
    if (res.ok) setPlants(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  async function markWatered(id: string) {
    await fetch("/api/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchPlants();
  }

  async function testNotification() {
    const res = await fetch("/api/test-notify", { method: "POST" });
    const data = await res.json();
    if (data.success) alert("Notification sent! Check your phone.");
    else alert("Failed to send notification.");
  }

  function getDaysOverdue(plant: Plant): number {
    const last = new Date(plant.lastWatered);
    const now = new Date();
    const daysSince = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince - plant.intervalDays;
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">&#127793; My Plants</h1>
        <div className="flex gap-2">
          <button
            onClick={testNotification}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
          >
            Test Notification
          </button>
          <Link
            href="/setup"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            + Add Plant
          </Link>
        </div>
      </div>

      {plants.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-5xl mb-4">&#129716;</p>
          <p className="text-lg">No plants yet.</p>
          <Link
            href="/setup"
            className="inline-block mt-4 text-green-600 underline hover:text-green-700"
          >
            Add your first plant
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {plants.map((plant) => {
            const overdue = getDaysOverdue(plant);
            const needsWater = overdue >= 0;
            return (
              <div
                key={plant.id}
                className={`p-4 rounded-xl border ${
                  needsWater
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-white"
                } shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {plant.name}
                    </h2>
                    <p className="text-sm text-gray-500 italic">
                      {plant.species}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Water every {plant.intervalDays} days
                      {needsWater ? (
                        <span className="ml-2 text-red-600 font-medium">
                          ? overdue by {overdue} day{overdue !== 1 ? "s" : ""}!
                        </span>
                      ) : (
                        <span className="ml-2 text-green-600">
                          ? next in {Math.abs(overdue)} day
                          {Math.abs(overdue) !== 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => markWatered(plant.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shrink-0"
                  >
                    &#128167; Watered
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
