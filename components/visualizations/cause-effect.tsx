'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, GitBranch, ArrowRight, AlertTriangle, Target, Users, DollarSign } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface CauseCategory {
  id: string
  category: 'people' | 'methods' | 'materials' | 'machines' | 'environment' | 'management'
  label: string
  causes: CauseItem[]
  color: string
}

interface CauseItem {
  id: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  evidence: string[]
  contributing_factors: string[]
}

interface CauseEffectProps {
  trialDay: TrialDay
}

export default function CauseEffectVisualization({ trialDay }: CauseEffectProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedCategory, setSelectedCategory] = useState<CauseCategory | null>(null)
  const [selectedCause, setSelectedCause] = useState<CauseItem | null>(null)

  const problemStatement = useMemo(() => {
    return {
      title: "Pattern of Alleged Criminal Behavior",
      description: "Systematic analysis of contributing factors leading to alleged racketeering, sex trafficking, and abuse",
      impact: "Multiple victims across extended timeframe (2008-2024)"
    }
  }, [])

  const causeCategories: CauseCategory[] = useMemo(() => [
    {
      id: 'people',
      category: 'people',
      label: 'People & Relationships',
      color: 'text-red-400 bg-red-500/20 border-red-500/30',
      causes: [
        {
          id: 'power-dynamics',
          description: 'Celebrity status and industry power imbalance',
          severity: 'critical',
          evidence: [
            'Testimony about fear of career consequences',
            'Evidence of industry influence and connections',
            'Witness accounts of intimidation tactics'
          ],
          contributing_factors: [
            'Significant wealth and status differential',
            'Control over career opportunities',
            'Industry network of enablers'
          ]
        },
        {
          id: 'enablers',
          description: 'Network of associates facilitating alleged crimes',
          severity: 'high',
          evidence: [
            'Employee testimony about participation',
            'Financial records of payments to associates',
            'Communication records showing coordination'
          ],
          contributing_factors: [
            'Financial incentives for loyalty',
            'Fear of retaliation if non-compliant',
            'Gradual normalization of criminal behavior'
          ]
        },
        {
          id: 'victim-isolation',
          description: 'Systematic isolation of victims from support networks',
          severity: 'high',
          evidence: [
            'Testimony about controlled communications',
            'Evidence of restricted movement and access',
            'Witness accounts of separated victims from families'
          ],
          contributing_factors: [
            'Physical and emotional dependency creation',
            'Financial control and manipulation',
            'Threats against family and friends'
          ]
        }
      ]
    },
    {
      id: 'methods',
      category: 'methods',
      label: 'Methods & Tactics',
      color: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
      causes: [
        {
          id: 'coercive-control',
          description: 'Psychological manipulation and coercive control tactics',
          severity: 'critical',
          evidence: [
            'Expert testimony on coercive control patterns',
            'Documentation of psychological manipulation',
            'Evidence of gaslighting and reality distortion'
          ],
          contributing_factors: [
            'Gradual escalation of control measures',
            'Love bombing followed by withdrawal',
            'Isolation from external validation sources'
          ]
        },
        {
          id: 'financial-coercion',
          description: 'Use of financial dependency as control mechanism',
          severity: 'high',
          evidence: [
            'Bank records showing payment patterns',
            'Testimony about financial threats',
            'Evidence of controlled access to resources'
          ],
          contributing_factors: [
            'Creation of lifestyle dependency',
            'Threats to withdraw financial support',
            'Control over victim earnings and assets'
          ]
        },
        {
          id: 'substance-coercion',
          description: 'Use of drugs and alcohol to facilitate crimes',
          severity: 'high',
          evidence: [
            'Testimony about forced substance use',
            'Medical evidence of drug effects',
            'Witness accounts of impaired consent situations'
          ],
          contributing_factors: [
            'Lowered inhibitions and resistance',
            'Memory impairment and confusion',
            'Physical dependency creation'
          ]
        }
      ]
    },
    {
      id: 'materials',
      category: 'materials',
      label: 'Materials & Resources',
      color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      causes: [
        {
          id: 'recording-equipment',
          description: 'Use of recording devices for blackmail and control',
          severity: 'critical',
          evidence: [
            'Testimony about non-consensual recording',
            'Digital evidence of video and audio files',
            'Witness accounts of recording without permission'
          ],
          contributing_factors: [
            'Hidden surveillance equipment',
            'Threats to release compromising material',
            'Use of recordings for future manipulation'
          ]
        },
        {
          id: 'controlled-substances',
          description: 'Systematic provision of drugs and alcohol',
          severity: 'high',
          evidence: [
            'Inventory of substances found during raids',
            'Testimony about forced consumption',
            'Medical records showing substance effects'
          ],
          contributing_factors: [
            'Easy access to various substances',
            'Pressure to participate in substance use',
            'Use of substances to lower resistance'
          ]
        },
        {
          id: 'communication-tools',
          description: 'Controlled communication channels and monitoring',
          severity: 'medium',
          evidence: [
            'Evidence of phone and internet monitoring',
            'Testimony about communication restrictions',
            'Digital forensics showing surveillance software'
          ],
          contributing_factors: [
            'Isolation from external contacts',
            'Monitoring of all communications',
            'Controlled access to communication devices'
          ]
        }
      ]
    },
    {
      id: 'environment',
      category: 'environment',
      label: 'Environment & Setting',
      color: 'text-green-400 bg-green-500/20 border-green-500/30',
      causes: [
        {
          id: 'controlled-spaces',
          description: 'Use of private venues to control environment',
          severity: 'high',
          evidence: [
            'Testimony about events at private residences',
            'Evidence of controlled access to locations',
            'Witness accounts of isolated venues'
          ],
          contributing_factors: [
            'Private security controlling access',
            'Remote locations limiting escape options',
            'Familiar environment providing perpetrator advantage'
          ]
        },
        {
          id: 'party-atmosphere',
          description: 'Use of party and entertainment settings as cover',
          severity: 'medium',
          evidence: [
            'Testimony about parties used as recruitment venues',
            'Evidence of entertainment industry connections',
            'Witness accounts of normalized inappropriate behavior'
          ],
          contributing_factors: [
            'Normalization of extreme behavior in party context',
            'Alcohol and drug availability in social settings',
            'Peer pressure and social conformity'
          ]
        }
      ]
    },
    {
      id: 'management',
      category: 'management',
      label: 'Management & Organization',
      color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      causes: [
        {
          id: 'enterprise-structure',
          description: 'Criminal enterprise organizational structure',
          severity: 'critical',
          evidence: [
            'RICO charges demonstrating organized structure',
            'Evidence of coordinated criminal activities',
            'Testimony about hierarchical organization'
          ],
          contributing_factors: [
            'Clear chain of command for criminal activities',
            'Systematic approach to victim recruitment',
            'Coordinated cover-up and evidence destruction'
          ]
        },
        {
          id: 'legal-evasion',
          description: 'Systematic efforts to evade legal consequences',
          severity: 'high',
          evidence: [
            'Evidence of witness intimidation',
            'Testimony about evidence destruction',
            'Financial records showing hush payments'
          ],
          contributing_factors: [
            'Use of legal teams to intimidate victims',
            'Financial settlements to avoid prosecution',
            'Destruction of incriminating evidence'
          ]
        }
      ]
    },
    {
      id: 'machines',
      category: 'machines',
      label: 'Technology & Systems',
      color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      causes: [
        {
          id: 'digital-infrastructure',
          description: 'Technology used for surveillance and control',
          severity: 'medium',
          evidence: [
            'Digital forensics evidence of monitoring software',
            'Testimony about tracked communications',
            'Evidence of location tracking and surveillance'
          ],
          contributing_factors: [
            'Advanced surveillance capabilities',
            'Digital monitoring of victim activities',
            'Use of technology to maintain control'
          ]
        },
        {
          id: 'financial-systems',
          description: 'Complex financial structures for money movement',
          severity: 'medium',
          evidence: [
            'Bank records showing complex transactions',
            'Evidence of shell companies and trusts',
            'Testimony about hidden financial arrangements'
          ],
          contributing_factors: [
            'Multiple accounts and financial entities',
            'International money movement capabilities',
            'Sophisticated financial planning for crimes'
          ]
        }
      ]
    }
  ], [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'people': return <Users className="w-4 h-4" />
      case 'methods': return <GitBranch className="w-4 h-4" />
      case 'materials': return <Target className="w-4 h-4" />
      case 'environment': return <AlertTriangle className="w-4 h-4" />
      case 'management': return <DollarSign className="w-4 h-4" />
      case 'machines': return <GitBranch className="w-4 h-4" />
      default: return <ArrowRight className="w-4 h-4" />
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Category', 'Cause', 'Severity', 'Description', 'Evidence Count', 'Contributing Factors'],
      ...causeCategories.flatMap(category =>
        category.causes.map(cause => [
          category.label,
          cause.description,
          cause.severity,
          cause.description,
          cause.evidence.length.toString(),
          cause.contributing_factors.join('; ')
        ])
      )
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-cause-effect-analysis.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Cause & Effect Analysis (Fishbone Diagram)
          </h3>
          <p className="text-sm text-muted-foreground">
            Root cause analysis of systematic criminal behavior patterns - Day {trialDay.trialDayNumber}
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

      {/* Problem Statement */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="bg-red-500/20 border-2 border-red-500/50 rounded-lg p-4 mb-2">
              <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h4 className="font-semibold text-foreground">{problemStatement.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              {problemStatement.description}
            </p>
            <p className="text-xs text-red-400 mt-2">Impact: {problemStatement.impact}</p>
          </div>
        </div>
      </div>

      {/* Fishbone Diagram */}
      <div className="glass-card p-6">
        <h4 className="font-semibold text-foreground mb-4">Contributing Factors Analysis</h4>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {causeCategories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              whileHover={reducedMotion ? {} : { scale: 1.02 }}
              className={`text-left p-4 rounded-lg border transition-all ${
                selectedCategory?.id === category.id 
                  ? 'border-accent bg-accent/10' 
                  : 'border-border bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded ${category.color}`}>
                  {getCategoryIcon(category.category)}
                </div>
                <h5 className="font-medium text-foreground">{category.label}</h5>
              </div>
              
              <div className="space-y-2">
                {category.causes.map((cause) => (
                  <div
                    key={cause.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-foreground truncate pr-2">
                      {cause.description}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(cause.severity)}`}>
                      {cause.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 text-xs text-muted-foreground">
                {category.causes.length} contributing factor{category.causes.length !== 1 ? 's' : ''}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 rounded-lg ${selectedCategory.color}`}>
              {getCategoryIcon(selectedCategory.category)}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground">{selectedCategory.label}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedCategory.causes.length} contributing factors identified
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedCategory.causes.map((cause) => (
              <motion.button
                key={cause.id}
                onClick={() => setSelectedCause(selectedCause?.id === cause.id ? null : cause)}
                whileHover={reducedMotion ? {} : { scale: 1.01 }}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedCause?.id === cause.id 
                    ? 'border-accent bg-accent/10' 
                    : 'border-border bg-muted/50 hover:bg-muted'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-foreground pr-4">{cause.description}</h5>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(cause.severity)}`}>
                    {cause.severity.toUpperCase()}
                  </span>
                </div>
                
                {selectedCause?.id === cause.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
                    className="mt-4 space-y-3"
                  >
                    <div>
                      <h6 className="text-sm font-medium text-foreground mb-2">Supporting Evidence</h6>
                      <ul className="space-y-1">
                        {cause.evidence.map((evidence, index) => (
                          <li key={index} className="text-sm text-foreground flex items-start">
                            <span className="text-green-400 mr-2">•</span>
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h6 className="text-sm font-medium text-foreground mb-2">Contributing Factors</h6>
                      <ul className="space-y-1">
                        {cause.contributing_factors.map((factor, index) => (
                          <li key={index} className="text-sm text-foreground flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{causeCategories.length}</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {causeCategories.flatMap(c => c.causes.filter(cause => cause.severity === 'critical')).length}
          </div>
          <div className="text-sm text-muted-foreground">Critical</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {causeCategories.flatMap(c => c.causes.filter(cause => cause.severity === 'high')).length}
          </div>
          <div className="text-sm text-muted-foreground">High</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {causeCategories.flatMap(c => c.causes.filter(cause => cause.severity === 'medium')).length}
          </div>
          <div className="text-sm text-muted-foreground">Medium</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {causeCategories.flatMap(c => c.causes).length}
          </div>
          <div className="text-sm text-muted-foreground">Total Causes</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {causeCategories.flatMap(c => c.causes.flatMap(cause => cause.evidence)).length}
          </div>
          <div className="text-sm text-muted-foreground">Evidence Items</div>
        </div>
      </div>
    </div>
  )
}