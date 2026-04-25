/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
