'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FileText, Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface SidebarItem {
  id: string;
  name: string;
  content?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  onCreateItem: (title: string) => void;
  onUpdateItem: (id: string, title: string) => void;
  onDeleteItem: (id: string) => void;
}

export default function Sidebar({ 
  items = [], 
  activeItemId, 
  onSelectItem, 
  onCreateItem,
  onUpdateItem,
  onDeleteItem 
}: SidebarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [editingNote, setEditingNote] = useState<{ id: string, title: string } | null>(null)

  const handleCreateNote = () => {
    if (newNoteTitle.trim()) {
      onCreateItem(newNoteTitle.trim())
      setNewNoteTitle('')
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditNote = () => {
    if (editingNote && editingNote.title.trim()) {
      onUpdateItem(editingNote.id, editingNote.title.trim())
      setEditingNote(null)
      setIsEditDialogOpen(false)
    }
  }

  return (
    <>
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-background/50 backdrop-blur-sm p-4 flex flex-col h-full border-r border-border/50"
      >
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="mb-4 bg-primary hover:bg-primary/90 group relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={false}
            whileHover={{ scale: 1.5 }}
            transition={{ duration: 0.3 }}
          />
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>

        <ScrollArea className="flex-1 pr-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all mb-2 group relative",
                    activeItemId === item.id 
                      ? "bg-primary/20 text-primary-foreground shadow-lg" 
                      : "hover:bg-accent/50"
                  )}
                  onClick={() => onSelectItem(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className="text-primary"
                    >
                      <FileText className="h-4 w-4" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {item.name.replace('.md', '')}
                      </div>
                      {item.content && (
                        <div className="text-sm text-muted-foreground truncate mt-0.5">
                          {item.content.slice(0, 50)}
                          {item.content.length > 50 && '...'}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingNote({ id: item.id, title: item.name.replace('.md', '') })
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to delete this note?')) {
                            onDeleteItem(item.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {activeItemId === item.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.2 }}
                    />
                  )}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </motion.div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <Input
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="Enter note title..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateNote()
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note Title</DialogTitle>
          </DialogHeader>
          <Input
            value={editingNote?.title || ''}
            onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
            placeholder="Enter note title..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleEditNote()
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditNote}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 