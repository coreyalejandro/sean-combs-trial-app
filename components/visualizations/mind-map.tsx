'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Download, Brain, Users, Shield, AlertTriangle, Heart, DollarSign, Eye } from 'lucide-react'
import type { TrialDay } from '@/lib/types'

interface MindMapNode {
  id: string
  label: string
  type: 'central' | 'primary' | 'secondary' | 'detail'
  category: 'employment' | 'personal' | 'abuse' | 'financial' | 'control' | 'impact'
  position: { x: number; y: number }
  connections: string[]
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  evidence_count: number
}

interface MindMapProps {
  trialDay: TrialDay
}

export default function MindMapVisualization({ trialDay }: MindMapProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const mindMapData: MindMapNode[] = useMemo(() => [
    // Central node
    {
      id: 'central',
      label: 'Life in Combs\'s Orbit',
      type: 'central',
      category: 'employment',
      position: { x: 400, y: 300 },
      connections: ['employment', 'personal-relationship', 'abuse-pattern', 'financial-control', 'psychological-impact'],
      description: 'Central theme of Mia\'s testimony about working and living within Sean Combs\'s sphere of influence',
      severity: 'critical',
      evidence_count: 25
    },
    
    // Primary branches
    {
      id: 'employment',
      label: 'Professional Employment',
      type: 'primary',
      category: 'employment',
      position: { x: 400, y: 150 },
      connections: ['central', 'job-duties', 'work-environment', 'career-impact'],
      description: 'Mia\'s role as personal assistant and the professional aspects of her employment',
      severity: 'medium',
      evidence_count: 8
    },
    
    {
      id: 'personal-relationship',
      label: 'Personal Relationship Dynamics',
      type: 'primary',
      category: 'personal',
      position: { x: 600, y: 200 },
      connections: ['central', 'romantic-involvement', 'social-isolation', 'emotional-dependency'],
      description: 'The blurred lines between professional and personal relationship with Combs',
      severity: 'high',
      evidence_count: 12
    },
    
    {
      id: 'abuse-pattern',
      label: 'Pattern of Abuse and Control',
      type: 'primary',
      category: 'abuse',
      position: { x: 650, y: 400 },
      connections: ['central', 'sexual-assault', 'physical-violence', 'emotional-abuse', 'surveillance'],
      description: 'Systematic pattern of abuse across multiple domains of Mia\'s life',
      severity: 'critical',
      evidence_count: 18
    },
    
    {
      id: 'financial-control',
      label: 'Economic Dependency & Control',
      type: 'primary',
      category: 'financial',
      position: { x: 400, y: 450 },
      connections: ['central', 'salary-control', 'housing-dependency', 'financial-threats'],
      description: 'Use of financial leverage to maintain control and prevent escape',
      severity: 'high',
      evidence_count: 10
    },
    
    {
      id: 'psychological-impact',
      label: 'Psychological Impact & Trauma',
      type: 'primary',
      category: 'impact',
      position: { x: 200, y: 400 },
      connections: ['central', 'fear-response', 'self-blame', 'trauma-symptoms', 'survival-mechanisms'],
      description: 'Long-term psychological consequences of the abusive relationship',
      severity: 'critical',
      evidence_count: 15
    },
    
    // Secondary branches - Employment
    {
      id: 'job-duties',
      label: 'Professional Responsibilities',
      type: 'secondary',
      category: 'employment',
      position: { x: 300, y: 100 },
      connections: ['employment'],
      description: 'Legitimate job duties as personal assistant and administrative tasks',
      severity: 'low',
      evidence_count: 5
    },
    
    {
      id: 'work-environment',
      label: 'Toxic Work Environment',
      type: 'secondary',
      category: 'employment',
      position: { x: 500, y: 100 },
      connections: ['employment'],
      description: 'Hostile, unpredictable work conditions with constant fear',
      severity: 'high',
      evidence_count: 7
    },
    
    {
      id: 'career-impact',
      label: 'Career Destruction',
      type: 'secondary',
      category: 'employment',
      position: { x: 400, y: 50 },
      connections: ['employment'],
      description: 'Long-term damage to professional reputation and career prospects',
      severity: 'medium',
      evidence_count: 4
    },
    
    // Secondary branches - Personal Relationship
    {
      id: 'romantic-involvement',
      label: 'Romantic Manipulation',
      type: 'secondary',
      category: 'personal',
      position: { x: 700, y: 150 },
      connections: ['personal-relationship'],
      description: 'Exploitation of romantic feelings to maintain control',
      severity: 'high',
      evidence_count: 6
    },
    
    {
      id: 'social-isolation',
      label: 'Social Isolation Tactics',
      type: 'secondary',
      category: 'personal',
      position: { x: 750, y: 200 },
      connections: ['personal-relationship'],
      description: 'Systematic separation from family, friends, and support networks',
      severity: 'high',
      evidence_count: 8
    },
    
    {
      id: 'emotional-dependency',
      label: 'Emotional Dependency',
      type: 'secondary',
      category: 'personal',
      position: { x: 700, y: 250 },
      connections: ['personal-relationship'],
      description: 'Created psychological dependency through intermittent reinforcement',
      severity: 'high',
      evidence_count: 9
    },
    
    // Secondary branches - Abuse Pattern
    {
      id: 'sexual-assault',
      label: 'Sexual Assault & Coercion',
      type: 'secondary',
      category: 'abuse',
      position: { x: 750, y: 350 },
      connections: ['abuse-pattern'],
      description: 'Multiple incidents of sexual assault and coercive sexual activity',
      severity: 'critical',
      evidence_count: 8
    },
    
    {
      id: 'physical-violence',
      label: 'Physical Violence & Threats',
      type: 'secondary',
      category: 'abuse',
      position: { x: 750, y: 400 },
      connections: ['abuse-pattern'],
      description: 'Physical assault, threats of violence, and intimidation tactics',
      severity: 'critical',
      evidence_count: 6
    },
    
    {
      id: 'emotional-abuse',
      label: 'Emotional & Psychological Abuse',
      type: 'secondary',
      category: 'abuse',
      position: { x: 750, y: 450 },
      connections: ['abuse-pattern'],
      description: 'Humiliation, degradation, and psychological manipulation',
      severity: 'high',
      evidence_count: 12
    },
    
    {
      id: 'surveillance',
      label: 'Surveillance & Monitoring',
      type: 'secondary',
      category: 'control',
      position: { x: 650, y: 500 },
      connections: ['abuse-pattern'],
      description: 'Constant monitoring of activities, communications, and relationships',
      severity: 'high',
      evidence_count: 7
    },
    
    // Secondary branches - Financial Control
    {
      id: 'salary-control',
      label: 'Salary & Income Control',
      type: 'secondary',
      category: 'financial',
      position: { x: 300, y: 500 },
      connections: ['financial-control'],
      description: 'Control over salary, bonuses, and financial independence',
      severity: 'high',
      evidence_count: 5
    },
    
    {
      id: 'housing-dependency',
      label: 'Housing Dependency',
      type: 'secondary',
      category: 'financial',
      position: { x: 400, y: 550 },
      connections: ['financial-control'],
      description: 'Dependency on employer-provided housing creating vulnerability',
      severity: 'medium',
      evidence_count: 4
    },
    
    {
      id: 'financial-threats',
      label: 'Financial Threats & Coercion',
      type: 'secondary',
      category: 'financial',
      position: { x: 500, y: 500 },
      connections: ['financial-control'],
      description: 'Threats to cut off financial support and destroy economic stability',
      severity: 'high',
      evidence_count: 6
    },
    
    // Secondary branches - Psychological Impact
    {
      id: 'fear-response',
      label: 'Chronic Fear & Hypervigilance',
      type: 'secondary',
      category: 'impact',
      position: { x: 100, y: 350 },
      connections: ['psychological-impact'],
      description: 'Constant state of fear and hypervigilance about safety',
      severity: 'critical',
      evidence_count: 8
    },
    
    {
      id: 'self-blame',
      label: 'Self-Blame & Guilt',
      type: 'secondary',
      category: 'impact',
      position: { x: 100, y: 400 },
      connections: ['psychological-impact'],
      description: 'Internalized blame and guilt about the abusive situation',
      severity: 'high',
      evidence_count: 6
    },
    
    {
      id: 'trauma-symptoms',
      label: 'Trauma Symptoms',
      type: 'secondary',
      category: 'impact',
      position: { x: 100, y: 450 },
      connections: ['psychological-impact'],
      description: 'PTSD symptoms, depression, anxiety, and other trauma responses',
      severity: 'critical',
      evidence_count: 9
    },
    
    {
      id: 'survival-mechanisms',
      label: 'Survival Mechanisms',
      type: 'secondary',
      category: 'impact',
      position: { x: 200, y: 500 },
      connections: ['psychological-impact'],
      description: 'Adaptive behaviors developed to survive the abusive environment',
      severity: 'medium',
      evidence_count: 7
    }
  ], [])

  const filteredNodes = useMemo(() => {
    if (filterCategory === 'all') return mindMapData
    return mindMapData.filter(node => 
      node.category === filterCategory || node.type === 'central'
    )
  }, [mindMapData, filterCategory])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'employment': return <Users className="w-4 h-4" />
      case 'personal': return <Heart className="w-4 h-4" />
      case 'abuse': return <AlertTriangle className="w-4 h-4" />
      case 'financial': return <DollarSign className="w-4 h-4" />
      case 'control': return <Shield className="w-4 h-4" />
      case 'impact': return <Brain className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'employment': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'personal': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'abuse': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'financial': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'control': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'impact': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getNodeSize = (type: string) => {
    switch (type) {
      case 'central': return 80
      case 'primary': return 60
      case 'secondary': return 40
      case 'detail': return 30
      default: return 40
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500'
      case 'high': return 'border-orange-500'
      case 'medium': return 'border-yellow-500'
      case 'low': return 'border-green-500'
      default: return 'border-gray-500'
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Node', 'Type', 'Category', 'Description', 'Severity', 'Evidence Count'],
      ...mindMapData.map(node => [
        node.label,
        node.type,
        node.category,
        node.description,
        node.severity,
        node.evidence_count.toString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-day-${trialDay.trialDayNumber}-mind-map.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Thematic Mind Map: Life in Combs's Orbit
          </h3>
          <p className="text-sm text-muted-foreground">
            Multifaceted analysis of Mia's testimony themes - Day {trialDay.trialDayNumber}
          </p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export Mind Map</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Focus Area:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1 bg-muted/50 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Themes</option>
            <option value="employment">Employment</option>
            <option value="personal">Personal Relationship</option>
            <option value="abuse">Abuse Pattern</option>
            <option value="financial">Financial Control</option>
            <option value="control">Control Mechanisms</option>
            <option value="impact">Psychological Impact</option>
          </select>
        </div>
      </div>

      {/* Mind Map Visualization */}
      <div className="glass-card p-6">
        <div className="relative w-full h-[600px] bg-slate-900/20 rounded-lg overflow-hidden">
          <svg viewBox="0 0 800 600" className="w-full h-full">
            {/* Render connections first */}
            {filteredNodes.map(node => 
              node.connections
                .filter(connId => filteredNodes.some(n => n.id === connId))
                .map((connId, index) => {
                  const connectedNode = filteredNodes.find(n => n.id === connId)
                  if (!connectedNode || connectedNode.id === node.id) return null
                  
                  return (
                    <line
                      key={`${node.id}-${connId}-${index}`}
                      x1={node.position.x}
                      y1={node.position.y}
                      x2={connectedNode.position.x}
                      y2={connectedNode.position.y}
                      stroke="currentColor"
                      strokeWidth={node.type === 'central' ? "3" : "2"}
                      className="text-accent/30"
                    />
                  )
                })
            )}
            
            {/* Render nodes */}
            {filteredNodes.map((node) => {
              const size = getNodeSize(node.type)
              const isSelected = selectedNode?.id === node.id
              const isHovered = hoveredNode === node.id
              
              return (
                <g key={node.id}>
                  <motion.circle
                    cx={node.position.x}
                    cy={node.position.y}
                    r={size / 2}
                    className={`cursor-pointer transition-all ${getCategoryColor(node.category)} ${getSeverityColor(node.severity)} ${
                      isSelected ? 'ring-4 ring-accent' : ''
                    } ${isHovered ? 'brightness-110' : ''}`}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    whileHover={reducedMotion ? {} : { scale: 1.1 }}
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="currentColor"
                  />
                  
                  {/* Node icon */}
                  <foreignObject
                    x={node.position.x - 8}
                    y={node.position.y - 8}
                    width="16"
                    height="16"
                    className="pointer-events-none"
                  >
                    <div className="flex items-center justify-center text-foreground">
                      {getCategoryIcon(node.category)}
                    </div>
                  </foreignObject>
                  
                  {/* Node label */}
                  <text
                    x={node.position.x}
                    y={node.position.y + size/2 + 15}
                    textAnchor="middle"
                    className="text-xs font-medium fill-foreground pointer-events-none"
                    onClick={() => setSelectedNode(node)}
                  >
                    {node.label.length > 20 ? `${node.label.substring(0, 20)}...` : node.label}
                  </text>
                  
                  {/* Evidence count badge */}
                  <circle
                    cx={node.position.x + size/2 - 5}
                    cy={node.position.y - size/2 + 5}
                    r="8"
                    className="fill-accent"
                  />
                  <text
                    x={node.position.x + size/2 - 5}
                    y={node.position.y - size/2 + 9}
                    textAnchor="middle"
                    className="text-xs font-bold fill-accent-foreground pointer-events-none"
                  >
                    {node.evidence_count}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Node Details and Legend */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Selected Node Details */}
        <div className="lg:col-span-2">
          <h4 className="font-semibold text-foreground mb-4">Theme Analysis</h4>
          {selectedNode ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className={`p-3 rounded-lg ${getCategoryColor(selectedNode.category)}`}>
                  {getCategoryIcon(selectedNode.category)}
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-foreground mb-1">{selectedNode.label}</h5>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="capitalize">{selectedNode.type} Theme</span>
                    <span className="capitalize">{selectedNode.category}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedNode.severity === 'critical' ? 'text-red-400 bg-red-500/20' :
                      selectedNode.severity === 'high' ? 'text-orange-400 bg-orange-500/20' :
                      selectedNode.severity === 'medium' ? 'text-yellow-400 bg-yellow-500/20' :
                      'text-green-400 bg-green-500/20'
                    }`}>
                      {selectedNode.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent">{selectedNode.evidence_count}</div>
                  <div className="text-xs text-muted-foreground">Evidence Items</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Description:</div>
                  <p className="text-sm text-foreground">{selectedNode.description}</p>
                </div>

                {selectedNode.connections.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Connected Themes:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.connections
                        .filter(connId => connId !== selectedNode.id)
                        .map(connId => {
                          const connectedNode = mindMapData.find(n => n.id === connId)
                          return connectedNode ? (
                            <button
                              key={connId}
                              onClick={() => setSelectedNode(connectedNode)}
                              className="text-xs px-2 py-1 bg-accent/20 hover:bg-accent/30 rounded border border-accent/30 transition-colors"
                            >
                              {connectedNode.label}
                            </button>
                          ) : null
                        })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Click on a node in the mind map to explore theme details</p>
            </div>
          )}
        </div>

        {/* Legend and Statistics */}
        <div className="space-y-6">
          {/* Category Legend */}
          <div className="glass-card p-4">
            <h5 className="font-semibold text-foreground mb-3">Theme Categories</h5>
            <div className="space-y-2">
              {[
                { category: 'employment', label: 'Employment', count: mindMapData.filter(n => n.category === 'employment').length },
                { category: 'personal', label: 'Personal Relations', count: mindMapData.filter(n => n.category === 'personal').length },
                { category: 'abuse', label: 'Abuse Patterns', count: mindMapData.filter(n => n.category === 'abuse').length },
                { category: 'financial', label: 'Financial Control', count: mindMapData.filter(n => n.category === 'financial').length },
                { category: 'control', label: 'Control Mechanisms', count: mindMapData.filter(n => n.category === 'control').length },
                { category: 'impact', label: 'Psychological Impact', count: mindMapData.filter(n => n.category === 'impact').length }
              ].map((item) => (
                <button
                  key={item.category}
                  onClick={() => setFilterCategory(item.category)}
                  className={`w-full flex items-center justify-between p-2 rounded transition-colors ${
                    filterCategory === item.category ? 'bg-accent/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${getCategoryColor(item.category)}`}>
                      {getCategoryIcon(item.category)}
                    </div>
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mind Map Statistics */}
          <div className="glass-card p-4">
            <h5 className="font-semibold text-foreground mb-3">Analysis Statistics</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Themes:</span>
                <span className="text-foreground">{mindMapData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Primary Branches:</span>
                <span className="text-foreground">{mindMapData.filter(n => n.type === 'primary').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Evidence Items:</span>
                <span className="text-foreground">{mindMapData.reduce((sum, n) => sum + n.evidence_count, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Critical Severity:</span>
                <span className="text-red-400">{mindMapData.filter(n => n.severity === 'critical').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">High Severity:</span>
                <span className="text-orange-400">{mindMapData.filter(n => n.severity === 'high').length}</span>
              </div>
            </div>
          </div>

          {/* Node Type Legend */}
          <div className="glass-card p-4">
            <h5 className="font-semibold text-foreground mb-3">Node Types</h5>
            <div className="space-y-2">
              {[
                { type: 'central', label: 'Central Theme', size: 80 },
                { type: 'primary', label: 'Primary Branch', size: 60 },
                { type: 'secondary', label: 'Secondary Theme', size: 40 }
              ].map((item) => (
                <div key={item.type} className="flex items-center space-x-3">
                  <div 
                    className="rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center"
                    style={{ width: item.size / 2, height: item.size / 2 }}
                  >
                    <Brain className="w-3 h-3 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">Size: {item.size}px</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}