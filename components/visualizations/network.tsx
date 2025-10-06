'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { Users, DollarSign, Link, Info, Download, Filter, BarChart3 } from 'lucide-react'
import { 
  getPlotlyConfig, 
  getPlotlyLayout, 
  exportPlotlyData,
  plotlyColors
} from '@/lib/plotly-utils'
import type { TrialDay } from '@/lib/types'

// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface NetworkVisualizationProps {
  trialDay: TrialDay
}

interface NetworkNode {
  id: string
  label: string
  type: 'person' | 'entity' | 'event' | 'financial'
  size: number
  x: number
  y: number
  connections: string[]
}

interface NetworkEdge {
  from: string
  to: string
  label: string
  type: 'financial' | 'relationship' | 'legal' | 'communication'
  weight: number
}

export default function NetworkVisualization({ trialDay }: NetworkVisualizationProps) {
  const { reducedMotion } = useAccessibilityStore()
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'network' | 'force' | 'hierarchy'>('network')
  const [filterType, setFilterType] = useState<string>('all')

  const networkData = {
    financialTotal: 2.3,
    keyInsights: [
      'Multiple financial transfers to alleged victims',
      'Complex web of business relationships',
      'Pattern of settlements and payments'
    ]
  }

  const nodes: NetworkNode[] = [
    {
      id: 'combs',
      label: 'Sean Combs',
      type: 'person',
      size: 60,
      x: 0,
      y: 0,
      connections: ['cassie', 'badboy', 'hotel', 'settlement1', 'settlement2']
    },
    {
      id: 'cassie',
      label: 'Cassie Ventura',
      type: 'person',
      size: 50,
      x: -3,
      y: 2,
      connections: ['combs', 'settlement1', 'settlement2']
    },
    {
      id: 'badboy',
      label: 'Bad Boy Records',
      type: 'entity',
      size: 40,
      x: -1,
      y: -3,
      connections: ['combs', 'settlement1']
    },
    {
      id: 'hotel',
      label: 'InterContinental Hotels',
      type: 'entity',
      size: 35,
      x: 3,
      y: -2,
      connections: ['combs', 'settlement2']
    },
    {
      id: 'settlement1',
      label: '$20M Civil Settlement',
      type: 'financial',
      size: 45,
      x: -2,
      y: 4,
      connections: ['combs', 'cassie', 'badboy']
    },
    {
      id: 'settlement2',
      label: '$10M Hotel Settlement',
      type: 'financial',
      size: 35,
      x: 4,
      y: 1,
      connections: ['combs', 'cassie', 'hotel']
    },
    {
      id: 'lawsuit',
      label: '2023 Civil Lawsuit',
      type: 'event',
      size: 30,
      x: -4,
      y: 0,
      connections: ['cassie', 'settlement1']
    }
  ]

  const edges: NetworkEdge[] = [
    {
      from: 'combs',
      to: 'cassie',
      label: 'Relationship (2007-2018)',
      type: 'relationship',
      weight: 100
    },
    {
      from: 'combs',
      to: 'settlement1',
      label: '$20M Payment',
      type: 'financial',
      weight: 80
    },
    {
      from: 'cassie',
      to: 'settlement2',
      label: '$10M Payment',
      type: 'financial',
      weight: 60
    },
    {
      from: 'combs',
      to: 'badboy',
      label: 'CEO/Owner',
      type: 'legal',
      weight: 90
    },
    {
      from: 'settlement1',
      to: 'badboy',
      label: 'Payment Source',
      type: 'financial',
      weight: 70
    },
    {
      from: 'hotel',
      to: 'settlement2',
      label: 'Liability Payment',
      type: 'financial',
      weight: 60
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'person': return plotlyColors.blue
      case 'entity': return plotlyColors.purple
      case 'event': return plotlyColors.green
      case 'financial': return plotlyColors.yellow
      default: return plotlyColors.gray
    }
  }

  const getEdgeColor = (type: string) => {
    switch (type) {
      case 'financial': return plotlyColors.yellow
      case 'relationship': return plotlyColors.blue
      case 'legal': return plotlyColors.purple
      case 'communication': return plotlyColors.green
      default: return plotlyColors.gray
    }
  }

  const filteredNodes = filterType === 'all' ? nodes : nodes.filter(node => node.type === filterType)
  const filteredEdges = edges.filter(edge => 
    filteredNodes.some(node => node.id === edge.from) &&
    filteredNodes.some(node => node.id === edge.to)
  )

  // Create edge traces for Plotly
  const edgeTraces = filteredEdges.map((edge, index) => {
    const fromNode = nodes.find(n => n.id === edge.from)
    const toNode = nodes.find(n => n.id === edge.to)
    
    if (!fromNode || !toNode) return null

    return {
      type: 'scatter',
      mode: 'lines',
      x: [fromNode.x, toNode.x, null],
      y: [fromNode.y, toNode.y, null],
      line: {
        color: getEdgeColor(edge.type),
        width: Math.max(2, edge.weight / 30),
        dash: edge.type === 'financial' ? 'dash' : 'solid'
      },
      hoverinfo: 'text',
      hovertext: `${edge.label}<br>Type: ${edge.type}<br>Weight: ${edge.weight}`,
      showlegend: false,
      name: `Edge_${index}`
    }
  }).filter(Boolean)

  // Create node traces grouped by type
  const nodeTypeGroups = ['person', 'entity', 'event', 'financial']
  const nodeTraces = nodeTypeGroups.map(nodeType => {
    const typeNodes = filteredNodes.filter(node => node.type === nodeType)
    
    if (typeNodes.length === 0) return null

    return {
      type: 'scatter',
      mode: 'markers+text',
      x: typeNodes.map(node => node.x),
      y: typeNodes.map(node => node.y),
      text: typeNodes.map(node => node.label),
      textposition: 'bottom center',
      textfont: {
        color: '#e2e8f0',
        size: 10,
        family: 'Arial, sans-serif'
      },
      marker: {
        size: typeNodes.map(node => node.size),
        color: getNodeColor(nodeType),
        line: {
          color: '#1e293b',
          width: 2
        },
        sizemode: 'diameter',
        sizeref: 2
      },
      hovertemplate: `<b>%{text}</b><br>Type: ${nodeType}<br>Connections: %{customdata}<extra></extra>`,
      customdata: typeNodes.map(node => node.connections.length),
      name: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
      showlegend: true
    }
  }).filter(Boolean)

  const plotData = [...edgeTraces, ...nodeTraces] as any[]

  const plotLayout = {
    ...getPlotlyLayout({
      showlegend: true,
      margin: { l: 40, r: 40, t: 40, b: 40 }
    }),
    xaxis: {
      showgrid: false,
      zeroline: false,
      showticklabels: false,
      range: [-6, 6]
    },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showticklabels: false,
      range: [-5, 6]
    },
    height: 500,
    legend: {
      bgcolor: 'rgba(15, 23, 42, 0.8)',
      bordercolor: '#334155',
      font: { color: '#e2e8f0' },
      x: 1,
      xanchor: 'right' as 'right',
      y: 1,
      yanchor: 'top' as 'top'
    },
    annotations: selectedNode ? [{
      x: selectedNode.x,
      y: selectedNode.y + 1,
      text: `<b>${selectedNode.label}</b><br>Selected`,
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 2,
      arrowcolor: plotlyColors.accent,
      font: { color: plotlyColors.accent, size: 12 },
      bgcolor: 'rgba(15, 23, 42, 0.9)',
      bordercolor: plotlyColors.accent,
      borderwidth: 1
    }] : []
  }

  const exportData = () => {
    const networkAnalysis = {
      nodes: filteredNodes.map(node => ({
        id: node.id,
        label: node.label,
        type: node.type,
        connections: node.connections.length,
        position: { x: node.x, y: node.y }
      })),
      edges: filteredEdges.map(edge => ({
        from: edge.from,
        to: edge.to,
        label: edge.label,
        type: edge.type,
        weight: edge.weight
      })),
      statistics: {
        totalNodes: filteredNodes.length,
        totalEdges: filteredEdges.length,
        networkDensity: (filteredEdges.length * 2) / (filteredNodes.length * (filteredNodes.length - 1)),
        averageConnections: filteredNodes.reduce((sum, node) => sum + node.connections.length, 0) / filteredNodes.length
      }
    }

    exportPlotlyData(networkAnalysis.nodes, `trial-day-${trialDay.trialDayNumber}-network-analysis`, [
      'id',
      'label', 
      'type',
      'connections',
      'position'
    ])
  }

  const handleNodeClick = (event: any) => {
    if (event?.points?.[0]) {
      const point = event.points[0]
      const clickedNode = filteredNodes.find(node => 
        Math.abs(node.x - point.x) < 0.1 && Math.abs(node.y - point.y) < 0.1
      )
      if (clickedNode) {
        setSelectedNode(clickedNode)
      }
    }
  }

  if (!mounted) {
    return <div className="h-96 bg-muted rounded-lg animate-pulse" />
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            The Ecosystem of Allegations and Settlements
          </h3>
          <p className="text-sm text-muted-foreground">
            Interactive network visualization of financial flows and relationships in the case
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">View:</span>
          </div>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'network' | 'force' | 'hierarchy')}
            className="px-2 py-1 text-sm bg-background border border-border rounded"
            aria-label="Network visualization view mode"
          >
            <option value="network">Network View</option>
            <option value="force">Force Layout</option>
            <option value="hierarchy">Hierarchical</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter:</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1 text-sm bg-background border border-border rounded"
            aria-label="Network node type filter"
          >
            <option value="all">All Nodes</option>
            <option value="person">People</option>
            <option value="entity">Organizations</option>
            <option value="financial">Financial</option>
            <option value="event">Events</option>
          </select>
          
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg border border-accent/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Network Visualization */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6">
            <Plot
              data={plotData}
              layout={plotLayout}
              config={getPlotlyConfig(`trial-day-${trialDay.trialDayNumber}-network`)}
              onClick={handleNodeClick}
              style={{ width: '100%', height: '500px' }}
            />
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          {/* Node Types Legend */}
          <div className="glass-card p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5 text-accent" />
              <h4 className="font-semibold text-foreground">Node Types</h4>
            </div>
            
            <div className="space-y-2">
              {[
                { type: 'person', color: 'bg-blue-500', label: 'People', count: filteredNodes.filter(n => n.type === 'person').length },
                { type: 'entity', color: 'bg-purple-500', label: 'Organizations', count: filteredNodes.filter(n => n.type === 'entity').length },
                { type: 'financial', color: 'bg-yellow-500', label: 'Financial', count: filteredNodes.filter(n => n.type === 'financial').length },
                { type: 'event', color: 'bg-green-500', label: 'Legal Events', count: filteredNodes.filter(n => n.type === 'event').length }
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Node Details */}
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.3 }}
              className="glass-card p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Info className="w-5 h-5 text-accent" />
                <h4 className="font-semibold text-foreground">{selectedNode.label}</h4>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Type: </span>
                  <span className="text-foreground capitalize">{selectedNode.type}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Connections: </span>
                  <span className="text-foreground">{selectedNode.connections.length}</span>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <h5 className="text-sm font-medium text-foreground mb-1">Connected To:</h5>
                  <div className="space-y-1">
                    {selectedNode.connections.map(connId => {
                      const connectedNode = nodes.find(n => n.id === connId)
                      return connectedNode ? (
                        <div key={connId} className="text-xs text-muted-foreground">
                          • {connectedNode.label}
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Financial Summary */}
          <div className="glass-card p-4">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="w-5 h-5 text-accent" />
              <h4 className="font-semibold text-foreground">Financial Flow</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              {networkData?.financialTotal && networkData.financialTotal > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Financial Activity:</span>
                    <span className="text-foreground font-medium">${networkData.financialTotal}M</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Day {trialDay.trialDayNumber} Total:</span>
                    <span className="text-accent font-bold">${networkData.financialTotal}M</span>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground text-center py-2">
                  No financial data in Day {trialDay.trialDayNumber}
                </div>
              )}
            </div>
          </div>

          {/* Network Statistics */}
          <div className="glass-card p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Link className="w-5 h-5 text-accent" />
              <h4 className="font-semibold text-foreground">Network Stats</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nodes:</span>
                <span className="text-foreground">{filteredNodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connections:</span>
                <span className="text-foreground">{filteredEdges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Connections:</span>
                <span className="text-foreground">
                  {(filteredNodes.reduce((sum, node) => sum + node.connections.length, 0) / filteredNodes.length).toFixed(1)}
                </span>
              </div>
              
              <div className="pt-2 border-t border-border">
                <h5 className="text-sm font-medium text-foreground mb-1">Key Insights:</h5>
                <div className="space-y-1">
                  {networkData?.keyInsights.map((insight, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      • {insight}
                    </div>
                  )) || (
                    <div className="text-muted-foreground text-center py-2">
                      Processing network data...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
