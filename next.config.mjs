/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore README / LICENSE files inside @libsql packages
      config.module.rules.push({
        test: /node_modules\/@libsql\/.*\.(md|MD|markdown|LICENSE)$/i,
        use: 'null-loader',
      });
    }

    return config;
  },
};

export default nextConfig;
