/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Use directory of this config file so app is always found (src/app)
    root: __dirname,
  },
};

module.exports = nextConfig;
