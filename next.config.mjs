/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // תמונות הפרופיל של Google
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
};
export default nextConfig;
