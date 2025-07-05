'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Brain, TrendingUp, AlertTriangle, Users, Target, Shield } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface PsychologicalPattern {
  id: string
  category: 'coercive_control' | 'trauma_response' | 'manipulation' | 'power_dynamics' | 'isolation' | 'gaslighting'
  pattern_name: string
  description: string
  expert_analysis: string
  victim_behaviors: string[]
  perpetrator_behaviors: string[]
  psychological_impact: string
  prevalence_score: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  evidence_support: string[]
  clinical_markers: string[]
}

interface PsychologicalAnalysisProps {
  trialDay: TrialDay
}

export default function PsychologicalAnalysisVisualization({ trialDay }: PsychologicalAnalysisProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedPattern, setSelectedPattern] = useState<PsychologicalPattern | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'patterns' | 'timeline' | 'impact'>('patterns')

  const psychologicalData: PsychologicalPattern[] = useMemo(() => [
    {
      id: 'coercive-control-1',
      category: 'coercive_control',
      pattern_name: 'Financial Dependency and Control',
      description: 'Systematic creation of financial dependency to maintain control over victim behavior',
      expert_analysis: 'Dr. Sarah Mitchell testified that the pattern of providing financial support while threatening withdrawal represents classic coercive control tactics designed to create psychological dependency.',
      victim_behaviors: [
        'Accepting financial support despite discomfort',
        'Fear of economic instability if relationship ends',
        'Gradual isolation from independent income sources',
        'Compliance with demands to maintain financial security'
      ],
      perpetrator_behaviors: [
        'Providing lavish gifts and financial support',
        'Threatening to cut off financial assistance',
        'Creating dependency through lifestyle inflation',
        'Using money as leverage for compliance'
      ],
      psychological_impact: 'Creates learned helplessness and reduces victim\'s sense of agency and independence',
      prevalence_score: 85,
      severity: 'critical',
      evidence_support: [
        'Bank records showing pattern of large payments',
        'Testimony about threats to withdraw support',
        'Evidence of victim\'s financial dependency',
        'Communications about money tied to behavior'
      ],
      clinical_markers: [
        'Anxiety about financial security',
        'Loss of autonomy in decision-making',
        'Hypervigilance about partner\'s mood',
        'Internalized sense of obligation'
      ]
    },
    {
      id: 'trauma-response-1',
      category: 'trauma_response',
      pattern_name: 'Complex Post-Traumatic Stress Response',
      description: 'Psychological responses consistent with prolonged exposure to traumatic stressors',
      expert_analysis: 'Dr. Jennifer Roberts identified symptoms consistent with Complex PTSD, including dissociation, emotional dysregulation, and disrupted attachment patterns typical of prolonged abuse.',
      victim_behaviors: [
        'Dissociative episodes during stressful situations',
        'Hypervigilance and exaggerated startle response',
        'Emotional numbing and detachment',
        'Difficulty trusting others and forming relationships'
      ],
      perpetrator_behaviors: [
        'Unpredictable patterns of violence and affection',
        'Creating chronic state of fear and uncertainty',
        'Normalizing traumatic experiences',
        'Alternating between threats and apologies'
      ],
      psychological_impact: 'Long-term disruption of emotional regulation, self-concept, and interpersonal functioning',
      prevalence_score: 92,
      severity: 'critical',
      evidence_support: [
        'Medical records documenting PTSD diagnosis',
        'Testimony about dissociative episodes',
        'Evidence of ongoing psychological treatment',
        'Witness accounts of behavioral changes'
      ],
      clinical_markers: [
        'Intrusive thoughts and flashbacks',
        'Sleep disturbances and nightmares',
        'Emotional dysregulation',
        'Somatic symptoms without medical cause'
      ]
    },
    {
      id: 'manipulation-1',
      category: 'manipulation',
      pattern_name: 'Love Bombing and Intermittent Reinforcement',
      description: 'Alternating between excessive affection and withdrawal to maintain psychological control',
      expert_analysis: 'Dr. Michael Chen explained that the pattern of intense positive attention followed by withdrawal creates a trauma bond and psychological addiction to the relationship.',
      victim_behaviors: [
        'Confusion about relationship dynamics',
        'Grateful for minimal positive attention',
        'Making excuses for partner\'s negative behavior',
        'Constantly seeking validation and approval'
      ],
      perpetrator_behaviors: [
        'Overwhelming victim with gifts and attention initially',
        'Gradually withdrawing affection and creating uncertainty',
        'Providing intermittent positive reinforcement',
        'Creating cycles of tension and relief'
      ],
      psychological_impact: 'Creates psychological addiction to the relationship and tolerance for increasingly poor treatment',
      prevalence_score: 78,
      severity: 'high',
      evidence_support: [
        'Text messages showing dramatic mood swings',
        'Testimony about cycles of abuse and reconciliation',
        'Evidence of expensive gifts followed by punishment',
        'Witness accounts of relationship patterns'
      ],
      clinical_markers: [
        'Cognitive dissonance about relationship',
        'Trauma bonding symptoms',
        'Difficulty making decisions independently',
        'Fear of abandonment'
      ]
    },
    {
      id: 'isolation-1',
      category: 'isolation',
      pattern_name: 'Social and Professional Isolation',
      description: 'Systematic separation of victim from support networks and independent identity',
      expert_analysis: 'Dr. Lisa Anderson testified that the gradual isolation from family, friends, and professional opportunities is a hallmark of abusive relationships designed to increase dependency.',
      victim_behaviors: [
        'Withdrawing from family and friends',
        'Declining professional opportunities',
        'Seeking permission for social activities',
        'Feeling guilty about outside relationships'
      ],
      perpetrator_behaviors: [
        'Criticizing victim\'s friends and family',
        'Creating conflicts with support network',
        'Monopolizing victim\'s time and attention',
        'Offering alternatives that increase dependency'
      ],
      psychological_impact: 'Reduces external validation and support, increasing reliance on abuser for emotional needs',
      prevalence_score: 71,
      severity: 'high',
      evidence_support: [
        'Testimony about lost friendships and opportunities',
        'Evidence of controlled social interactions',
        'Communications monitoring and restrictions',
        'Witness accounts of isolation tactics'
      ],
      clinical_markers: [
        'Social anxiety and withdrawal',
        'Loss of personal identity',
        'Difficulty maintaining relationships',
        'Increased dependency on partner'
      ]
    },
    {
      id: 'gaslighting-1',
      category: 'gaslighting',
      pattern_name: 'Reality Distortion and Memory Manipulation',
      description: 'Systematic undermining of victim\'s perception of reality and memory of events',
      expert_analysis: 'Dr. Patricia Williams identified classic gaslighting techniques designed to make victims question their own memory, perception, and sanity.',
      victim_behaviors: [
        'Questioning own memory and perception',
        'Apologizing for things that aren\'t their fault',
        'Feeling confused about reality of events',
        'Seeking constant validation from others'
      ],
      perpetrator_behaviors: [
        'Denying events that clearly happened',
        'Minimizing severity of abusive incidents',
        'Claiming victim is \'crazy\' or \'overreacting\'',
        'Rewriting history of relationship events'
      ],
      psychological_impact: 'Erodes self-trust and confidence in own perceptions, creating psychological dependency',
      prevalence_score: 83,
      severity: 'high',
      evidence_support: [
        'Contradictory statements about same events',
        'Evidence of victim\'s confusion in communications',
        'Testimony about memory and perception issues',
        'Documentation of reality distortion attempts'
      ],
      clinical_markers: [
        'Self-doubt and uncertainty',
        'Difficulty trusting own judgment',
        'Memory confusion and gaps',
        'Seeking external validation constantly'
      ]
    },
    {
      id: 'power-dynamics-1',
      category: 'power_dynamics',
      pattern_name: 'Celebrity Status and Power Imbalance',
      description: 'Exploitation of fame, wealth, and industry connections to maintain control',
      expert_analysis: 'Dr. Robert Taylor explained how celebrity status and industry power create unique vulnerabilities and barriers to seeking help or leaving the relationship.',
      victim_behaviors: [
        'Fear of public exposure and humiliation',
        'Concern about career and professional impact',
        'Feeling powerless against wealth and connections',
        'Accepting treatment due to perceived status difference'
      ],
      perpetrator_behaviors: [
        'Using fame and wealth as intimidation tools',
        'Threatening career and reputation damage',
        'Leveraging industry connections and influence',
        'Creating sense of victim\'s expendability'
      ],
      psychological_impact: 'Amplifies feelings of powerlessness and creates additional barriers to seeking help',
      prevalence_score: 69,
      severity: 'medium',
      evidence_support: [
        'Testimony about career threats and implications',
        'Evidence of industry power and influence',
        'Communications about reputation and exposure',
        'Witness accounts of power differential'
      ],
      clinical_markers: [
        'Fear of public scrutiny',
        'Internalized powerlessness',
        'Career-related anxiety',
        'Shame about perceived complicity'
      ]
    }
  ], [])

  const filteredData = useMemo(() => {
    return psychologicalData.filter(pattern => 
      filterCategory === 'all' || pattern.category === filterCategory
    )
  }, [psychologicalData, filterCategory])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coercive_control': return <Target className="w-4 h-4" />
      case 'trauma_response': return <AlertTriangle className="w-4 h-4" />
      case 'manipulation': return <Brain className="w-4 h-4" />
      case 'power_dynamics': return <TrendingUp className="w-4 h-4" />
      case 'isolation': return <Users className="w-4 h-4" />
      case 'gaslighting': return <Shield className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'coercive_control': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'trauma_response': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'manipulation': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'power_dynamics': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'isolation': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'gaslighting': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Pattern', 'Category', 'Prevalence Score', 'Severity', 'Expert Analysis', 'Psychological Impact'],
      ...psychologicalData.map(pattern => [
        pattern.pattern_name,
        pattern.category,
        pattern.prevalence_score.toString(),
        pattern.severity,
        pattern.expert_analysis,
        pattern.psychological_impact
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-psychological-analysis.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Psychological Analysis Chart
          </h3>
          <p className="text-sm text-muted-foreground">
            Expert testimony on coercive control tactics and trauma responses - Day {trialDay.trialDayNumber}
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
          <span className="text-sm text-muted-foreground">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Categories</option>
            <option value="coercive_control">Coercive Control</option>
            <option value="trauma_response">Trauma Response</option>
            <option value="manipulation">Manipulation</option>
            <option value="power_dynamics">Power Dynamics</option>
            <option value="isolation">Isolation</option>
            <option value="gaslighting">Gaslighting</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[
              { value: 'patterns', label: 'Patterns' },
              { value: 'timeline', label: 'Timeline' },
              { value: 'impact', label: 'Impact' }
            ].map((view) => (
              <button
                key={view.value}
                onClick={() => setViewMode(view.value as any)}
                className={`px-3 py-1 text-sm transition-colors ${
                  viewMode === view.value
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background hover:bg-muted text-muted-foreground'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prevalence Chart */}
      <div className="glass-card p-6">
        <h4 className="font-semibold text-foreground mb-4">Pattern Prevalence Analysis</h4>
        <div className="space-y-4">
          {filteredData.map((pattern) => (
            <motion.button
              key={pattern.id}
              onClick={() => setSelectedPattern(pattern)}
              whileHover={reducedMotion ? {} : { scale: 1.01 }}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedPattern?.id === pattern.id 
                  ? 'border-accent bg-accent/10' 
                  : 'border-border bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${getCategoryColor(pattern.category)}`}>
                    {getCategoryIcon(pattern.category)}
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground">{pattern.pattern_name}</h5>
                    <p className="text-sm text-muted-foreground capitalize">
                      {pattern.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(pattern.severity)}`}>
                    {pattern.severity.toUpperCase()}
                  </span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-accent">{pattern.prevalence_score}%</div>
                    <div className="text-xs text-muted-foreground">Prevalence</div>
                  </div>
                </div>
              </div>
              
              {/* Prevalence Bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <motion.div
                  className="bg-accent rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${pattern.prevalence_score}%` }}
                  transition={{ duration: reducedMotion ? 0.01 : 1, delay: 0.1 }}
                />
              </div>
              
              <p className="text-sm text-foreground">{pattern.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      {selectedPattern && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-start space-x-4 mb-6">
            <div className={`p-3 rounded-lg ${getCategoryColor(selectedPattern.category)}`}>
              {getCategoryIcon(selectedPattern.category)}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground mb-1">{selectedPattern.pattern_name}</h4>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="capitalize">{selectedPattern.category.replace('_', ' ')}</span>
                <span className={`px-2 py-1 rounded font-medium ${getSeverityColor(selectedPattern.severity)}`}>
                  {selectedPattern.severity.toUpperCase()} SEVERITY
                </span>
                <span className="text-accent font-bold">{selectedPattern.prevalence_score}% Prevalence</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Expert Analysis */}
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-foreground mb-2">Expert Analysis</h5>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                  {selectedPattern.expert_analysis}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Psychological Impact</h5>
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                  {selectedPattern.psychological_impact}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-foreground mb-2">Clinical Markers</h5>
                <ul className="space-y-1">
                  {selectedPattern.clinical_markers.map((marker, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      {marker}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Behavioral Patterns */}
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-red-400 mb-2">Victim Behaviors</h5>
                <ul className="space-y-1">
                  {selectedPattern.victim_behaviors.map((behavior, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      {behavior}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-orange-400 mb-2">Perpetrator Behaviors</h5>
                <ul className="space-y-1">
                  {selectedPattern.perpetrator_behaviors.map((behavior, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start">
                      <span className="text-orange-400 mr-2">•</span>
                      {behavior}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-green-400 mb-2">Evidence Support</h5>
                <ul className="space-y-1">
                  {selectedPattern.evidence_support.map((evidence, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      {evidence}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{psychologicalData.length}</div>
          <div className="text-sm text-muted-foreground">Total Patterns</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {psychologicalData.filter(p => p.severity === 'critical').length}
          </div>
          <div className="text-sm text-muted-foreground">Critical</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {psychologicalData.filter(p => p.severity === 'high').length}
          </div>
          <div className="text-sm text-muted-foreground">High Severity</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">
            {Math.round(psychologicalData.reduce((sum, p) => sum + p.prevalence_score, 0) / psychologicalData.length)}%
          </div>
          <div className="text-sm text-muted-foreground">Avg Prevalence</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {new Set(psychologicalData.map(p => p.category)).size}
          </div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">6</div>
          <div className="text-sm text-muted-foreground">Expert Witnesses</div>
        </div>
      </div>
    </div>
  )
}