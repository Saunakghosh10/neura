'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFileSystem } from '@/store/use-file-system'
import { useDebounce } from '@/hooks/use-debounce'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  content: string
  matches: {
    text: string
    index: number
  }[]
}

interface SearchBarProps {
  onFileSelect: (fileId: string) => void;
}

export function SearchBar({ onFileSelect }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { items } = useFileSystem()
  const debouncedQuery = useDebounce(query, 200)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      return
    }

    try {
      // Escape special characters in the search query
      const escapedQuery = debouncedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      
      const searchResults = items
        .filter(item => item.type === 'file')
        .map(item => {
          const matches: { text: string, index: number }[] = []
          
          try {
            const regex = new RegExp(escapedQuery, 'gi')
            let match

            // Search in filename (case-insensitive)
            const normalizedName = item.name.toLowerCase()
            const normalizedQuery = debouncedQuery.toLowerCase()
            if (normalizedName.includes(normalizedQuery)) {
              matches.push({
                text: item.name,
                index: -1 // Special index for filename matches
              })
            }

            // Search in content
            const content = item.content || ''
            while ((match = regex.exec(content)) !== null) {
              const start = Math.max(0, match.index - 40)
              const end = Math.min(content.length, match.index + 40)
              matches.push({
                text: '...' + content.slice(start, end) + '...',
                index: match.index
              })
            }
          } catch (error) {
            console.error('Regex error:', error)
          }

          return {
            id: item.id,
            name: item.name,
            content: item.content || '',
            matches
          }
        })
        .filter(result => result.matches.length > 0)

      setResults(searchResults)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    }
  }, [debouncedQuery, items])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => (i + 1) % Math.max(1, results.length))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => (i - 1 + results.length) % Math.max(1, results.length))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const handleSelect = (result: SearchResult) => {
    try {
      onFileSelect(result.id)
      setIsOpen(false)
      setQuery('')
    } catch (error) {
      console.error('Error selecting file:', error)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search notes...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[850px] p-0">
          <div className="flex flex-col h-[600px]">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search across all notes..."
                className="h-12 border-0 focus-visible:ring-0"
                autoFocus
              />
            </div>
            <ScrollArea className="flex-1">
              <AnimatePresence mode="wait">
                {results.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col"
                  >
                    {results.map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelect(result)}
                        className={cn(
                          "flex flex-col gap-1 px-4 py-3 cursor-pointer",
                          selectedIndex === index && "bg-accent",
                          "hover:bg-accent/50 transition-colors"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 opacity-70" />
                          <span className="font-medium">{result.name}</span>
                        </div>
                        {result.matches.map((match, i) => (
                          <div key={i} className="pl-6 text-sm text-muted-foreground">
                            {match.index === -1 ? (
                              <div className="flex items-center gap-1 text-primary">
                                <ArrowRight className="h-3 w-3" />
                                Filename match
                              </div>
                            ) : (
                              <div dangerouslySetInnerHTML={{
                                __html: match.text.replace(
                                  new RegExp(query, 'gi'),
                                  (match) => `<mark class="bg-primary/20 text-primary rounded px-1">${match}</mark>`
                                )
                              }} />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : query ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found
                  </div>
                ) : null}
              </AnimatePresence>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 