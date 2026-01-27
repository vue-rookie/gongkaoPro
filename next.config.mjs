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

  // 优化构建
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-markdown'], // 优化大型包的导入
  },

  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
