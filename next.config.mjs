import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow MDX files to be treated as pages/components.
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
}

const withMDX = createMDX({
  // remark-gfm enables GitHub-flavored markdown: tables, strikethrough, etc.
  options: {
    remarkPlugins: [remarkGfm],
  },
})

export default withMDX(nextConfig)
