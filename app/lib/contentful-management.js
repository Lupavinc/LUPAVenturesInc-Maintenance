// app/lib/contentful-management.js
import { createClient } from "contentful-management";

export const contentfulManagementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});
