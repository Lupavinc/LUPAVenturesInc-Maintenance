import { NextResponse } from "next/server";
import { getContentfulEnvironment } from "../../../lib/contentfulClient";

const LOCALE = "en-US";

export async function GET() {
  try {
    const env = await getContentfulEnvironment();
    const entries = await env.getEntries({ content_type: "transactions" });

    const transactions = entries.items.map((entry) => {
      const fields = {};

      for (const key in entry.fields) {
        const val = entry.fields[key];
        if (val && typeof val === "object" && val[LOCALE] !== undefined) {
          fields[key] = val[LOCALE];
        } else {
          fields[key] = val;
        }
      }

      // Remove this part, so no image fetching
      // if (entry.fields.receiptImage?.sys?.id) { ... }

      // Instead, just mark if receipt exists or not
      fields.receiptAttached = !!entry.fields.receiptImage?.sys?.id;

      return fields;
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to load transactions." },
      { status: 500 }
    );
  }
}
