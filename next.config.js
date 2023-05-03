/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    AZURE_SECRET: process.env.AZURE_SECRET,
    AZURE_REGION: process.env.AZURE_REGION,
  },
}

module.exports = nextConfig
