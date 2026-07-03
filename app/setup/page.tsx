"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SetupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [intervalDays, setIntervalDays] = useState(7);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function identifyPlant() {
    if (!file) return;
    setIdentifying(true);

    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch("/api/identify", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      setName(data.name || "");
      setSpecies(data.species || "");
      setIntervalDays(data.intervalDays || 7);
    } else {
      alert("Could not identify plant: " + (data.error || "Unknown error"));
    }

    setIdentifying(false);
  }

  async function savePlant() {
    if (!name || !species) {
      alert("Please fill in the plant name and species.");
      return;
    }
    setSaving(true);

    const res = await fetch("/api/plants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, species, intervalDays }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      alert("Failed to save plant.");
      setSaving(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add a Plant</h1>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Back to dashboard
        </Link>
      </div>

      {/* Photo upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plant Photo
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 transition-colors"
        >
          {preview ? (
            <img
              src={preview}
              alt="Plant preview"
              className="max-h-48 mx-auto rounded-lg"
            />
          ) : (
            <div className="text-gray-400">
              <p className="text-4xl mb-2">??</p>
              <p>Click to upload a photo</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {file && (
          <button
            onClick={identifyPlant}
            disabled={identifying}
            className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
          >
            {identifying ? "Identifying..." : "?? Identify with AI"}
          </button>
        )}
      </div>

      {/* Plant details form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Common Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Peace Lily"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Species
          </label>
          <input
            type="text"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder="e.g. Spathiphyllum"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Watering Interval (days)
          </label>
          <input
            type="number"
            value={intervalDays}
            onChange={(e) => setIntervalDays(Number(e.target.value))}
            min={1}
            max={90}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={savePlant}
          disabled={saving || !name || !species}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-semibold text-lg"
        >
          {saving ? "Saving..." : "? Save Plant"}
        </button>
      </div>
    </main>
  );
}
