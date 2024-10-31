'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText } from 'lucide-react'
import { useFileSystem } from '@/store/use-file-system'
import { cn } from '@/lib/utils'

interface LinkSuggesterProps {
  query: string
  position: { x: number; y: number }
  onSelect: (name: string) => void
  onClose: () => void
}

export function LinkSuggester({ query, position, onSelect, onClose }: LinkSuggesterProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { items } = useFileSystem()
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredItems = items
    .filter(item => 
      item.type === 'file' && 
      item.name.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(i => (i + 1) % filteredItems.length)
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(i => (i - 1 + filteredItems.length) % filteredItems.length)
          break
        case 'Enter':
          event.preventDefault()
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex].name.replace('.md', ''))
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [filteredItems, selectedIndex, onSelect, onClose])

  if (!filteredItems.length) return null

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute z-50 w-64 bg-popover border rounded-md shadow-md"
      style={{
        top: position.y + 'px',
        left: position.x + 'px'
      }}
    >
      <div className="py-1">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.name.replace('.md', ''))}
            className={cn(
              "flex items-center gap-2 px-3 py-2 cursor-pointer",
              selectedIndex === index && "bg-accent",
              "hover:bg-accent/50 transition-colors"
            )}
          >
            <FileText className="h-4 w-4 opacity-70" />
            <span className="text-sm">{item.name.replace('.md', '')}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
} 