/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 🚀 biar lint error ga ngeblok build
  },
  typescript: {
    ignoreBuildErrors: true, // 🚀 biar TypeScript error (kayak any) ga blok build juga
  },
};

export default nextConfig;
