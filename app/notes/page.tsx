'use client'

import { UserButton } from "@clerk/nextjs";
import Sidebar from "@/components/sidebar";
import { MarkdownEditor } from "@/components/markdown-editor";
import { useFileSystem } from "@/store/use-file-system";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraphView } from '@/components/graph-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchBar } from '@/components/search-bar'

export default function NotesPage() {
  const { items, activeItemId, setActiveItemId, updateNote, createItem, updateItem, deleteItem, fetchNotes } = useFileSystem();
  const [isLoading, setIsLoading] = useState(true);
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('editor');
  
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
      return;
    }
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (userId) {
      fetchNotes().catch(console.error);
    }
  }, [userId, fetchNotes]);

  const activeFile = items.find(item => item.id === activeItemId && item.type === 'file');

  // Handle file selection
  const handleFileSelect = (fileId: string) => {
    setActiveItemId(fileId);
    setActiveTab('editor'); // Switch to editor tab when file is selected
  };

  const handleNoteChange = async (content: string) => {
    if (!activeFile) return;
    
    try {
      await updateNote(activeFile.id, {
        title: activeFile.name.replace('.md', ''),
        content: content
      });
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  // Add handler for creating new items
  const handleCreateItem = (title: string) => {
    createItem(title);
  };

  const handleUpdateItem = async (id: string, title: string) => {
    try {
      await updateItem(id, { name: `${title}.md` });
    } catch (error) {
      console.error('Failed to update note title:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
      if (activeItemId === id) {
        setActiveItemId(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
        />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen bg-background"
    >
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 glass-effect"
      >
        <Sidebar 
          items={items}
          activeItemId={activeItemId}
          onSelectItem={handleFileSelect}
          onCreateItem={handleCreateItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col"
      >
        <header className="glass-effect border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-bold gradient-text"
            >
              Neura
            </motion.h1>
            <div className="flex items-center gap-4">
              <SearchBar onFileSelect={handleFileSelect} />
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "purple-glow"
                  }
                }}
              />
            </div>
          </div>
        </header>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="graph">Graph View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="flex-1 mt-0">
            <AnimatePresence mode="wait">
              <motion.main 
                key={activeFile?.id || 'empty'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 p-4 overflow-auto h-[calc(100vh-10rem)] min-h-0"
              >
                {activeFile ? (
                  <MarkdownEditor
                    key={activeFile.id}
                    initialValue={activeFile.content || ''}
                    onChange={handleNoteChange}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-muted-foreground text-center"
                    >
                      <p className="text-lg mb-2">Select a file to edit</p>
                      <p className="text-sm text-primary-light">or create a new one</p>
                    </motion.div>
                  </div>
                )}
              </motion.main>
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="graph" className="flex-1 mt-0 h-[calc(100vh-8rem)]">
            <div className="h-full">
              <GraphView 
                items={items}
                activeItemId={activeItemId}
                onSelectItem={handleFileSelect}
              />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
} 