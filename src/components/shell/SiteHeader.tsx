import Link from 'next/link'
import { QuietModeToggle } from './QuietModeToggle'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="logo-box" aria-label="The Combs Trial, home">THE COMBS TRIAL</Link>
        <nav aria-label="Site" className="site-nav">
          <Link href="/days/">All days</Link>
          <Link href="/sources/">Sources</Link>
          <Link href="/support/" className="support-link">Get support</Link>
          <QuietModeToggle />
        </nav>
      </div>
    </header>
  )
}
