// Care rules 4 and 6: third parties (sex workers, escort services) are never named on screen.
// Every piece of day-file text shown in the app passes through redactThirdParties().
// To add a name, edit THIRD_PARTY_NAMES (scaffold owner only) and the e2e test checks every page.
const THIRD_PARTY_NAMES: Array<[RegExp, string]> = [
  [/Cowboys 4 Angels/gi, 'an escort service named in court records'],
  [/\b(a sex worker),\s*Cabral,/gi, '$1 named in court records,'],
  [/\bCabral\b/g, 'a sex worker named in court records'],
  [/\bSujin\b|\bSugit\b/g, 'a man named in court records'],
  // Care rule 6: people are called by name or role, never "accuser" as a label.
  [/\ban accuser\b/gi, 'a witness'],
  [/\baccusers\b/gi, 'witnesses'],
  [/\baccuser\b/gi, 'witness'],
]

export function redactThirdParties(text: string): string {
  return THIRD_PARTY_NAMES.reduce((t, [re, rep]) => t.replace(re, rep), text)
}

/** For tests: the raw names that must never appear in rendered HTML. */
export const REDACTED_NAMES_FOR_TESTS = ['Cowboys 4 Angels', 'Cabral', 'Sujin', 'Sugit']
