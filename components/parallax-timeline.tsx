
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAccessibilityStore } from '@/lib/stores/accessibility'
import TrialDayCard from './trial-day-card'
import type { TrialDay } from '@/lib/types'

interface ParallaxTimelineProps {
  trialDays: TrialDay[]
}

export default function ParallaxTimeline({ trialDays }: ParallaxTimelineProps) {
  const router = useRouter()
  const { reducedMotion } = useAccessibilityStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const timelineY = useTransform(
    smoothProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [0, -100]
  )

  const backgroundY = useTransform(
    smoothProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [0, -200]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCardClick = (trialDayNumber: number) => {
    router.push(`/day/${trialDayNumber}`)
  }

  if (!mounted) {
    return null
  }

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* Background with parallax effect */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90"
      />

      {/* Fixed Timeline Line */}
      <motion.div
        style={{ y: timelineY }}
        className="fixed left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-accent/50 via-accent to-accent/50 transform -translate-x-1/2 z-10 parallax-element"
      />

      {/* Timeline Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            The Combs Trial
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            An interactive timeline documenting 28 days of proceedings in the federal sex trafficking trial 
            against music mogul Sean "Diddy" Combs. Explore comprehensive data visualizations of witness 
            testimonies, evidence presentations, and key legal developments.
          </p>
        </motion.header>

        {/* Trial Days Grid */}
        <div className="space-y-12">
          {trialDays.map((trialDay, index) => {
            const isEven = index % 2 === 0
            
            return (
              <motion.div
                key={trialDay.id}
                className={`relative flex ${isEven ? 'justify-start' : 'justify-end'}`}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: reducedMotion ? 0.01 : 0.6, 
                  delay: reducedMotion ? 0 : index * 0.1,
                  ease: "easeOut" 
                }}
              >
                {/* Timeline connector */}
                <div className={`absolute top-6 w-8 h-1 bg-accent z-30 ${
                  isEven 
                    ? 'right-0 translate-x-full' 
                    : 'left-0 -translate-x-full'
                }`} />
                
                {/* Timeline dot */}
                <div className={`absolute top-4 w-4 h-4 bg-accent rounded-full border-4 border-background z-30 ${
                  isEven 
                    ? 'right-0 translate-x-1/2' 
                    : 'left-0 -translate-x-1/2'
                }`} />

                {/* Card Container */}
                <div className={`w-full max-w-md ${isEven ? 'mr-12' : 'ml-12'}`}>
                  <TrialDayCard
                    trialDay={trialDay}
                    index={index}
                    onClick={() => handleCardClick(trialDay.trialDayNumber)}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reducedMotion ? 0.01 : 0.8, ease: "easeOut" }}
          className="text-center mt-20 pt-12 border-t border-border/50"
        >
          <p className="text-muted-foreground mb-4">
            All data presented is based on verified court proceedings and public records.
          </p>
          <p className="text-sm text-muted-foreground">
            This interactive timeline provides comprehensive analysis of the trial proceedings 
            while maintaining journalistic integrity and factual accuracy.
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
