export interface PlotlyConfig {
  displayModeBar: boolean
  responsive: boolean
  toImageButtonOptions?: {
    format: 'png' | 'svg' | 'jpeg' | 'webp'
    filename: string
    height: number
    width: number
    scale: number
  }
}

export interface PlotlyLayout {
  paper_bgcolor: string
  plot_bgcolor: string
  font: {
    color: string
    family: string
    size?: number
  }
  margin: {
    l: number
    r: number
    t: number
    b: number
  }
  showlegend?: boolean
  legend?: {
    bgcolor: string
    bordercolor: string
    font: {
      color: string
    }
  }
}

// Standard Plotly configuration for all visualizations
export const getPlotlyConfig = (filename?: string): PlotlyConfig => ({
  displayModeBar: false,
  responsive: true,
  ...(filename && {
    toImageButtonOptions: {
      format: 'png',
      filename,
      height: 600,
      width: 1000,
      scale: 2
    }
  })
})

// Dark theme layout for consistency with the app
export const getPlotlyLayout = (overrides?: Partial<PlotlyLayout>): PlotlyLayout => ({
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: {
    color: '#e2e8f0', // text-slate-200
    family: 'system-ui, -apple-system, sans-serif',
    size: 12
  },
  margin: { l: 60, r: 60, t: 60, b: 60 },
  showlegend: true,
  legend: {
    bgcolor: 'rgba(30, 41, 59, 0.8)', // slate-800 with opacity
    bordercolor: '#475569', // slate-600
    font: {
      color: '#e2e8f0'
    }
  },
  ...overrides
})

// Color schemes for different data types
export const plotlyColors = {
  // Basic colors
  blue: '#2563eb',      // blue-600
  purple: '#7c3aed',    // violet-600
  green: '#16a34a',     // green-600
  yellow: '#ca8a04',    // yellow-600
  red: '#dc2626',       // red-600
  gray: '#6b7280',      // gray-500
  accent: '#f59e0b',    // amber-500
  
  // Severity levels
  severity: {
    high: '#dc2626',    // red-600
    medium: '#ea580c',  // orange-600
    low: '#16a34a',     // green-600
    critical: '#991b1b' // red-800
  },
  
  // Trial entity types
  entities: {
    prosecution: '#dc2626',  // red-600
    defense: '#2563eb',      // blue-600
    witness: '#16a34a',      // green-600
    evidence: '#ca8a04',     // yellow-600
    expert: '#7c3aed'        // violet-600
  },
  
  // Sentiment analysis
  sentiment: {
    positive: '#16a34a',  // green-600
    negative: '#dc2626',  // red-600
    neutral: '#6b7280'    // gray-500
  },
  
  // Timeline/temporal
  timeline: {
    past: '#6b7280',      // gray-500
    present: '#f59e0b',   // amber-500
    future: '#3b82f6'     // blue-500
  },
  
  // Network relationships
  network: {
    strong: '#dc2626',    // red-600
    moderate: '#f59e0b',  // amber-500
    weak: '#6b7280'       // gray-500
  }
}

// Helper function to get color by severity
export const getSeverityColor = (severity: string): string => {
  return plotlyColors.severity[severity as keyof typeof plotlyColors.severity] || plotlyColors.severity.low
}

// Helper function to get color by sentiment
export const getSentimentColor = (sentiment: string): string => {
  return plotlyColors.sentiment[sentiment as keyof typeof plotlyColors.sentiment] || plotlyColors.sentiment.neutral
}

// Common hover template for clean tooltips
export const getHoverTemplate = (title: string, additionalFields?: string[]): string => {
  let template = `<b>${title}</b><br>`
  if (additionalFields) {
    additionalFields.forEach(field => {
      template += `${field}<br>`
    })
  }
  template += '<extra></extra>'
  return template
}

// Timeline axis configuration
export const getTimelineAxis = (title: string) => ({
  title: {
    text: title,
    font: { color: '#e2e8f0', size: 14 }
  },
  tickfont: { color: '#94a3b8', size: 10 },
  gridcolor: '#374151',
  zeroline: false
})

// Standard axis configuration
export const getAxis = (title: string, isCategory: boolean = false) => ({
  title: {
    text: title,
    font: { color: '#e2e8f0', size: 14 }
  },
  tickfont: { color: '#94a3b8', size: 10 },
  gridcolor: '#374151',
  zeroline: false,
  ...(isCategory && { type: 'category' })
})

// Export data to CSV utility
export const exportPlotlyData = (data: any[], filename: string, headers: string[]) => {
  const csvContent = [
    headers,
    ...data.map(row => headers.map(header => {
      const value = row[header.toLowerCase().replace(/\s+/g, '_')]
      return typeof value === 'string' ? `"${value}"` : value?.toString() || ''
    }))
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Create scatter plot data structure
export const createScatterData = (
  x: (number | string)[],
  y: (number | string)[],
  mode: 'markers' | 'lines' | 'markers+lines' = 'markers',
  name?: string,
  color?: string,
  size?: number | number[],
  text?: string[],
  customdata?: any[]
) => ({
  x,
  y,
  mode,
  type: 'scatter' as const,
  ...(name && { name }),
  marker: {
    color: color || plotlyColors.entities.evidence,
    size: size || 8,
    line: { color: '#ffffff', width: 1 }
  },
  ...(text && { text, hovertemplate: getHoverTemplate('%{text}') }),
  ...(customdata && { customdata })
})

// Create bar chart data structure
export const createBarData = (
  x: (number | string)[],
  y: (number | string)[],
  name?: string,
  color?: string | string[],
  text?: string[]
) => ({
  x,
  y,
  type: 'bar' as const,
  ...(name && { name }),
  marker: {
    color: color || plotlyColors.entities.evidence,
    line: { color: '#ffffff', width: 1 }
  },
  ...(text && { text, textposition: 'outside' as const })
})

// Create heatmap data structure
export const createHeatmapData = (
  z: number[][],
  x?: string[],
  y?: string[],
  colorscale?: string,
  text?: string[][]
) => ({
  z,
  type: 'heatmap' as const,
  ...(x && { x }),
  ...(y && { y }),
  colorscale: colorscale || [
    [0, '#1e293b'],    // slate-800 (dark)
    [0.5, '#f59e0b'],  // amber-500 (medium)  
    [1, '#dc2626']     // red-600 (high)
  ],
  ...(text && { text, texttemplate: '%{text}', textfont: { color: '#ffffff' } }),
  hoverongaps: false
})

// Create network/sankey diagram helpers
export const createNetworkNode = (
  id: string,
  label: string,
  color?: string,
  value?: number
) => ({
  id,
  label,
  color: color || plotlyColors.entities.evidence,
  value: value || 1
})

export const createNetworkLink = (
  source: string,
  target: string,
  value: number,
  color?: string
) => ({
  source,
  target,
  value,
  color: color || plotlyColors.network.moderate
})

// Responsive layout helper
export const getResponsiveLayout = (baseLayout: PlotlyLayout, isMobile: boolean = false) => ({
  ...baseLayout,
  margin: isMobile 
    ? { l: 40, r: 40, t: 40, b: 40 }
    : baseLayout.margin,
  font: {
    ...baseLayout.font,
    size: isMobile ? 10 : baseLayout.font.size
  }
}) 