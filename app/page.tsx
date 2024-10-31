'use client'

import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Brain, 
  NetworkIcon,
  Search, 
  Edit3, 
  Layers 
} from 'lucide-react'

const features = [
  {
    icon: Edit3,
    title: "Markdown Editing Made Easy",
    description: "Capture your ideas in a fully customizable markdown editor, supporting everything from code blocks to to-do lists."
  },
  {
    icon: NetworkIcon,
    title: "Interactive Graph View",
    description: "Visualize connections between your notes with an interactive graph view. See relationships unfold in real time."
  },
  {
    icon: Search,
    title: "Advanced Search and Linking",
    description: "Find and connect your notes seamlessly with intuitive search and wiki-style linking tools."
  },
  {
    icon: Layers,
    title: "Organized, Yet Flexible",
    description: "Stay organized with a customizable folder structure and tagging system. Group notes by theme or project."
  }
]

export default function Home() {
  const { userId } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 overflow-hidden">
      {/* Grid Background */}
      <div className="relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        {/* Hero Section */}
        <div className="relative">
          <div className="px-6 lg:px-8 py-24 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-4xl text-center"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center mb-8"
              >
                <Brain className="w-12 h-12 text-primary" />
              </motion.div>
              
              <motion.h1 
                className="font-calsans text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-600 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Your Digital Mind
              </motion.h1>

              <motion.p
                className="font-outfit text-xl md:text-2xl text-muted-foreground mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Organize, Link, and Discover Knowledge Like Never Before
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                {userId ? (
                  <Link 
                    href="/notes" 
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
                  >
                    Open Neura <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                ) : (
                  <Link 
                    href="/sign-in" 
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
                  >
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-6 lg:px-8 py-24 relative">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="glass-effect p-6 rounded-xl"
                >
                  <feature.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-outfit text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
