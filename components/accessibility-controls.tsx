
'use client'

import { useState, useEffect } from 'react'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X } from 'lucide-react'

export default function AccessibilityControls() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    reducedMotion,
    highContrast,
    largeText,
    screenReaderMode,
    setReducedMotion,
    setHighContrast,
    setLargeText,
    setScreenReaderMode,
    resetSettings,
  } = useAccessibilityStore()

  // Apply accessibility settings to document
  useEffect(() => {
    const html = document.documentElement
    
    // Apply classes to HTML element
    html.classList.toggle('accessibility-reduced-motion', reducedMotion)
    html.classList.toggle('accessibility-high-contrast', highContrast)
    html.classList.toggle('accessibility-large-text', largeText)
    html.classList.toggle('dark', true) // Default to dark theme as per PRD
    
    // Store in data attributes for CSS targeting
    html.setAttribute('data-reduced-motion', reducedMotion.toString())
    html.setAttribute('data-high-contrast', highContrast.toString())
    html.setAttribute('data-large-text', largeText.toString())
    html.setAttribute('data-screen-reader', screenReaderMode.toString())
  }, [reducedMotion, highContrast, largeText, screenReaderMode])

  const toggleControl = (setting: string, value: boolean, setter: (value: boolean) => void) => {
    setter(!value)
    // Announce change to screen readers
    const announcement = `${setting} ${!value ? 'enabled' : 'disabled'}`
    const ariaLive = document.createElement('div')
    ariaLive.setAttribute('aria-live', 'polite')
    ariaLive.setAttribute('aria-atomic', 'true')
    ariaLive.className = 'sr-only'
    ariaLive.textContent = announcement
    document.body.appendChild(ariaLive)
    setTimeout(() => document.body.removeChild(ariaLive), 1000)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 no-print">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-accent text-accent-foreground p-3 rounded-full shadow-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-200"
        aria-label="Open accessibility controls"
        aria-expanded={isOpen}
        onKeyDown={handleKeyDown}
      >
        <Settings className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-16 right-0 bg-card text-card-foreground rounded-lg shadow-xl p-6 w-80 border border-border z-50"
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-title"
              onKeyDown={handleKeyDown}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 id="accessibility-title" className="text-lg font-semibold">
                  Accessibility Settings
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label="Close accessibility controls"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="reduced-motion" className="text-sm font-medium">
                    Reduce Motion
                    <div className="text-xs text-muted-foreground">Disable animations and parallax effects</div>
                  </label>
                  <button
                    id="reduced-motion"
                    onClick={() => toggleControl('Reduced motion', reducedMotion, setReducedMotion)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                      reducedMotion ? 'bg-accent' : 'bg-muted'
                    }`}
                    role="switch"
                    aria-checked={reducedMotion}
                    aria-describedby="reduced-motion-desc"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                        reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="high-contrast" className="text-sm font-medium">
                    High Contrast
                    <div className="text-xs text-muted-foreground">Increase visual contrast for clarity</div>
                  </label>
                  <button
                    id="high-contrast"
                    onClick={() => toggleControl('High contrast', highContrast, setHighContrast)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                      highContrast ? 'bg-accent' : 'bg-muted'
                    }`}
                    role="switch"
                    aria-checked={highContrast}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                        highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="large-text" className="text-sm font-medium">
                    Large Text
                    <div className="text-xs text-muted-foreground">Increase font sizes for readability</div>
                  </label>
                  <button
                    id="large-text"
                    onClick={() => toggleControl('Large text', largeText, setLargeText)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                      largeText ? 'bg-accent' : 'bg-muted'
                    }`}
                    role="switch"
                    aria-checked={largeText}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                        largeText ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="screen-reader" className="text-sm font-medium">
                    Screen Reader Mode
                    <div className="text-xs text-muted-foreground">Optimize for assistive technology</div>
                  </label>
                  <button
                    id="screen-reader"
                    onClick={() => toggleControl('Screen reader mode', screenReaderMode, setScreenReaderMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                      screenReaderMode ? 'bg-accent' : 'bg-muted'
                    }`}
                    role="switch"
                    aria-checked={screenReaderMode}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                        screenReaderMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <button
                  onClick={resetSettings}
                  className="w-full bg-muted text-muted-foreground py-2 px-4 rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors"
                >
                  Reset All Settings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
