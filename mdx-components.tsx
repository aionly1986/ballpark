import type { MDXComponents } from 'mdx/types'

// Required by @next/mdx in the App Router. Maps markdown elements to styled
// components so unique page content inherits the shared design system.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => <h2 className="mt-10 mb-3 text-2xl font-semibold tracking-tight text-ink" {...props} />,
    h3: (props) => <h3 className="mt-8 mb-2 text-xl font-semibold tracking-tight text-ink" {...props} />,
    p: (props) => <p className="my-4 leading-7 text-ink-soft" {...props} />,
    ul: (props) => <ul className="my-4 list-disc space-y-1 pl-6 text-ink-soft" {...props} />,
    ol: (props) => <ol className="my-4 list-decimal space-y-1 pl-6 text-ink-soft" {...props} />,
    li: (props) => <li className="leading-7" {...props} />,
    a: (props) => <a className="font-medium text-ink underline underline-offset-2 decoration-ink-faint transition hover:decoration-ink" {...props} />,
    strong: (props) => <strong className="font-semibold text-ink" {...props} />,
    ...components,
  }
}
