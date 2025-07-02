/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
        // Fixes npm packages that depend on `canvas` module
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                canvas: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig; 