/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.ctfassets.net'], // Allow Contentful image domain
  },
  // other settings...
};

module.exports = nextConfig;
