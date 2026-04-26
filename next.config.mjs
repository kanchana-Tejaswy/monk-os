import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure that the build uses the standard webpack engine
  // Turbopack is not yet compatible with next-pwa
  webpack: (config, { isServer }) => {
    // Custom webpack config if needed
    return config;
  },
};

export default withPWA(nextConfig);
