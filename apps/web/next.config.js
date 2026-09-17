/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@pack-and-go/types", "@pack-and-go/config"],
};

module.exports = nextConfig;
