'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bold, Italic, List, Heading, Code,
  CheckSquare, Link as LinkIcon,
  Edit, Eye,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { LinkSuggester } from './link-suggester'
import getCaretCoordinates from 'textarea-caret-position'
import type { Components } from 'react-markdown'

interface MarkdownEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
  onSave?: (value: string) => void
}

export function MarkdownEditor({ initialValue = '', onChange, onSave }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialValue)
  const debouncedContent = useDebounce(content, 2000)
  const lastSavedContent = useRef(initialValue)
  const saveInProgress = useRef(false)
  const [activeTab, setActiveTab] = useState('edit')
  const [linkSuggester, setLinkSuggester] = useState<{
    query: string;
    position: { x: number; y: number };
  } | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!saveInProgress.current && debouncedContent !== lastSavedContent.current) {
      const saveContent = async () => {
        try {
          saveInProgress.current = true
          await onChange?.(debouncedContent)
          lastSavedContent.current = debouncedContent
        } finally {
          saveInProgress.current = false
        }
      }
      saveContent()
    }
  }, [debouncedContent, onChange])

  const handleKeyCommand = async (e: React.KeyboardEvent) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (!saveInProgress.current) {
        try {
          saveInProgress.current = true
          await onSave?.(content)
          lastSavedContent.current = content
        } finally {
          saveInProgress.current = false
        }
      }
    }
  }

  const insertMarkdown = (markdown: string) => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value

    const before = text.substring(0, start)
    const selection = text.substring(start, end)
    const after = text.substring(end)

    const newContent = `${before}${markdown}${selection}${after}`
    setContent(newContent)
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + markdown.length,
        start + markdown.length + selection.length
      )
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const value = textarea.value
    const selectionStart = textarea.selectionStart

    // Check for [[ to trigger link suggester
    if (e.key === '[' && value[selectionStart - 1] === '[') {
      const rect = textarea.getBoundingClientRect()
      const coordinates = getCaretCoordinates(textarea, selectionStart, { debug: false })
      
      setLinkSuggester({
        query: '',
        position: {
          x: rect.left + coordinates.left,
          y: rect.top + coordinates.top
        }
      })
      return
    }

    // Update link suggester query
    if (linkSuggester) {
      if (e.key === ']' && value[selectionStart] === ']') {
        // Close suggester when typing ]]
        setLinkSuggester(null)
        return
      }

      const lastOpenBrackets = value.lastIndexOf('[[', selectionStart)
      if (lastOpenBrackets !== -1) {
        const query = value.slice(lastOpenBrackets + 2, selectionStart)
        setLinkSuggester(prev => prev ? { ...prev, query } : null)
      }
    }
  }

  const insertLink = (name: string) => {
    if (!editorRef.current) return

    const textarea = editorRef.current
    const value = textarea.value
    const selectionStart = textarea.selectionStart
    const lastOpenBrackets = value.lastIndexOf('[[', selectionStart)

    if (lastOpenBrackets !== -1) {
      const newValue = 
        value.slice(0, lastOpenBrackets) + 
        `[[${name}]]` + 
        value.slice(selectionStart)

      setContent(newValue)
      textarea.value = newValue
      const newPosition = lastOpenBrackets + name.length + 4
      textarea.setSelectionRange(newPosition, newPosition)
    }

    setLinkSuggester(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col h-full min-h-[calc(100vh-12rem)]"
      onKeyDown={handleKeyCommand}
    >
      <Tabs defaultValue="write" className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <TabsList className="bg-background/50">
            <TabsTrigger value="write" className="data-[state=active]:bg-primary/20">
              <Edit className="h-4 w-4 mr-2" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-primary/20">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <motion.div className="flex gap-2" layout>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('**')}
              className="hover:bg-primary/20"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <Bold className="h-4 w-4" />
              </motion.div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('*')}
              className="hover:bg-primary/20"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <Italic className="h-4 w-4" />
              </motion.div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('# ')}
              className="hover:bg-primary/20"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <Heading className="h-4 w-4" />
              </motion.div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('- ')}
              className="hover:bg-primary/20"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <List className="h-4 w-4" />
              </motion.div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('```\n\n```')}
              className="hover:bg-primary/20"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <Code className="h-4 w-4" />
              </motion.div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('- [ ] ')}
              className="hover:bg-primary/20"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <CheckSquare className="h-4 w-4" />
              </motion.div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('[](url)')}
              className="hover:bg-primary/20"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <LinkIcon className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
        </div>

        <TabsContent value="write" className="flex-1 mt-0 h-full">
          <textarea
            ref={editorRef}
            value={content}
            onChange={handleChange}
            className="w-full h-full resize-none p-4 bg-background/50 focus:outline-none leading-relaxed"
            placeholder="Start writing..."
            style={{ minHeight: 'calc(100vh - 16rem)' }}
          />
        </TabsContent>

        <TabsContent value="preview" className="flex-1 mt-0 h-full overflow-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-sm dark:prose-invert max-w-none p-4 bg-white/5 rounded-lg h-full"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  if (inline) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }

                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : ''

                  return (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={language}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  )
                }
              }}
              className="text-white leading-relaxed"
            >
              {content}
            </ReactMarkdown>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
} 