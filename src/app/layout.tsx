import type { Metadata, Viewport } from 'next'
import '@fontsource/libre-franklin/latin-400.css'
import '@fontsource/libre-franklin/latin-700.css'
import '@fontsource/libre-franklin/latin-900.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './globals.css'
import { SiteHeader } from '@/components/shell/SiteHeader'
import { quietModeInitScript } from '@/components/shell/QuietModeToggle'

export const metadata: Metadata = {
  title: { default: 'The Combs Trial', template: '%s · The Combs Trial' },
  description: 'One picture for each day the jury heard testimony in United States v. Sean Combs, then the verdict, then a march to Washington.',
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0a0b0d' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: quietModeInitScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <p>
              Every number on this site links to the outlet that reported it. No survivor is tracked or named. Testimony is
              summarised without graphic detail. <a href="/support/">Get support</a>.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
