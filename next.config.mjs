/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // URL lama dari mirror: /preview/pesta-teh
      { source: "/preview/pesta-teh", destination: "/pesta-teh", permanent: false },
    ];
  },
};
export default nextConfig;
