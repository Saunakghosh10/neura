'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Note } from '@/types/note'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SidebarComponentProps {
  notes: Note[]
  activeNote: Note | null
  onSelectNote: (note: Note) => void
  onAddNote: () => void
}

export function SidebarComponent({ 
  notes, 
  activeNote, 
  onSelectNote, 
  onAddNote 
}: SidebarComponentProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-64 bg-background/50 backdrop-blur-sm p-4 flex flex-col h-full border-r border-border/50">
      <Input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Button 
        onClick={onAddNote} 
        className="mb-4 bg-primary hover:bg-primary/90"
      >
        New Note
      </Button>
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredNotes.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "p-2 rounded-lg cursor-pointer transition-colors",
                activeNote?.id === note.id 
                  ? "bg-primary/20 text-primary-foreground" 
                  : "hover:bg-accent"
              )}
              onClick={() => onSelectNote(note)}
            >
              <div className="font-medium truncate">
                {note.title}
              </div>
              {note.content && (
                <div className="text-sm text-muted-foreground truncate">
                  {note.content.slice(0, 50)}
                  {note.content.length > 50 && '...'}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}