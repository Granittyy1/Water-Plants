# Plant Watering Reminder App ? Build Plan

## What to Build

A Next.js web app that:
1. Lets you upload photos of your plants (one-time setup)
2. Uses Google Gemini API to identify the plant species
3. Stores each plant with its watering interval
4. Sends daily push notifications via ntfy.sh when plants need watering
5. Has a dashboard with a "Watered" button to reset the timer

## Tech Stack

- **Framework**: Next.js (App Router)
- **Hosting**: Vercel (free tier)
- **Plant ID**: Google Gemini API (free tier)
- **Database**: Vercel KV or JSON file in Vercel Blob (free tier)
- **Notifications**: ntfy.sh (free, no signup)
- **Cron**: Vercel Cron (free, runs daily)

## Project Structure

```
app/
??? page.tsx                 # Dashboard ? plant list + "Watered" buttons
??? setup/page.tsx           # One-time setup ? upload photos
??? api/
?   ??? identify/route.ts    # Receives photo ? calls Gemini ? returns plant info
?   ??? water/route.ts       # Marks a plant as watered (updates lastWatered)
?   ??? cron/route.ts        # Called daily by Vercel Cron ? checks & sends ntfy
lib/
??? plants.ts                # CRUD operations for plant data
??? ntfy.ts                  # Send notification helper
vercel.json                  # Cron config: "0 19 * * *" (21:00 UTC+2)
```

## Data Model

```typescript
interface Plant {
  id: string;
  name: string;           // "Peace Lily"
  species: string;        // "Spathiphyllum"
  intervalDays: number;   // 7
  lastWatered: string;    // "2026-07-03"
  imageUrl?: string;      // optional photo
}
```

## Environment Variables Needed

- `GEMINI_API_KEY` ? from https://aistudio.google.com
- `NTFY_TOPIC` ? your unique ntfy topic (e.g. "my-plants-abc123")

## Notification Logic (cron)

Every day at 21:00:
- For each plant: if (today - lastWatered) >= intervalDays ? add to "needs water" list
- If list not empty ? POST to ntfy.sh with the list

## Phone Setup

- Install ntfy app (Android: Play Store, iOS: App Store)
- Subscribe to your topic (e.g. "my-plants-abc123")

## Build Command

Open this folder in Cursor and ask the agent:
"Build the plant watering reminder app based on BUILD_PLAN.md"
