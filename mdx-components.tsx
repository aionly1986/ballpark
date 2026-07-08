import type { MDXComponents } from 'mdx/types'
import { Callout, Panel, Formula, Step, Example } from '@/components/content'

// Required by @next/mdx in the App Router. Styles the guide content below each
// tool: navy headings, indigo links/accents, tinted tables, and the reusable
// content components (Callout, Panel, Formula, Step, Example).
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => <h2 className="mt-12 mb-3 text-2xl font-bold tracking-tight text-brand-navy" {...props} />,
    h3: (props) => <h3 className="mt-8 mb-2 text-lg font-semibold tracking-tight text-brand-navy" {...props} />,
    p: (props) => <p className="my-4 leading-7 text-ink-soft" {...props} />,
    ul: (props) => <ul className="my-4 list-disc space-y-1 pl-6 text-ink-soft" {...props} />,
    ol: (props) => <ol className="my-4 list-decimal space-y-1 pl-6 text-ink-soft" {...props} />,
    li: (props) => <li className="leading-7" {...props} />,
    a: (props) => <a className="font-medium text-accent underline underline-offset-2 transition hover:opacity-80" {...props} />,
    strong: (props) => <strong className="font-semibold text-ink" {...props} />,
    // Tables: bold navy headers on a soft tint, skimmable, scroll on small screens.
    table: (props) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full border-collapse text-left text-sm" {...props} />
      </div>
    ),
    thead: (props) => <thead className="bg-accent-soft" {...props} />,
    th: (props) => <th className="border-b border-surface-border px-4 py-2.5 font-semibold text-brand-navy" {...props} />,
    td: (props) => <td className="border-b border-surface-border px-4 py-2.5 align-top text-ink-soft" {...props} />,
    tr: (props) => <tr className="last:[&>td]:border-0" {...props} />,
    // Reusable content components (usable directly in .mdx files).
    Callout,
    Panel,
    Formula,
    Step,
    Example,
    ...components,
  }
}
