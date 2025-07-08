import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    eslint: {
    ignoreDuringBuilds: false // or true, depending on your needs
  },

  // support for cloudinary images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: `/**`, // replace with your cloud name
      },
      {
        // facebook
        protocol: 'https',
        hostname: 'facebook.com',
        port: '',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
