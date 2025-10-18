import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Supaya build nggak gagal kalau ada warning lint
    ignoreDuringBuilds: true,
  },
  images: {
    // Biar <img> biasa masih bisa dipakai tanpa optimisasi otomatis
    unoptimized: true,
  },
  typescript: {
    // Supaya build tetap jalan walau ada error tipe di TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
