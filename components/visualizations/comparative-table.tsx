'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Scale, MessageCircle, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface ComparisonEntry {
  id: string
  allegation: string
  allegation_details: string
  defense_challenge: string
  defense_evidence: string[]
  mia_rebuttal: string
  rebuttal_evidence: string[]
  legal_standard: string
  credibility_impact: 'strengthened' | 'weakened' | 'neutral' | 'complex'
  evidence_type: 'testimony' | 'physical' | 'documentary' | 'digital'
  timeline: string
}

interface ComparativeTableProps {
  trialDay: TrialDay
}

export default function ComparativeTableVisualization({ trialDay }: ComparativeTableProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedEntry, setSelectedEntry] = useState<ComparisonEntry | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterImpact, setFilterImpact] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'timeline' | 'impact' | 'allegation'>('timeline')

  const comparisonData: ComparisonEntry[] = useMemo(() => [
    {
      id: 'sexual-assault-timing',
      allegation: 'Delayed Disclosure of Sexual Assault',
      allegation_details: 'Mia testified that Combs sexually assaulted her but did not immediately report or disclose the incident to authorities or close contacts.',
      defense_challenge: 'Defense argues that delayed disclosure undermines credibility and suggests the assault never occurred, pointing to the significant time gap between alleged incident and formal complaint.',
      defense_evidence: [
        'No contemporaneous reports to police',
        'No medical records from time of alleged assault',
        'Continued employment after alleged incident',
        'No disclosure to family or friends at the time'
      ],
      mia_rebuttal: 'Mia explained that delayed disclosure is common in sexual assault cases, especially when perpetrator holds power over victim. Fear of retaliation, job loss, and disbelief prevented immediate reporting.',
      rebuttal_evidence: [
        'Expert testimony on delayed disclosure patterns',
        'Evidence of fear of job loss and retaliation',
        'Testimony about power dynamics and control',
        'Similar patterns in other victims\' testimonies'
      ],
      legal_standard: 'Courts recognize that delayed disclosure does not automatically undermine credibility in sexual assault cases',
      credibility_impact: 'neutral',
      evidence_type: 'testimony',
      timeline: '2018-2024'
    },
    
    {
      id: 'affectionate-communications',
      allegation: 'Friendly Text Messages Post-Assault',
      allegation_details: 'Mia sent affectionate and friendly text messages to Combs after the alleged sexual assault, including expressions of care and professional collaboration.',
      defense_challenge: 'Defense presents numerous text messages showing Mia expressing affection, gratitude, and willingness to continue working relationship, arguing this contradicts assault allegations.',
      defense_evidence: [
        'Text messages expressing love and appreciation',
        'Professional collaboration requests',
        'Social media interactions showing positive relationship',
        'Voluntary participation in work events after alleged assault'
      ],
      mia_rebuttal: 'Mia testified that maintaining positive communications was survival strategy in abusive relationship. Fear of retaliation and need to maintain employment forced her to act normally despite trauma.',
      rebuttal_evidence: [
        'Expert testimony on victim survival behaviors',
        'Evidence of financial dependency on employment',
        'Testimony about fear of violent retaliation',
        'Pattern of similar behavior from other victims'
      ],
      legal_standard: 'Victim behavior following assault can vary widely and continued contact does not negate assault claims',
      credibility_impact: 'complex',
      evidence_type: 'digital',
      timeline: '2018-2020'
    },
    
    {
      id: 'employment-continuation',
      allegation: 'Continued Employment After Assault',
      allegation_details: 'Mia continued working for Combs for significant period after alleged sexual assault, maintaining professional duties and responsibilities.',
      defense_challenge: 'Defense argues that no reasonable person would continue working for someone who sexually assaulted them, suggesting allegations are fabricated for financial gain.',
      defense_evidence: [
        'Employment records showing continued work',
        'Performance evaluations and salary increases',
        'Voluntary acceptance of additional responsibilities',
        'No formal complaints to HR or management'
      ],
      mia_rebuttal: 'Mia explained she needed the job for financial survival and feared losing employment. Leaving would have meant career destruction and potential blacklisting in entertainment industry.',
      rebuttal_evidence: [
        'Evidence of limited job opportunities in industry',
        'Testimony about financial dependency',
        'Expert testimony on economic coercion',
        'Documentation of industry power dynamics'
      ],
      legal_standard: 'Continued employment does not preclude sexual assault claims, especially in power-imbalanced relationships',
      credibility_impact: 'complex',
      evidence_type: 'documentary',
      timeline: '2018-2022'
    },
    
    {
      id: 'memory-inconsistencies',
      allegation: 'Inconsistent Memory of Assault Details',
      allegation_details: 'Mia provided testimony with some variations in specific details about the assault incident across different interviews and court appearances.',
      defense_challenge: 'Defense highlights inconsistencies in timeline, location details, and sequence of events, arguing these discrepancies indicate fabricated testimony.',
      defense_evidence: [
        'Variations in testimony between depositions',
        'Different details provided to investigators',
        'Inconsistencies in timeline of events',
        'Conflicting statements about assault location'
      ],
      mia_rebuttal: 'Mia acknowledged some details varied but maintained core allegations remained consistent. Explained that trauma affects memory formation and recall, and minor inconsistencies are normal.',
      rebuttal_evidence: [
        'Expert testimony on trauma effects on memory',
        'Core allegations remained consistent across testimonies',
        'Documentation of traumatic stress symptoms',
        'Precedent cases with similar memory variations'
      ],
      legal_standard: 'Minor inconsistencies in testimony do not automatically invalidate assault allegations, especially considering trauma effects',
      credibility_impact: 'neutral',
      evidence_type: 'testimony',
      timeline: '2023-2024'
    },
    
    {
      id: 'financial-motivations',
      allegation: 'Financial Motivation for Allegations',
      allegation_details: 'Mia filed civil lawsuit seeking monetary damages concurrent with criminal charges, raising questions about financial motivations for allegations.',
      defense_challenge: 'Defense argues Mia fabricated assault allegations to obtain financial settlement, pointing to timing of civil lawsuit and potential monetary gains.',
      defense_evidence: [
        'Civil lawsuit filed for monetary damages',
        'Timing correlation with criminal charges',
        'Evidence of financial difficulties',
        'Potential for substantial settlement payments'
      ],
      mia_rebuttal: 'Mia testified that civil lawsuit seeks justice and accountability, not just money. Emphasized that coming forward involved significant personal costs and risks.',
      rebuttal_evidence: [
        'Evidence of personal costs of coming forward',
        'Testimony about seeking justice and accountability',
        'Documentation of reputational damage from allegations',
        'Expert testimony on motivations for reporting assault'
      ],
      legal_standard: 'Civil lawsuit concurrent with criminal charges does not automatically indicate false allegations',
      credibility_impact: 'complex',
      evidence_type: 'documentary',
      timeline: '2023-2024'
    },
    
    {
      id: 'witness-corroboration',
      allegation: 'Lack of Direct Witness Corroboration',
      allegation_details: 'No direct witnesses to the alleged sexual assault were present, making it primarily a he-said/she-said situation without independent corroboration.',
      defense_challenge: 'Defense emphasizes absence of witnesses, arguing that assault allegations cannot be proven beyond reasonable doubt without corroborating testimony.',
      defense_evidence: [
        'No direct eyewitness testimony to assault',
        'No contemporaneous disclosure to witnesses',
        'Absence of corroborating physical evidence',
        'No independent verification of assault claims'
      ],
      mia_rebuttal: 'Mia explained that sexual assaults typically occur in private without witnesses. Pointed to circumstantial evidence and pattern of behavior as corroboration.',
      rebuttal_evidence: [
        'Expert testimony on typical assault circumstances',
        'Pattern evidence from other victims',
        'Circumstantial evidence supporting allegations',
        'Behavioral evidence consistent with assault trauma'
      ],
      legal_standard: 'Direct witness corroboration is not required for sexual assault convictions; victim testimony alone can be sufficient',
      credibility_impact: 'neutral',
      evidence_type: 'testimony',
      timeline: '2018'
    },
    
    {
      id: 'social-media-activity',
      allegation: 'Positive Social Media Interactions',
      allegation_details: 'Mia maintained positive social media presence regarding work with Combs, including promotional posts and celebratory content about professional achievements.',
      defense_challenge: 'Defense presents social media posts showing Mia promoting work with Combs and celebrating professional milestones, arguing this contradicts assault allegations.',
      defense_evidence: [
        'Instagram posts celebrating work achievements',
        'Professional photos with Combs at events',
        'Promotional content for Combs-related projects',
        'Public expressions of professional gratitude'
      ],
      mia_rebuttal: 'Mia testified that maintaining positive public image was part of job requirements and survival strategy. Social media presence was managed and did not reflect private reality.',
      rebuttal_evidence: [
        'Evidence of managed public relations requirements',
        'Testimony about pressure to maintain positive image',
        'Expert testimony on public vs. private personas',
        'Documentation of professional image management duties'
      ],
      legal_standard: 'Public behavior and social media activity may not reflect private experiences, especially in employment contexts',
      credibility_impact: 'complex',
      evidence_type: 'digital',
      timeline: '2018-2022'
    },
    
    {
      id: 'power-dynamics',
      allegation: 'Employer-Employee Power Imbalance',
      allegation_details: 'Significant power imbalance between Combs as employer/industry mogul and Mia as employee created environment conducive to abuse and hindered reporting.',
      defense_challenge: 'Defense argues that Mia was empowered employee with agency and ability to leave job, minimizing significance of alleged power imbalance.',
      defense_evidence: [
        'Mia\'s educational background and qualifications',
        'Evidence of decision-making authority in role',
        'Ability to negotiate salary and benefits',
        'Professional network and alternative opportunities'
      ],
      mia_rebuttal: 'Mia emphasized vast wealth, influence, and industry connections of Combs created insurmountable power differential. Leaving meant career destruction and potential industry blacklisting.',
      rebuttal_evidence: [
        'Documentation of Combs\' industry influence',
        'Evidence of career retaliation against former employees',
        'Expert testimony on power dynamics in entertainment industry',
        'Comparison to other high-profile power abuse cases'
      ],
      legal_standard: 'Power imbalances are recognized as significant factors in workplace sexual assault cases',
      credibility_impact: 'strengthened',
      evidence_type: 'documentary',
      timeline: '2017-2022'
    }
  ], [])

  const filteredData = useMemo(() => {
    return comparisonData.filter(entry => {
      const typeMatch = filterType === 'all' || entry.evidence_type === filterType
      const impactMatch = filterImpact === 'all' || entry.credibility_impact === filterImpact
      return typeMatch && impactMatch
    })
  }, [comparisonData, filterType, filterImpact])

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      switch (sortBy) {
        case 'timeline':
          return a.timeline.localeCompare(b.timeline)
        case 'impact':
          const impactOrder = { strengthened: 4, complex: 3, neutral: 2, weakened: 1 }
          return impactOrder[b.credibility_impact] - impactOrder[a.credibility_impact]
        case 'allegation':
          return a.allegation.localeCompare(b.allegation)
        default:
          return 0
      }
    })
  }, [filteredData, sortBy])

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'strengthened': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'weakened': return <XCircle className="w-4 h-4 text-red-400" />
      case 'neutral': return <Clock className="w-4 h-4 text-gray-400" />
      case 'complex': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'strengthened': return 'text-green-400 bg-green-500/20'
      case 'weakened': return 'text-red-400 bg-red-500/20'
      case 'neutral': return 'text-gray-400 bg-gray-500/20'
      case 'complex': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getEvidenceTypeIcon = (type: string) => {
    switch (type) {
      case 'testimony': return <MessageCircle className="w-4 h-4" />
      case 'physical': return <AlertTriangle className="w-4 h-4" />
      case 'documentary': return <Scale className="w-4 h-4" />
      case 'digital': return <MessageCircle className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Allegation', 'Defense Challenge', 'Mia Rebuttal', 'Legal Standard', 'Credibility Impact', 'Evidence Type', 'Timeline'],
      ...comparisonData.map(entry => [
        entry.allegation,
        entry.defense_challenge,
        entry.mia_rebuttal,
        entry.legal_standard,
        entry.credibility_impact,
        entry.evidence_type,
        entry.timeline
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-comparative-analysis.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Claim vs. Counter-Claim Comparative Analysis
          </h3>
          <p className="text-sm text-muted-foreground">
            Defense challenges to Mia's allegations with detailed rebuttals - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Analysis</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Evidence Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Types</option>
            <option value="testimony">Testimony</option>
            <option value="digital">Digital</option>
            <option value="documentary">Documentary</option>
            <option value="physical">Physical</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Credibility Impact:</span>
          <select
            value={filterImpact}
            onChange={(e) => setFilterImpact(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Impacts</option>
            <option value="strengthened">Strengthened</option>
            <option value="complex">Complex</option>
            <option value="neutral">Neutral</option>
            <option value="weakened">Weakened</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="timeline">Timeline</option>
            <option value="impact">Credibility Impact</option>
            <option value="allegation">Allegation</option>
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-semibold text-foreground w-1/4">
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-red-400" />
                  <span>Mia's Allegation</span>
                </div>
              </th>
              <th className="text-left p-3 font-semibold text-foreground w-1/4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-blue-400" />
                  <span>Defense's Challenge</span>
                </div>
              </th>
              <th className="text-left p-3 font-semibold text-foreground w-1/4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Mia's Rebuttal</span>
                </div>
              </th>
              <th className="text-left p-3 font-semibold text-foreground w-1/6">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                  <span>Impact</span>
                </div>
              </th>
              <th className="text-left p-3 font-semibold text-foreground w-1/12">
                <span>Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((entry, index) => (
              <motion.tr
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                <td className="p-3 align-top">
                  <div className="space-y-2">
                    <h5 className="font-medium text-foreground text-sm">{entry.allegation}</h5>
                    <p className="text-xs text-muted-foreground line-clamp-3">{entry.allegation_details}</p>
                    <div className="flex items-center space-x-2">
                      {getEvidenceTypeIcon(entry.evidence_type)}
                      <span className="text-xs text-muted-foreground capitalize">{entry.evidence_type}</span>
                      <span className="text-xs text-accent">{entry.timeline}</span>
                    </div>
                  </div>
                </td>
                
                <td className="p-3 align-top">
                  <div className="space-y-2">
                    <p className="text-sm text-foreground">{entry.defense_challenge}</p>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Evidence:</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {entry.defense_evidence.slice(0, 2).map((evidence, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-blue-400 mr-1">•</span>
                            {evidence}
                          </li>
                        ))}
                        {entry.defense_evidence.length > 2 && (
                          <li className="text-accent">+{entry.defense_evidence.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </td>
                
                <td className="p-3 align-top">
                  <div className="space-y-2">
                    <p className="text-sm text-foreground">{entry.mia_rebuttal}</p>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Evidence:</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {entry.rebuttal_evidence.slice(0, 2).map((evidence, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-green-400 mr-1">•</span>
                            {evidence}
                          </li>
                        ))}
                        {entry.rebuttal_evidence.length > 2 && (
                          <li className="text-accent">+{entry.rebuttal_evidence.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </td>
                
                <td className="p-3 align-top">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getImpactIcon(entry.credibility_impact)}
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getImpactColor(entry.credibility_impact)}`}>
                        {entry.credibility_impact.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{entry.legal_standard}</p>
                  </div>
                </td>
                
                <td className="p-3 align-top">
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="text-xs px-2 py-1 bg-accent/20 hover:bg-accent/30 rounded border border-accent/30 transition-colors"
                  >
                    View Full
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Analysis Panel */}
      {selectedEntry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">{selectedEntry.allegation}</h4>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-red-400 mb-2">Allegation Details</h5>
                <p className="text-sm text-foreground">{selectedEntry.allegation_details}</p>
              </div>
              
              <div>
                <h5 className="font-semibold text-blue-400 mb-2">Defense Challenge</h5>
                <p className="text-sm text-foreground mb-3">{selectedEntry.defense_challenge}</p>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Defense Evidence:</div>
                  <ul className="text-sm text-foreground space-y-1">
                    {selectedEntry.defense_evidence.map((evidence, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        {evidence}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-green-400 mb-2">Mia's Rebuttal</h5>
                <p className="text-sm text-foreground mb-3">{selectedEntry.mia_rebuttal}</p>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Rebuttal Evidence:</div>
                  <ul className="text-sm text-foreground space-y-1">
                    {selectedEntry.rebuttal_evidence.map((evidence, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        {evidence}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-foreground mb-2">Legal Analysis</h5>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Legal Standard: </span>
                    <p className="text-sm text-foreground mt-1">{selectedEntry.legal_standard}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Credibility Impact: </span>
                    <div className="flex items-center space-x-2 mt-1">
                      {getImpactIcon(selectedEntry.credibility_impact)}
                      <span className={`text-sm font-medium px-2 py-1 rounded ${getImpactColor(selectedEntry.credibility_impact)}`}>
                        {selectedEntry.credibility_impact.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Evidence Type: </span>
                    <div className="flex items-center space-x-2 mt-1">
                      {getEvidenceTypeIcon(selectedEntry.evidence_type)}
                      <span className="text-sm text-foreground capitalize">{selectedEntry.evidence_type}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Timeline: </span>
                    <span className="text-sm text-accent">{selectedEntry.timeline}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{comparisonData.length}</div>
          <div className="text-sm text-muted-foreground">Total Issues</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {comparisonData.filter(e => e.credibility_impact === 'strengthened').length}
          </div>
          <div className="text-sm text-muted-foreground">Strengthened</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {comparisonData.filter(e => e.credibility_impact === 'complex').length}
          </div>
          <div className="text-sm text-muted-foreground">Complex</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">
            {comparisonData.filter(e => e.credibility_impact === 'neutral').length}
          </div>
          <div className="text-sm text-muted-foreground">Neutral</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {comparisonData.filter(e => e.credibility_impact === 'weakened').length}
          </div>
          <div className="text-sm text-muted-foreground">Weakened</div>
        </div>
      </div>
    </div>
  )
}