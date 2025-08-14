// lib/contentfulClient.js
import { createClient } from "contentful-management";
import mime from "mime-types";

// Connect to Contentful environment
export async function getContentfulEnvironment() {
  const client = createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  });

  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
  const environment = await space.getEnvironment(
    process.env.CONTENTFUL_ENVIRONMENT || "master"
  );

  return environment;
}

// Fetch a single entry by ID
export async function getEntryById(entryId) {
  const env = await getContentfulEnvironment();
  const entry = await env.getEntry(entryId);
  return entry;
}

// Field-specific type casting (for both properties and transactions)
const FIELD_CASTS = {
  amount: (val) => parseFloat(val),
  tranDate: (val) => val, // Optionally: new Date(val).toISOString()
  bedroomsNum: (val) => parseInt(val, 10),
  bathroomsnumber: (val) => parseInt(val, 10),
  publishProperty: (val) => val === "true",
  notifySubscribers: (val) => val === "true",
};

// Update entry fields by ID
export async function updateEntryById(entryId, fieldsToUpdate) {
  const env = await getContentfulEnvironment();
  const entry = await env.getEntry(entryId);

  Object.entries(fieldsToUpdate).forEach(([key, value]) => {
    const castValue = FIELD_CASTS[key] ? FIELD_CASTS[key](value) : value;
    entry.fields[key] = {
      "en-US": castValue,
    };
  });

  const updatedEntry = await entry.update();
  await updatedEntry.publish();

  return updatedEntry;
}

// Delete entry by ID
export async function deleteEntryById(entryId) {
  const env = await getContentfulEnvironment();
  const entry = await env.getEntry(entryId);

  try {
    await entry.unpublish();
  } catch {
    // Ignore if not published
  }

  await entry.delete();
}

// Upload image to Contentful and publish asset
export async function uploadImageToContentful(file, filename) {
  const env = await getContentfulEnvironment();

  const contentType = mime.lookup(filename) || "image/jpeg";

  // Upload the raw file
  const upload = await env.createUpload({
    file: await file.arrayBuffer(),
  });

  // Create asset linked to uploaded file
  let asset = await env.createAsset({
    fields: {
      title: {
        "en-US": filename,
      },
      file: {
        "en-US": {
          contentType,
          fileName: filename,
          uploadFrom: {
            sys: {
              type: "Link",
              linkType: "Upload",
              id: upload.sys.id,
            },
          },
        },
      },
    },
  });

  // Process asset and await completion
  asset = await asset.processForAllLocales();

  // Refetch asset to get latest version after processing
  asset = await env.getAsset(asset.sys.id);

  // Publish the updated asset
  const publishedAsset = await asset.publish();

  return publishedAsset;
}
