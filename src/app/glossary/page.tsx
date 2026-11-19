import { allTerms, GlossaryList } from '@/components/shell/Glossary'

export const metadata = { title: 'Words used on this site' }

export default function GlossaryPage() {
  return (
    <div className="wrap sources-page">
      <h1>Words used on this site</h1>
      <p className="measure">Court words and the people named most often, in plain terms. Each day page also lists the ones it uses.</p>
      <GlossaryList terms={allTerms()} />
    </div>
  )
}
