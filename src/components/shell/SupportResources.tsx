// Care rule 7: support always one tap away. Numbers confirmed on each service's official site
// on November 19, 2026 (rainn.org, 988lifeline.org, thehotline.org).
export function SupportResources({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`support ${compact ? 'support-compact' : ''}`} aria-labelledby="support-heading">
      <h2 id="support-heading">{compact ? 'If you need support' : 'Free, confidential support, any time'}</h2>
      <ul className="support-list">
        <li>
          <strong>National Sexual Assault Hotline (RAINN)</strong>: call <a href="tel:18006564673">800.656.HOPE (4673)</a>,
          text HOPE to <a href="sms:64673&body=HOPE">64673</a>, or chat at{' '}
          <a href="https://rainn.org/hotline" rel="noopener noreferrer">RAINN.org/hotline</a>. Free, confidential, 24/7, in English and Spanish.
        </li>
        <li>
          <strong>988 Suicide and Crisis Lifeline</strong>: call or text <a href="tel:988">988</a>, or chat at{' '}
          <a href="https://chat.988lifeline.org" rel="noopener noreferrer">chat.988lifeline.org</a>. 24/7.
        </li>
        <li>
          <strong>National Domestic Violence Hotline</strong>: call <a href="tel:18007997233">1.800.799.SAFE (7233)</a> or text
          START to <a href="sms:88788&body=START">88788</a>. Live chat at{' '}
          <a href="https://www.thehotline.org" rel="noopener noreferrer">thehotline.org</a>.
        </li>
      </ul>
      {compact ? null : <p className="muted">In an emergency, call 911.</p>}
    </section>
  )
}
