// Care rules 4 and 6: third parties (sex workers, escort services) are never named on screen.
// Every piece of day-file text shown in the app passes through redactThirdParties().
// To add a name, edit THIRD_PARTY_NAMES (scaffold owner only) and the e2e test checks every page.
const THIRD_PARTY_NAMES: Array<[RegExp, string | ((match: string) => string)]> = [
  [/Cowboys 4 Angels/gi, 'an escort service named in court records'],
  [/\b(a sex worker),\s*Cabral,/gi, '$1 named in court records,'],
  [/\bCabral\b/g, 'a sex worker named in court records'],
  [/\bSujin\b|\bSugit\b/g, 'a man named in court records'],
  // Sex workers named in exhibits and testimony (Days 19 to 24).
  [/\bJules Theodore \(escort\)/g, 'A sex worker named in court records'],
  [/\bJules Theodore's\b/g, "a sex worker's"],
  [/\b(?:for )?escort Jules Theodore\b/g, (m: string) => (m.startsWith('for') ? 'for ' : '') + 'a sex worker named in court records'],
  [/\bJules Theodore\b/g, 'a sex worker named in court records'],
  [/\bMale sex workers referred to as 'Paul', 'Cabrel\/Cabral', 'Anton' \(pseudonymous\)/g, 'Male sex workers named in court records (pseudonyms)'],
  [/\bEscort 'Paul' and 'Anton'/g, 'Two sex workers named in court records'],
  [/\ban escort 'Paul'/g, 'a sex worker named in court records'],
  [/'Paul' \(sex worker named\)/g, 'A sex worker named in court records'],
  [/'(?:Paul|Anton|Cabrel)'/g, 'a sex worker named in court records'],
  [/\bCabrel\b/g, 'a sex worker named in court records'],
  // Privacy (care rule 3): Mia's later employer could identify her. Say only that she worked elsewhere.
  [/\bMadonna job\b/g, 'Her later job'],
  [/\bworked for Madonna\b/g, 'worked for another employer'],
  [/\bMadonna\b/g, 'a later employer'],
  // Care rule 6: people are called by name or role, never "accuser" as a label.
  [/\ban accuser\b/gi, 'a witness'],
  [/\baccusers\b/gi, 'witnesses'],
  [/\baccuser\b/gi, 'witness'],
]

export function redactThirdParties(text: string): string {
  return THIRD_PARTY_NAMES.reduce((t, [re, rep]) => (typeof rep === 'string' ? t.replace(re, rep) : t.replace(re, rep)), text)
}

/** For tests: the raw names that must never appear in rendered HTML. */
export const REDACTED_NAMES_FOR_TESTS = ['Cowboys 4 Angels', 'Cabral', 'Cabrel', 'Sujin', 'Sugit', 'Jules Theodore', 'Madonna', "'Paul'", "'Anton'"]
