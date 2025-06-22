/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "yt3.ggpht.com",
      "yt3.googleusercontent.com",
      "i.ytimg.com",
      "lh3.googleusercontent.com",
    ],
  },
};

module.exports = nextConfig;
