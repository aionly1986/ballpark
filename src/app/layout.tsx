import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tryballpark.com'),
  title: {
    default: 'Ballpark: Free Settlement Calculators',
    template: '%s',
  },
  description:
    'Free, instant settlement calculators for personal injury claims. Estimate your case value in seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <header className="border-b border-surface-border bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ballpark-icon.png" alt="" width={28} height={28} className="rounded-md" />
              Ballpark
            </Link>
            <span className="text-sm text-ink-faint">Free settlement calculators</span>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-16 border-t border-surface-border bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-8">
            <Link href="/" className="inline-flex items-center gap-2 text-base font-bold tracking-tight text-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ballpark-icon.png" alt="" width={24} height={24} className="rounded" />
              Ballpark
            </Link>
            <p className="mt-4 text-xs leading-6 text-ink-faint">
              Ballpark provides free educational estimates only. It is not a law firm and
              does not provide legal advice. Estimates are not a guarantee of any outcome.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
