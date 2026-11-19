import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: '48px 16px' }}>
      <h1>Page not found</h1>
      <p><Link href="/days/">See all days</Link></p>
    </div>
  )
}
