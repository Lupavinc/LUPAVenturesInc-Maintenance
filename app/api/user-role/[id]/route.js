//app/api/user-role/[id]/route.js
import { NextResponse } from "next/server";
import { contentfulManagementClient } from "../../../lib/contentful-management";

export async function PUT(req, contextPromise) {
  const context = await contextPromise;
  const { id } = context.params;

  const body = await req.json();
  const newRole = body.role;

  try {
    const space = await contentfulManagementClient.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || "master");
    const entry = await environment.getEntry(id);

    entry.fields.role = { "en-US": newRole };

    const updated = await entry.update();
    await updated.publish();

    return NextResponse.json({ updated: true });
  } catch (err) {
    console.error("Update user role error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
