/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    AZURE_SECRET: process.env.AZURE_SECRET,
    AZURE_REGION: process.env.AZURE_REGION,
    CHIMERA_API_KEY: process.env.CHIMERA_API_KEY,
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
