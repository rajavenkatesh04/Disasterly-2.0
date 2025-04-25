const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.pixabay.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'rmsupply.co.uk',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.maydaysupplies.com',
                pathname: '/**',
            }
        ],
    },
};
export default nextConfig;
