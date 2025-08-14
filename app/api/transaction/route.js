// app/api/transaction/route.js

import { NextResponse } from "next/server";
import { createClient } from "contentful-management";
import { Readable } from "stream";

export async function POST(req) {
  try {
    const formData = await req.formData();

    // Log for debugging
    console.log("Received formData:");
    for (const [key, value] of formData.entries()) {
      if (key === "receiptImage") {
        console.log(`${key}: [File] name=${value.name}, type=${value.type}`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Extract fields except the image
    const fields = {};
    for (const [key, value] of formData.entries()) {
      if (key === "receiptImage") continue;
      fields[key] = value;
    }

    const receiptImage = formData.get("receiptImage");

    // Validate image file
    if (!receiptImage || typeof receiptImage === "string") {
      return NextResponse.json(
        { error: "Receipt image required." },
        { status: 400 }
      );
    }

    // Validate amount
    const amount = parseFloat(fields.amount);
    if (isNaN(amount)) {
      return NextResponse.json(
        { error: "Amount must be a valid number." },
        { status: 400 }
      );
    }

    // ✅ Validate date format (YYYY-MM-DD)
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(fields.tranDate);
    if (!isValidDate) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    // Create Contentful client
    const client = createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    });

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment(
      process.env.CONTENTFUL_ENVIRONMENT || "master"
    );

    // Upload image to Contentful
    const buffer = Buffer.from(await receiptImage.arrayBuffer());
    const stream = Readable.from(buffer);

    let asset = await environment.createAssetFromFiles({
      fields: {
        title: { "en-US": receiptImage.name },
        file: {
          "en-US": {
            contentType: receiptImage.type,
            fileName: receiptImage.name,
            file: stream,
          },
        },
      },
    });

    await asset.processForAllLocales();

    // Wait for image processing
    let processed = false;
    for (let i = 0; i < 10 && !processed; i++) {
      asset = await environment.getAsset(asset.sys.id);
      if (asset.fields.file?.["en-US"]?.url) {
        processed = true;
      } else {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (!processed) {
      return NextResponse.json(
        { error: "Image processing timeout." },
        { status: 500 }
      );
    }

    await asset.publish();

    // Create entry in Contentful
    const entry = await environment.createEntry("transactions", {
      fields: {
        uniqueId: { "en-US": fields.uniqueId },
        tranDate: { "en-US": fields.tranDate },
        type: { "en-US": fields.type },
        amount: { "en-US": amount },
        property: { "en-US": fields.property },
        payerPayee: { "en-US": fields.payerPayee },
        filepath: { "en-US": fields.filepath || "" },
        notes: { "en-US": fields.notes || "" },
        receiptImage: {
          "en-US": {
            sys: {
              type: "Link",
              linkType: "Asset",
              id: asset.sys.id,
            },
          },
        },
      },
    });

    await entry.publish();

    return NextResponse.json(
      { message: "Transaction created", entryId: entry.sys.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in transaction POST:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create transaction." },
      { status: 500 }
    );
  }
}

