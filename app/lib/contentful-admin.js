import { createClient } from 'contentful-management';

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const environmentId = process.env.CONTENTFUL_ENVIRONMENT || 'master';

const client = createClient({ accessToken });

async function getEnvironment() {
  const space = await client.getSpace(spaceId);
  return await space.getEnvironment(environmentId);
}

/**
 * Uploads an image buffer to Contentful, creates, processes, and publishes an asset.
 * @param {Buffer} fileBuffer - The binary data of the image.
 * @param {string} fileName - The name of the file (e.g. 'image.jpg').
 * @param {string} contentType - MIME type of the file (e.g. 'image/jpeg').
 * @returns {object|null} Published asset object, or null on failure.
 */
export async function uploadImageToContentful(fileBuffer, fileName, contentType) {
  try {
    const environment = await getEnvironment();

    // Step 1: Create an upload (upload raw bytes)
    const upload = await environment.createUpload({ file: fileBuffer });

    // Step 2: Create the asset with a link to the upload
    let asset = await environment.createAsset({
      fields: {
        title: {
          'en-US': fileName,
        },
        file: {
          'en-US': {
            fileName,
            contentType,
            uploadFrom: {
              sys: {
                type: 'Link',
                linkType: 'Upload',
                id: upload.sys.id,
              },
            },
          },
        },
      },
    });

    // Step 3: Process the asset for all locales
    await asset.processForAllLocales();

    // Step 4: Re-fetch the asset to get latest version
    asset = await environment.getAsset(asset.sys.id);

    // Step 5: Publish the asset
    const publishedAsset = await asset.publish();

    return publishedAsset;
  } catch (err) {
    console.error('❌ Failed to upload image to Contentful:', err);
    return null; 
  }
}

/**
 * Creates a 'tenantMaintenanceRequest' entry linking the image asset.
 * @param {object} data - Form data from user.
 * @param {object|null} asset - Published Contentful asset (optional).
 * @returns {object} Published entry.
 */
export async function createEntryWithImage(data, asset) {
  try {
    if (!asset || !asset.sys?.id) {
      throw new Error('Asset is required but missing or invalid.');
    }

    const environment = await getEnvironment();

    const fields = {
      firstName: { 'en-US': data.firstName },
      lastName: { 'en-US': data.lastName },
      email: { 'en-US': data.email },
      subject: { 'en-US': data.subject },
      description: { 'en-US': data.description },
      // Only add image field if asset is valid
        ...(asset?.sys?.id && {
        image: {
            'en-US': {
            sys: {
                type: 'Link',
                linkType: 'Asset',
                id: asset.sys.id,
            },
            },
        },
        }),
      dateSubmitted: { 'en-US': new Date().toISOString() },
      status: { 'en-US': 'Pending' },
    };

    const entry = await environment.createEntry('tenantMaintenanceRequest', { fields });
    const publishedEntry = await entry.publish();

    return publishedEntry;
  } catch (error) {
    console.error('❌ Failed to create entry with image:', error.message || error);
    throw error;
  }
}

