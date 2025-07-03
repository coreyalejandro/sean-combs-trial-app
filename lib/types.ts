
export interface TrialDay {
  id: number
  date: Date
  trialDayNumber: number
  headlineTitle: string
  headlineSummary: string
  dataStoryPlan: string
  visualizationType: string
  createdAt: Date
  updatedAt: Date
}

export interface AccessibilitySettings {
  reducedMotion: boolean
  highContrast: boolean
  largeText: boolean
  screenReaderMode: boolean
}

export interface NavigationState {
  currentDay: number
  isMenuOpen: boolean
  searchQuery: string
}

export interface VisualizationProps {
  data: TrialDay
  width: number
  height: number
  accessibilitySettings: AccessibilitySettings
}

export interface Witness {
  id: number
  name: string
  pseudonym?: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface Testimony {
  id: number
  witnessId: number
  trialDayId: number
  content: string
  keyPoints: string[]
  evidenceType: string
  createdAt: Date
  updatedAt: Date
  witness: Witness
  trialDay: TrialDay
}

export interface Evidence {
  id: number
  trialDayId: number
  type: string
  description: string
  significance: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
  trialDay: TrialDay
}

export type VisualizationType = 
  | 'word-cloud-comparison'
  | 'geospatial-map'
  | 'interactive-timeline'
  | 'sentiment-analysis'
  | 'financial-network'
  | 'corroboration-matrix'
  | 'process-flowchart'
  | 'evidence-inventory'
  | 'multi-modal-timeline'
  | 'digital-forensics'
  | 'psychological-analysis'
  | 'network-flow'
  | 'legal-process'
  | 'mind-map'
  | 'stakeholder-map'
  | 'comparative-table'
  | 'process-flow'
  | '3d-reconstruction'
  | 'courtroom-dynamics'
  | 'health-impact'
  | 'cause-effect'
  | 'evidence-comparison'
  | 'dynamic-network'
  | 'narrative-arc'
  | 'evidence-heatmap'
  | 'evidence-integration'
  | 'interpretation-analysis'
  | 'deliberation-tracker'

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
    borderWidth?: number
  }>
}

export interface TimelineEvent {
  date: string
  title: string
  description: string
  type: 'incident' | 'testimony' | 'evidence' | 'legal'
  severity?: 'low' | 'medium' | 'high'
}

export interface GeospatialPoint {
  latitude: number
  longitude: number
  location: string
  events: Array<{
    date: string
    description: string
    severity: string
  }>
}

export interface NetworkNode {
  id: string
  label: string
  type: 'person' | 'entity' | 'event' | 'evidence'
  size?: number
  color?: string
}

export interface NetworkEdge {
  from: string
  to: string
  label?: string
  weight?: number
  type?: 'financial' | 'communication' | 'relationship' | 'legal'
}
