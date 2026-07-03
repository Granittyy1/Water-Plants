export async function sendNotification(message: string): Promise<void> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) throw new Error("NTFY_TOPIC environment variable is not set");

  await fetch(`https://ntfy.sh/${topic}`, {
    method: "POST",
    headers: { Title: "Water Plants ??" },
    body: message,
  });
}
