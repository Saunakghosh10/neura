import { create } from 'zustand'
import type { Note } from '@/types/note'

export type FileType = 'file' | 'folder'

export interface FileSystemItem {
  id: string
  type: FileType
  name: string
  title: string
  parentId: string | null
  content: string
  createdAt: string
  updatedAt: string
  linkedFrom: string[]
  linkedTo: string[]
}

interface FileSystemState {
  items: FileSystemItem[]
  activeItemId: string | null
  loading: boolean
  error: string | null
  setActiveItemId: (id: string | null) => void
  fetchNotes: () => Promise<void>
  createItem: (title: string) => Promise<FileSystemItem>
  updateItem: (id: string, updates: Partial<FileSystemItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  moveItem: (id: string, newParentId: string | null) => Promise<void>
  updateNote: (id: string, data: { title: string; content: string }) => Promise<void>
}

export const useFileSystem = create<FileSystemState>((set, get) => ({
  items: [],
  activeItemId: null,
  loading: false,
  error: null,

  setActiveItemId: (id) => set({ activeItemId: id }),

  fetchNotes: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/notes')
      if (!res.ok) throw new Error('Failed to fetch notes')
      const notes: Note[] = await res.json()
      set({ 
        items: notes.map((note) => ({
          id: note.id,
          type: 'file' as const,
          name: `${note.title}.md`,
          title: note.title,
          parentId: null,
          content: note.content || '',
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          linkedFrom: note.linkedFrom.map((link: { targetNote: { id: string } }) => link.targetNote.id),
          linkedTo: note.linkedTo.map((link: { sourceNote: { id: string } }) => link.sourceNote.id)
        })), 
        loading: false 
      })
    } catch (error) {
      console.error('Failed to fetch notes:', error)
      set({ error: 'Failed to fetch notes', loading: false })
    }
  },

  createItem: async (title: string) => {
    set({ loading: true })
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          content: ''
        })
      })
      if (!res.ok) throw new Error('Failed to create note')
      const note = await res.json()
      const newItem = {
        id: note.id,
        type: 'file' as const,
        name: `${note.title}.md`,
        title: note.title,
        parentId: null,
        content: note.content || '',
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        linkedFrom: note.linkedFrom?.map((link: { targetNote: { id: string } }) => link.targetNote.id) || [],
        linkedTo: note.linkedTo?.map((link: { sourceNote: { id: string } }) => link.sourceNote.id) || []
      }
      
      set(state => ({ 
        items: [...state.items, newItem],
        activeItemId: newItem.id,
        loading: false 
      }))
      return newItem
    } catch (error) {
      console.error('Failed to create note:', error)
      set({ error: 'Failed to create note', loading: false })
      throw error
    }
  },

  updateItem: async (id, updates) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updates.name?.replace('.md', ''),
          content: updates.content
        })
      })
      if (!res.ok) throw new Error('Failed to update note')
      const note = await res.json()
      set(state => ({
        items: state.items.map(item =>
          item.id === id ? {
            ...item,
            name: `${note.title}.md`,
            content: note.content
          } : item
        ),
        loading: false
      }))
    } catch (error) {
      console.error('Failed to update note:', error)
      set({ error: 'Failed to update note', loading: false })
    }
  },

  deleteItem: async (id) => {
    set({ loading: true })
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete note')
      set(state => ({
        items: state.items.filter(item => item.id !== id),
        loading: false
      }))
    } catch (error) {
      console.error('Failed to delete note:', error)
      set({ error: 'Failed to delete note', loading: false })
    }
  },

  moveItem: async (id, newParentId) => {
    set(state => ({
      items: state.items.map(item =>
        item.id === id ? { ...item, parentId: newParentId } : item
      )
    }))
  },

  updateNote: async (id: string, data: { title: string; content: string }) => {
    set({ loading: true, error: null });
    try {
      const linkRegex = /\[\[(.*?)\]\]/g;
      const links = Array.from(data.content.matchAll(linkRegex)).map(match => match[1]);
      
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          linkedTo: links
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update note');
      }
      
      const updatedNote = await res.json();
      
      set(state => ({
        items: state.items.map(item =>
          item.id === id ? {
            ...item,
            ...updatedNote,
            linkedTo: updatedNote.linkedTo?.map((link: { sourceNote: { id: string } }) => link.sourceNote.id) || [],
            linkedFrom: updatedNote.linkedFrom?.map((link: { targetNote: { id: string } }) => link.targetNote.id) || []
          } : item
        ),
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Failed to update note:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update note', 
        loading: false 
      });
      throw error;
    }
  },
})) 