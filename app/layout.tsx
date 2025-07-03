
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import Navigation from '@/components/navigation'
import AccessibilityControls from '@/components/accessibility-controls'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'The Combs Trial: An Interactive Timeline',
  description: 'Comprehensive data visualization of the Sean "Diddy" Combs federal sex trafficking trial proceedings.',
  keywords: ['Sean Combs', 'Diddy', 'trial', 'data visualization', 'court proceedings', 'legal analysis'],
  authors: [{ name: 'Trial Tracker' }],
  openGraph: {
    title: 'The Combs Trial: An Interactive Timeline',
    description: 'Comprehensive data visualization of the Sean "Diddy" Combs federal sex trafficking trial proceedings.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Combs Trial: An Interactive Timeline',
    description: 'Comprehensive data visualization of the Sean "Diddy" Combs federal sex trafficking trial proceedings.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} dark`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1e1b4b" />
        <meta name="color-scheme" content="dark light" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip to main content for screen readers */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          <div className="relative min-h-screen">
            <Navigation />
            <main id="main-content" className="pt-16">
              {children}
            </main>
            <AccessibilityControls />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
