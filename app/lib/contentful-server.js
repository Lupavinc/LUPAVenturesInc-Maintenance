// app/lib/contentful-server.js
import { createClient } from "contentful";

export const contentfulServerClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
  accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN, 
});
