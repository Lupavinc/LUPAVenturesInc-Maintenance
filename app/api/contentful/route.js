import { NextResponse } from "next/server";
import { createClient } from "contentful";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");  

  try {
    if (id) {
      
      const entry = await client.getEntry(id);
      return NextResponse.json(entry); 
    } else {
      
      const entries = await client.getEntries({
        content_type: "property"
        
      });

      return NextResponse.json(entries.items); 
    }
  } catch (error) {
    console.error("Contentful fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
