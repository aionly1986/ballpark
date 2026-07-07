import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow MDX files to be treated as pages/components.
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
}

const withMDX = createMDX({
  // Add markdown plugins here if needed later (remark/rehype).
})

export default withMDX(nextConfig)
