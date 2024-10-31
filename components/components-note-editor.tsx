'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import type { Note } from '@/types/note'

interface NoteEditorComponentProps {
  note: Note | null
  onUpdateNote: (note: Partial<Note>) => void
  onDeleteNote: (id: string) => void
}

export function NoteEditorComponent({ note, onUpdateNote, onDeleteNote }: NoteEditorComponentProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content || '')
    } else {
      setTitle('')
      setContent('')
    }
  }, [note])

  const handleSave = () => {
    if (note) {
      onUpdateNote({ 
        ...note, 
        title, 
        content 
      })
    }
  }

  if (!note) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-muted-foreground text-center">
          <p className="text-lg mb-2">Select a note to edit</p>
          <p className="text-sm">or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 flex flex-col">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="mb-4"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note here..."
        className="flex-1 mb-4 min-h-[300px] resize-none"
      />
      <div className="flex justify-between">
        <Button 
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90"
        >
          Save
        </Button>
        <Button 
          variant="destructive" 
          onClick={() => onDeleteNote(note.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}