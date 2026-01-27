/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/gongkao',
  assetPrefix: '/gongkao/',
  reactStrictMode: true,

  // 性能优化
  swcMinify: true, // 使用 SWC 压缩（Next.js 13+ 默认启用）
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // 生产环境移除 console
  },
}

export default nextConfig
