'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Scale, Users, Eye, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface InterpretationAnalysis {
  id: string
  evidence_item: string
  prosecution_narrative: string
  defense_narrative: string
  prosecution_strength: number
  defense_strength: number
  expert_opinions: ExpertOpinion[]
  credibility_factors: CredibilityFactor[]
  legal_precedents: string[]
  jury_considerations: string[]
}

interface ExpertOpinion {
  expert: string
  specialty: string
  opinion: string
  supports: 'prosecution' | 'defense' | 'neutral'
  credibility_score: number
}

interface CredibilityFactor {
  factor: string
  impact: 'strengthens' | 'weakens' | 'neutral'
  side: 'prosecution' | 'defense'
  description: string
  weight: number
}

interface InterpretationAnalysisProps {
  trialDay: TrialDay
}

export default function InterpretationAnalysisVisualization({ trialDay }: InterpretationAnalysisProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedAnalysis, setSelectedAnalysis] = useState<InterpretationAnalysis | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview')
  const [filterStrength, setFilterStrength] = useState<'all' | 'contested' | 'one-sided'>('all')

  const interpretationData: InterpretationAnalysis[] = useMemo(() => [
    {
      id: 'hotel-video-interpretation',
      evidence_item: 'Hotel Security Footage (March 2016)',
      prosecution_narrative: 'Clear evidence of violent assault showing defendant physically attacking victim in hotel corridor, demonstrating pattern of domestic violence and control.',
      defense_narrative: 'Video shows relationship dispute between consenting adults, taken out of context without showing preceding events or victim\'s later reconciliation.',
      prosecution_strength: 92,
      defense_strength: 35,
      expert_opinions: [
        {
          expert: 'Dr. Sarah Mitchell',
          specialty: 'Domestic Violence Expert',
          opinion: 'Video demonstrates classic pattern of escalating physical violence consistent with coercive control dynamics.',
          supports: 'prosecution',
          credibility_score: 94
        },
        {
          expert: 'Prof. Michael Chen',
          specialty: 'Video Analysis Expert',
          opinion: 'Video quality and angles provide clear evidence of physical assault, no ambiguity in the actions shown.',
          supports: 'prosecution',
          credibility_score: 91
        }
      ],
      credibility_factors: [
        {
          factor: 'Video Quality',
          impact: 'strengthens',
          side: 'prosecution',
          description: 'High-definition footage with multiple camera angles',
          weight: 85
        },
        {
          factor: 'Victim\'s Continued Relationship',
          impact: 'weakens',
          side: 'prosecution',
          description: 'Victim remained in relationship after incident',
          weight: 45
        },
        {
          factor: 'No Audio Recording',
          impact: 'strengthens',
          side: 'defense',
          description: 'Cannot hear conversation or context preceding incident',
          weight: 30
        }
      ],
      legal_precedents: [
        'United States v. Dominguez (2004) - Video evidence admissibility',
        'Crawford v. Washington (2004) - Confrontation clause considerations'
      ],
      jury_considerations: [
        'Impact of viewing graphic violence on jury perception',
        'Ability to assess context without audio',
        'Victim behavior patterns in domestic violence cases'
      ]
    },
    {
      id: 'financial-payments-interpretation',
      evidence_item: 'Large Financial Transfers to Alleged Victims',
      prosecution_narrative: 'Pattern of payments demonstrates consciousness of guilt and systematic effort to silence victims through financial coercion and hush money.',
      defense_narrative: 'Payments were legitimate business expenses, gifts to friends, or settlements to avoid frivolous litigation, not admissions of wrongdoing.',
      prosecution_strength: 78,
      defense_strength: 68,
      expert_opinions: [
        {
          expert: 'Agent Jennifer Roberts',
          specialty: 'Financial Crimes Investigation',
          opinion: 'Payment patterns are consistent with hush money schemes, timing correlates with victim complaints.',
          supports: 'prosecution',
          credibility_score: 87
        },
        {
          expert: 'CPA David Martinez',
          specialty: 'Celebrity Financial Management',
          opinion: 'Large payments to associates are common in entertainment industry, not necessarily indicative of wrongdoing.',
          supports: 'defense',
          credibility_score: 72
        }
      ],
      credibility_factors: [
        {
          factor: 'Payment Timing',
          impact: 'strengthens',
          side: 'prosecution',
          description: 'Payments made shortly after alleged incidents or complaints',
          weight: 80
        },
        {
          factor: 'Business Relationship',
          impact: 'strengthens',
          side: 'defense',
          description: 'Some recipients had legitimate business relationships',
          weight: 55
        },
        {
          factor: 'NDAs Attached',
          impact: 'strengthens',
          side: 'prosecution',
          description: 'Non-disclosure agreements accompanying payments',
          weight: 75
        }
      ],
      legal_precedents: [
        'United States v. Edwards (2011) - Hush money as campaign finance violation',
        'FEC v. National Right to Work Committee (1982) - Payment characterization'
      ],
      jury_considerations: [
        'Understanding of entertainment industry business practices',
        'Interpretation of silence agreements',
        'Significance of payment timing relative to complaints'
      ]
    },
    {
      id: 'substance-use-interpretation',
      evidence_item: 'Drug and Alcohol Evidence in Sexual Encounters',
      prosecution_narrative: 'Systematic use of substances to incapacitate victims and facilitate sexual assault, part of calculated pattern to overcome resistance and impair consent.',
      defense_narrative: 'Consensual adult recreational drug use during parties and intimate encounters, common in entertainment industry social settings.',
      prosecution_strength: 85,
      defense_strength: 42,
      expert_opinions: [
        {
          expert: 'Dr. Patricia Williams',
          specialty: 'Sexual Assault Expert',
          opinion: 'Use of substances to facilitate sexual assault is well-documented predatory behavior, consistent with coercive control.',
          supports: 'prosecution',
          credibility_score: 92
        },
        {
          expert: 'Dr. Robert Taylor',
          specialty: 'Substance Abuse Counselor',
          opinion: 'Context matters - substance use in social settings differs from predatory facilitation of assault.',
          supports: 'neutral',
          credibility_score: 79
        }
      ],
      credibility_factors: [
        {
          factor: 'Victim Testimony Consistency',
          impact: 'strengthens',
          side: 'prosecution',
          description: 'Multiple victims report similar substance-facilitated assault patterns',
          weight: 88
        },
        {
          factor: 'Social Context',
          impact: 'strengthens',
          side: 'defense',
          description: 'Substance use occurred in party/social settings',
          weight: 35
        },
        {
          factor: 'Medical Evidence',
          impact: 'strengthens',
          side: 'prosecution',
          description: 'Toxicology evidence supports victim accounts',
          weight: 82
        }
      ],
      legal_precedents: [
        'Pennsylvania v. Muniz (1990) - Intoxication and consent',
        'Commonwealth v. Burke (2019) - Drug-facilitated sexual assault'
      ],
      jury_considerations: [
        'Understanding of consent capacity while intoxicated',
        'Distinguishing between recreational use and predatory facilitation',
        'Impact of substance use on memory and testimony credibility'
      ]
    },
    {
      id: 'witness-testimony-interpretation',
      evidence_item: 'Multiple Corroborating Witness Testimonies',
      prosecution_narrative: 'Consistent pattern of testimony from multiple independent witnesses establishes credible evidence of systematic criminal behavior over extended timeframe.',
      defense_narrative: 'Witnesses have financial incentives to fabricate testimony, coordinated their stories, and are seeking monetary compensation through civil litigation.',
      prosecution_strength: 89,
      defense_strength: 58,
      expert_opinions: [
        {
          expert: 'Dr. Lisa Anderson',
          specialty: 'Witness Credibility Expert',
          opinion: 'Consistent details across multiple witnesses without coordination opportunity suggests truthful testimony.',
          supports: 'prosecution',
          credibility_score: 86
        },
        {
          expert: 'Prof. James Wilson',
          specialty: 'False Memory Research',
          opinion: 'Group dynamics and media coverage can influence memory reconstruction and testimony consistency.',
          supports: 'defense',
          credibility_score: 73
        }
      ],
      credibility_factors: [
        {
          factor: 'Testimony Consistency',
          impact: 'strengthens',
          side: 'prosecution',
          description: 'Similar details across independent witness accounts',
          weight: 84
        },
        {
          factor: 'Financial Motivation',
          impact: 'weakens',
          side: 'prosecution',
          description: 'Some witnesses involved in civil litigation seeking damages',
          weight: 62
        },
        {
          factor: 'Delayed Reporting',
          impact: 'strengthens',
          side: 'defense',
          description: 'Years passed between incidents and testimony',
          weight: 48
        }
      ],
      legal_precedents: [
        'Crawford v. Washington (2004) - Confrontation clause and hearsay',
        'Ohio v. Roberts (1980) - Reliability of witness testimony'
      ],
      jury_considerations: [
        'Weighing consistency against potential coordination',
        'Understanding delayed reporting in abuse cases',
        'Assessing financial motivations versus truth-telling'
      ]
    }
  ], [])

  const filteredData = useMemo(() => {
    switch (filterStrength) {
      case 'contested':
        return interpretationData.filter(item => 
          Math.abs(item.prosecution_strength - item.defense_strength) < 30
        )
      case 'one-sided':
        return interpretationData.filter(item =>
          Math.abs(item.prosecution_strength - item.defense_strength) >= 50
        )
      default:
        return interpretationData
    }
  }, [interpretationData, filterStrength])

  const getStrengthColor = (strength: number) => {
    if (strength >= 85) return 'bg-green-500'
    if (strength >= 70) return 'bg-yellow-500'
    if (strength >= 50) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'strengthens': return 'text-green-400'
      case 'weakens': return 'text-red-400'
      case 'neutral': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Evidence Item', 'Prosecution Strength', 'Defense Strength', 'Expert Opinions', 'Credibility Factors', 'Legal Precedents'],
      ...interpretationData.map(item => [
        item.evidence_item,
        item.prosecution_strength.toString(),
        item.defense_strength.toString(),
        item.expert_opinions.length.toString(),
        item.credibility_factors.length.toString(),
        item.legal_precedents.join('; ')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-interpretation-analysis.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Evidence Interpretation Analysis
          </h3>
          <p className="text-sm text-muted-foreground">
            Comparative analysis of prosecution vs defense evidence interpretation - Day {trialDay.trialDayNumber}
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
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[
              { value: 'overview', label: 'Overview', icon: BarChart3 },
              { value: 'detailed', label: 'Detailed', icon: Eye },
              { value: 'comparison', label: 'Comparison', icon: Scale }
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value as any)}
                className={`px-3 py-1 text-sm flex items-center space-x-1 transition-colors ${
                  viewMode === mode.value
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background hover:bg-muted text-muted-foreground'
                }`}
              >
                <mode.icon className="w-3 h-3" />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <select
            value={filterStrength}
            onChange={(e) => setFilterStrength(e.target.value as any)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Evidence</option>
            <option value="contested">Highly Contested</option>
            <option value="one-sided">Strong Advantage</option>
          </select>
        </div>
      </div>

      {/* Evidence Interpretation Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredData.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setSelectedAnalysis(selectedAnalysis?.id === item.id ? null : item)}
            whileHover={reducedMotion ? {} : { scale: 1.01 }}
            className={`text-left glass-card p-6 cursor-pointer transition-all ${
              selectedAnalysis?.id === item.id ? 'ring-2 ring-accent' : ''
            }`}
          >
            <h4 className="font-semibold text-foreground mb-3">{item.evidence_item}</h4>
            
            {/* Strength Comparison */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-red-400 font-medium">Prosecution</span>
                  <span className="text-sm font-bold">{item.prosecution_strength}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getStrengthColor(item.prosecution_strength)}`}
                    style={{ width: `${item.prosecution_strength}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-blue-400 font-medium">Defense</span>
                  <span className="text-sm font-bold">{item.defense_strength}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getStrengthColor(item.defense_strength)}`}
                    style={{ width: `${item.defense_strength}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <span>{item.expert_opinions.length} Expert{item.expert_opinions.length !== 1 ? 's' : ''}</span>
              <span>{item.credibility_factors.length} Factor{item.credibility_factors.length !== 1 ? 's' : ''}</span>
              <span>{item.legal_precedents.length} Precedent{item.legal_precedents.length !== 1 ? 's' : ''}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Detailed Analysis */}
      {selectedAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
          className="glass-card p-6"
        >
          <h4 className="text-lg font-semibold text-foreground mb-4">{selectedAnalysis.evidence_item}</h4>
          
          {/* Narrative Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border-l-4 border-l-red-500 pl-4">
              <h5 className="font-semibold text-red-400 mb-2">Prosecution Narrative</h5>
              <p className="text-sm text-foreground">{selectedAnalysis.prosecution_narrative}</p>
            </div>
            
            <div className="border-l-4 border-l-blue-500 pl-4">
              <h5 className="font-semibold text-blue-400 mb-2">Defense Counter-Narrative</h5>
              <p className="text-sm text-foreground">{selectedAnalysis.defense_narrative}</p>
            </div>
          </div>

          {/* Expert Opinions */}
          {selectedAnalysis.expert_opinions.length > 0 && (
            <div className="mb-6">
              <h5 className="font-semibold text-foreground mb-3">Expert Opinions</h5>
              <div className="space-y-3">
                {selectedAnalysis.expert_opinions.map((expert, index) => (
                  <div key={index} className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{expert.expert}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">{expert.specialty}</span>
                        <span className="text-xs font-bold text-accent">{expert.credibility_score}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{expert.opinion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credibility Factors */}
          <div className="mb-6">
            <h5 className="font-semibold text-foreground mb-3">Credibility Factors</h5>
            <div className="space-y-2">
              {selectedAnalysis.credibility_factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center space-x-3">
                    <span className={`font-medium ${factor.side === 'prosecution' ? 'text-red-400' : 'text-blue-400'}`}>
                      {factor.factor}
                    </span>
                    <span className={`text-sm ${getImpactColor(factor.impact)}`}>
                      {factor.impact}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Weight:</span>
                    <span className="text-sm font-bold text-accent">{factor.weight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Precedents and Jury Considerations */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-foreground mb-2">Legal Precedents</h5>
              <ul className="space-y-1">
                {selectedAnalysis.legal_precedents.map((precedent, index) => (
                  <li key={index} className="text-sm text-foreground flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    {precedent}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-foreground mb-2">Jury Considerations</h5>
              <ul className="space-y-1">
                {selectedAnalysis.jury_considerations.map((consideration, index) => (
                  <li key={index} className="text-sm text-foreground flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {consideration}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{interpretationData.length}</div>
          <div className="text-sm text-muted-foreground">Evidence Items</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {Math.round(interpretationData.reduce((sum, item) => sum + item.prosecution_strength, 0) / interpretationData.length)}%
          </div>
          <div className="text-sm text-muted-foreground">Avg Prosecution</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {Math.round(interpretationData.reduce((sum, item) => sum + item.defense_strength, 0) / interpretationData.length)}%
          </div>
          <div className="text-sm text-muted-foreground">Avg Defense</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {interpretationData.filter(item => Math.abs(item.prosecution_strength - item.defense_strength) < 30).length}
          </div>
          <div className="text-sm text-muted-foreground">Contested</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {interpretationData.reduce((sum, item) => sum + item.expert_opinions.length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Expert Opinions</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {interpretationData.reduce((sum, item) => sum + item.credibility_factors.length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Credibility Factors</div>
        </div>
      </div>
    </div>
  )
}