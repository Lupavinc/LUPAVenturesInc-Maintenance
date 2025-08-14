import { createClient } from 'contentful';

const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,  
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,  
});

export async function saveMaintenanceRequestToContentful({
  firstName,
  lastName,
  email,
  subject,
  description,
  image,
  dateSubmitted,
  status
}) {
  try {
    
    let imageAsset = null;
    if (image) {
      
      imageAsset = {
        fields: {
          file: {
            contentType: 'image/jpeg', 
            fileName: `maintenance-image-${Date.now()}.jpg`,  
            upload: image,  
          },
          title: 'Maintenance Request Image',
        },
      };
    }

    // Create a new entry in Contentful
    const entry = await contentfulClient.getSpace(process.env.CONTENTFUL_SPACE_ID)
      .then((space) => space.createEntry('tenantMaintenanceRequest', {
        fields: {
          firstName: { 'en-US': firstName },
          lastName: { 'en-US': lastName },
          email: { 'en-US': email },
          subject: { 'en-US': subject },
          description: { 'en-US': description },
          dateSubmitted: { 'en-US': dateSubmitted },
          status: { 'en-US': status },
        },
      }));

    
    if (imageAsset) {
      const uploadedAsset = await contentfulClient.getSpace(process.env.CONTENTFUL_SPACE_ID)
        .then((space) => space.createAsset(imageAsset)
          .then((asset) => asset.processForAllLocales())
        );

      
      entry.fields.image = {
        'en-US': {
          sys: { id: uploadedAsset.sys.id, linkType: 'Asset', type: 'Link' }
        }
      };
    }

    // Publish the entry
    const publishedEntry = await entry.publish();
    console.log('Maintenance request saved:', publishedEntry);
    return publishedEntry;
  } catch (error) {
    console.error('Error saving maintenance request to Contentful:', error);
    throw error;
  }
}
