import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-aws/:path*",
        destination: "http://52.7.90.137/:path*", // Recuerda agregar el puerto al final si tu backend no usa el puerto 80 (ej: :3000)
      },
    ];
  },
};

export default nextConfig;
