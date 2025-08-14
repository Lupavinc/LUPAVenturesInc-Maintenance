import { NextResponse } from "next/server";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT_ID = "master";
const CONTENT_TYPE = "userRole";
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const url = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/entries?content_type=${CONTENT_TYPE}&fields.userId=${userId}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Contentful lookup error:", text);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  const data = await res.json();
  const entry = data.items?.[0];
  const role = entry?.fields?.role?.['en-US'] || null;

  return NextResponse.json({ role });
}
