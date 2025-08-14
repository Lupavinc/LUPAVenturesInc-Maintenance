// app/lib/contentful.js

export async function fetchProperties() {
  const res = await fetch("/api/contentful");
  if (!res.ok) {
    throw new Error("Failed to fetch homes");
  }
  return await res.json();
}
