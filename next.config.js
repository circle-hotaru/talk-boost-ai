/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    AZURE_SECRET: process.env.AZURE_SECRET,
    AZURE_REGION: process.env.AZURE_REGION,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_API_PROXY: process.env.OPENAI_API_PROXY,
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
