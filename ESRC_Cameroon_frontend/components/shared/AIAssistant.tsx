'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api-client'
import {
  MessageCircle, X, Send, Loader, Copy, Check, Trash2,
  ChevronDown, Bot, Sparkles, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

// Simple markdown renderer: bold, bullet lists, numbered lists, inline code
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = (key: string) => {
    if (listItems.length === 0) return
    if (listType === 'ul') {
      elements.push(
        <ul key={key} className="list-disc pl-4 space-y-0.5 my-1">
          {listItems.map((li, i) => <li key={i} className="text-sm">{renderInline(li)}</li>)}
        </ul>
      )
    } else {
      elements.push(
        <ol key={key} className="list-decimal pl-4 space-y-0.5 my-1">
          {listItems.map((li, i) => <li key={i} className="text-sm">{renderInline(li)}</li>)}
        </ol>
      )
    }
    listItems = []
    listType = null
  }

  lines.forEach((line, idx) => {
    const bulletMatch = line.match(/^[-*•]\s+(.+)/)
    const numberedMatch = line.match(/^\d+\.\s+(.+)/)

    if (bulletMatch) {
      if (listType === 'ol') flushList(`list-${idx}-ol`)
      listType = 'ul'
      listItems.push(bulletMatch[1])
    } else if (numberedMatch) {
      if (listType === 'ul') flushList(`list-${idx}-ul`)
      listType = 'ol'
      listItems.push(numberedMatch[1])
    } else {
      flushList(`list-${idx}`)
      if (line.trim() === '') {
        if (elements.length > 0) elements.push(<div key={`sp-${idx}`} className="h-1" />)
      } else {
        elements.push(<p key={`p-${idx}`} className="text-sm leading-relaxed">{renderInline(line)}</p>)
      }
    }
  })
  flushList('list-end')
  return elements
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-muted px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>
    }
    return part
  })
}

const MAX_CHARS = 500

// Contextual suggestion groups based on keywords in conversation
const getSuggestions = (history: Message[], t: ReturnType<typeof useTranslations>) => {
  const last = history[history.length - 1]?.text.toLowerCase() || ''
  if (/course|cours|learn|apprendre/.test(last)) return [t('suggestions.findCourse'), t('suggestions.findInstructor'), t('suggestions.certificate')]
  if (/business|entreprise|startup|idea|idée/.test(last)) return [t('suggestions.validateIdea'), t('suggestions.businessPlan'), t('suggestions.funding')]
  if (/event|événement/.test(last)) return [t('suggestions.events'), t('suggestions.register')]
  if (/mentor|advis|conseil/.test(last)) return [t('suggestions.advisory'), t('suggestions.bookSession')]
  return [t('suggestions.findCourse'), t('suggestions.businessPlan'), t('suggestions.events'), t('suggestions.register')]
}

