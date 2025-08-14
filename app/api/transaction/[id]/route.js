import { NextResponse } from "next/server";
import {
  getEntryById,
  updateEntryById,
  deleteEntryById,
  uploadImageToContentful,
  getContentfulEnvironment,
} from "../../../lib/contentfulClient";

const LOCALE = "en-US";

// GET receipt (transaction) by ID
export async function GET(req, context) {
  const { id } = context.params;

  try {
    const entry = await getEntryById(id);

    const fields = {};
    for (const key in entry.fields) {
      const val = entry.fields[key];
      if (val && val.sys) {
        fields[key] = val;
      } else {
        fields[key] = val ? val[LOCALE] : "";
      }
    }

    // If receiptImage exists, get URL
    if (fields.receiptImage?.sys?.id) {
      const env = await getContentfulEnvironment();
      const asset = await env.getAsset(fields.receiptImage.sys.id);
      const file = asset.fields.file?.[LOCALE];
      if (file?.url) {
        fields.receiptImageUrl = file.url.startsWith("//") ? `https:${file.url}` : file.url;
      }
    }

    return NextResponse.json({ fields });
  } catch (error) {
    console.error("GET transaction error:", error);
    return NextResponse.json({ error: "Failed to fetch transaction." }, { status: 500 });
  }
}

// PUT update receipt (transaction) by ID
export async function PUT(req, context) {
  const { id } = context.params;

  try {
    const formData = await req.formData();

    const fields = {};
    let receiptFile = null;
    let assetUrl = "";

    for (const [key, value] of formData.entries()) {
      if (key === "receiptImage" && typeof value === "object") {
        receiptFile = value;
      } else if (key !== "receiptImageUrl") {
        fields[key] = value;
      }
    }

    const environment = await getContentfulEnvironment();

    // Upload new receipt image if present
    if (receiptFile) {
      const uploadedAsset = await uploadImageToContentful(receiptFile, receiptFile.name);
      console.log("Uploaded new image:", uploadedAsset.sys.id);

      fields.receiptImage = {
        sys: {
          type: "Link",
          linkType: "Asset",
          id: uploadedAsset.sys.id,
        },
      };

      const file = uploadedAsset.fields.file?.[LOCALE];
      if (file?.url) {
        assetUrl = file.url.startsWith("//") ? `https:${file.url}` : file.url;
      }
    } else {
      // Preserve existing image if not updating
      const existingEntry = await getEntryById(id);
      if (existingEntry.fields.receiptImage?.sys) {
        fields.receiptImage = {
          [LOCALE]: existingEntry.fields.receiptImage
        };
      }
    }

    const updated = await updateEntryById(id, fields);
    console.log("Transaction updated:", updated.sys.id);

    // Retrieve receipt image URL if needed
    if (!assetUrl && updated.fields.receiptImage?.[LOCALE]?.sys?.id) {
      const existingAsset = await environment.getAsset(updated.fields.receiptImage[LOCALE].sys.id);
      const file = existingAsset.fields.file?.[LOCALE];
      if (file?.url) {
        assetUrl = file.url.startsWith("//") ? `https:${file.url}` : file.url;
      }
    }

    return NextResponse.json({ message: "Transaction updated.", updated });
  } catch (err) {
    console.error("PUT transaction error:", err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}

// DELETE receipt (transaction) by ID
export async function DELETE(req, context) {
  const { id } = context.params;

  try {
    await deleteEntryById(id);
    return NextResponse.json({ message: "Transaction deleted." });
  } catch (err) {
    console.error("DELETE transaction error:", err);
    return NextResponse.json({ error: "Failed to delete transaction." }, { status: 500 });
  }
}
