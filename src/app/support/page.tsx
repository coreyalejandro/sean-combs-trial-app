import { SupportResources } from '@/components/shell/SupportResources'

export const metadata = { title: 'Get support' }

export default function SupportPage() {
  return (
    <div className="wrap support-page">
      <h1>Get support</h1>
      <p className="measure">
        If anything on this site brings up something for you, these services are free and confidential. You do not have to be in
        crisis to call.
      </p>
      <SupportResources />
    </div>
  )
}