export function AIAssistant() {
  const t = useTranslations('ai')
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Draggable button
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const hasDragged = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    hasDragged.current = false
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - dragStart.current.mx
      const dy = e.clientY - dragStart.current.my
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy })
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  useEffect(() => {
    setMessages([{ id: '1', text: t('greeting'), sender: 'bot', timestamp: new Date() }])
  }, [t])

  useEffect(() => {
    if (!isMinimized) scrollToBottom()
  }, [messages, isMinimized])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScroll = () => {
    const el = messagesContainerRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    setShowScrollBtn(!isNearBottom)
  }

  const copyMessage = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const clearHistory = () => {
    setMessages([{ id: Date.now().toString(), text: t('greeting'), sender: 'bot', timestamp: new Date() }])
  }

  const handleSend = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMessage: Message = { id: Date.now().toString(), text: msg, sender: 'user', timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const history = messages
        .filter(m => m.id !== '1')
        .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }))

      const res = await apiClient.aiChat(msg, history)
      const replyText = (res.success && res.data && (res.data as { reply?: string }).reply) || t('trouble')

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: 'bot',
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: t('error'),
        sender: 'bot',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const suggestions = getSuggestions(messages, t)
  const charCount = input.length
  const charWarning = charCount > MAX_CHARS * 0.8

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onMouseDown={onMouseDown}
          onClick={() => { if (!hasDragged.current) setIsOpen(true) }}
          style={{ bottom: `${24 - pos.y}px`, right: `${24 - pos.x}px` }}
          className="fixed z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 flex items-center justify-center transition-colors select-none group"
          aria-label={t('open')}
          title={t('open')}
        >
          <Bot size={24} className="group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-esrc-gold rounded-full flex items-center justify-center">
            <Sparkles size={10} className="text-black" />
          </span>
        </button>
      )}

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm" aria-hidden onClick={() => setIsOpen(false)} />

          <div className={cn(
            "fixed bottom-6 right-6 z-50 w-[26rem] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border transition-all duration-200",
            isMinimized ? "h-14" : "max-h-[85vh] h-[620px]"
          )}>
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">{t('title')}</h3>
                  <p className="text-xs opacity-70 leading-tight">{t('statusOnline')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearHistory} className="p-1.5 hover:bg-primary-foreground/20 rounded-lg transition-colors" title={t('clearHistory')} aria-label={t('clearHistory')}>
                  <Trash2 size={14} />
                </button>
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-primary-foreground/20 rounded-lg transition-colors" aria-label="Minimize">
                  <ChevronDown size={14} className={cn("transition-transform", isMinimized && "rotate-180")} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-primary-foreground/20 rounded-lg transition-colors" aria-label="Close">
                  <X size={14} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30"
                >
                  {messages.map(msg => (
                    <div key={msg.id} className={cn("flex", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                      {msg.sender === 'bot' && (
                        <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                          <Bot size={12} className="text-primary" />
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[78%] group relative",
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5'
                          : 'bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm'
                      )}>
                        <div className={msg.sender === 'user' ? 'text-sm' : ''}>
                          {msg.sender === 'bot' ? renderMarkdown(msg.text) : <p className="text-sm">{msg.text}</p>}
                        </div>
                        <div className="flex items-center justify-between mt-1.5 gap-2">
                          <span className="text-[10px] opacity-50">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.sender === 'bot' && (
                            <button
                              onClick={() => copyMessage(msg.id, msg.text)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
                              aria-label="Copy message"
                            >
                              {copiedId === msg.id
                                ? <Check size={11} className="text-green-500" />
                                : <Copy size={11} className="text-muted-foreground" />
                              }
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Bot size={12} className="text-primary" />
                      </div>
                      <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Scroll to bottom button */}
                {showScrollBtn && (
                  <button
                    onClick={scrollToBottom}
                    className="absolute bottom-[120px] right-4 w-8 h-8 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-10"
                  >
                    <ChevronDown size={16} />
                  </button>
                )}

                {/* Suggestion Chips */}
                <div className="px-3 py-2 border-t border-border/50 bg-card/50 flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
                  {suggestions.slice(0, 4).map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleSend(chip)}
                      disabled={loading}
                      className="text-xs px-3 py-1.5 rounded-full bg-accent text-primary hover:bg-accent/70 transition-colors disabled:opacity-40 whitespace-nowrap shrink-0 border border-border/50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border bg-card shrink-0">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder={t('placeholder')}
                        value={input}
                        onChange={e => setInput(e.target.value.slice(0, MAX_CHARS))}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !loading) { e.preventDefault(); handleSend() } }}
                        disabled={loading}
                        className="pr-10 rounded-xl border-border/70"
                      />
                      {loading && (
                        <button
                          onClick={() => setLoading(false)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                          title="Stop"
                          aria-label="Stop generation"
                        >
                          <RefreshCw size={14} className="text-muted-foreground animate-spin" />
                        </button>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSend()}
                      disabled={loading || !input.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 rounded-xl h-10 shrink-0"
                      aria-label="Send"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                  {charWarning && (
                    <p className={cn("text-[10px] mt-1 text-right", charCount >= MAX_CHARS ? "text-red-500" : "text-amber-500")}>
                      {charCount}/{MAX_CHARS}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}
