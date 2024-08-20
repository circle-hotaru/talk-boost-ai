/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_API_PROXY: process.env.OPENAI_API_PROXY,
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
