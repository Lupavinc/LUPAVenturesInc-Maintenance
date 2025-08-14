//lib/maintenanceContentful.js
// lib/maintenanceContentful.js
import { createClient } from 'contentful-management';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT_ID || 'master';
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN;

const client = createClient({
  accessToken: CMA_TOKEN,
});

export async function createMaintenanceRequest(data) {
  const { firstName, lastName, email, subject, description, imageUrl } = data;

  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment(ENVIRONMENT_ID);

  const entry = await environment.createEntry('tenantMaintenanceRequest', {
    fields: {
      firstName: { 'en-US': firstName },
      lastName: { 'en-US': lastName },
      email: { 'en-US': email },
      subject: { 'en-US': subject },
      description: { 'en-US': description },
      dateSubmitted: { 'en-US': new Date().toISOString() },
      status: { 'en-US': 'pending' },
    },
  });

  if (imageUrl) {
    const asset = await environment.createAssetFromFiles({
      fields: {
        title: { 'en-US': `${firstName}-${Date.now()}` },
        file: {
          'en-US': {
            contentType: 'image/jpeg',
            fileName: `maintenance-${Date.now()}.jpg`,
            upload: imageUrl,
          },
        },
      },
    });

    await asset.processForAllLocales();
    await asset.publish();

    entry.fields.image = {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: asset.sys.id,
        },
      },
    };
  }

  await entry.update();
  await entry.publish();

  return entry;
}
