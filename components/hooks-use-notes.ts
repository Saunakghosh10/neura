'use client'

import { useState, useEffect } from 'react'
import type { Note } from '@/types/note'

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)

  useEffect(() => {
    const loadedNotes = loadNotes()
    if (loadedNotes.length > 0) {
      setNotes(loadedNotes)
      setActiveNote(loadedNotes[0])
    }
  }, [])

  const addNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'New Note',
      content: '',
      userId: '', // Will be set by the API
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      linkedFrom: [],
      linkedTo: []
    }
    setNotes([...notes, newNote])
    setActiveNote(newNote)
    saveNotes([...notes, newNote])
  }

  const updateNote = (updatedNote: Partial<Note>) => {
    if (!activeNote) return

    const updatedNotes = notes.map(note => 
      note.id === activeNote.id 
        ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() }
        : note
    )
    setNotes(updatedNotes)
    setActiveNote({ ...activeNote, ...updatedNote })
    saveNotes(updatedNotes)
  }

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    setNotes(updatedNotes)
    setActiveNote(updatedNotes[0] || null)
    saveNotes(updatedNotes)
  }

  const selectNote = (note: Note) => {
    setActiveNote(note)
  }

  return {
    notes,
    activeNote,
    addNote,
    updateNote,
    deleteNote,
    selectNote
  }
}

// Helper functions
function loadNotes(): Note[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem('notes')
  return saved ? JSON.parse(saved) : []
}

function saveNotes(notes: Note[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('notes', JSON.stringify(notes))
}