// Plain meanings of court words and who people are (src/data/shared/glossary.json). The full list is /glossary/;
// each day page shows the terms its own record uses, collapsed, near the top.
import glossary from '@/data/shared/glossary.json'

export interface Term { term: string; match: string; plain: string }

export function allTerms(): Term[] {
  return (glossary as { terms: Term[] }).terms
}

/** Terms whose words appear in the given text (a day's record and its picture's copy). */
export function termsIn(text: string): Term[] {
  return allTerms().filter((t) => new RegExp(t.match, 'i').test(text))
}

export function GlossaryList({ terms }: { terms: Term[] }) {
  return (
    <dl className="glossary-list">
      {terms.map((t) => (
        <div key={t.term}>
          <dt>{t.term}</dt>
          <dd>{t.plain}</dd>
        </div>
      ))}
    </dl>
  )
}

export function WordsOnThisPage({ text }: { text: string }) {
  const terms = termsIn(text)
  if (terms.length === 0) return null
  return (
    <details className="words-on-page">
      <summary>Words and people on this page, in plain terms</summary>
      <GlossaryList terms={terms} />
      <p className="muted"><a href="/glossary/">Every word and person, in one list</a></p>
    </details>
  )
}
