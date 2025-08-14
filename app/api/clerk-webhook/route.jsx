//app/api/clerk-webhook/route.jsx
import { NextResponse } from "next/server";

// Get Contentful config from environment variables
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT_ID = "master";
const CONTENT_TYPE = "userRole";
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

export async function POST(req) {
  const body = await req.json();

  console.log("Clerk webhook received:", body.type);

  if (body.type !== "user.created") {
    return NextResponse.json({ ignored: true });
  }

  const userId = body.data.id;
  const email = body.data.email_addresses?.[0]?.email_address || "";
  const firstName = body.data.first_name || "";
  const lastName = body.data.last_name || "";
  const userName = body.data.username || "";
  
  try {
    // Check if user already exists in Contentful
    const queryUrl = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/entries?content_type=${CONTENT_TYPE}&fields.userId=${userId}`;

    const existingRes = await fetch(queryUrl, {
      headers: {
        Authorization: `Bearer ${MANAGEMENT_TOKEN}`,
      },
    });

    if (!existingRes.ok) {
      const errorText = await existingRes.text();
      console.error("❌ Contentful lookup failed:", errorText);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    const existingData = await existingRes.json();
    if (Array.isArray(existingData.items) && existingData.items.length > 0) {
      console.log("🔁 User already exists, skipping creation:", userId);
      return NextResponse.json({ exists: true });
    }

    // Create new entry with userName field included
    const createRes = await fetch(
      `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/entries`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MANAGEMENT_TOKEN}`,
          "Content-Type": "application/vnd.contentful.management.v1+json",
          "X-Contentful-Content-Type": CONTENT_TYPE,
        },
        body: JSON.stringify({
          fields: {
            userId: { "en-US": userId },
            role: { "en-US": "member" }, // default role
            email: { "en-US": email },
            firstName: { "en-US": firstName },
            lastName: { "en-US": lastName },
            userName: { "en-US": userName },  
          },
        }),
      }
    );

    const created = await createRes.json();

    if (!createRes.ok) {
      console.error("❌ Failed to create Contentful entry:", created);
      return NextResponse.json({ error: "Creation failed" }, { status: 500 });
    }

    // Publish the entry
    const entryId = created.sys.id;
    const version = created.sys.version;

    const publishRes = await fetch(
      `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/entries/${entryId}/published`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${MANAGEMENT_TOKEN}`,
          "X-Contentful-Version": version,
        },
      }
    );

    if (!publishRes.ok) {
      const errorText = await publishRes.text();
      console.error("❌ Failed to publish entry:", errorText);
      return NextResponse.json({ error: "Publish failed" }, { status: 500 });
    }

    console.log("✅ User role created & published for:", userId);
    return NextResponse.json({ created: true });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}