'use client'

import { useRef, useEffect, useCallback } from 'react'
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Quote, Link, Minus, Eraser, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}

type ToolbarItem =
  | { type: 'separator' }
  | {
      type: 'button'
      label: string
      icon: React.ReactNode
      command?: string
      value?: string
      action?: (editor: HTMLDivElement) => void
    }

const TOOLBAR: ToolbarItem[] = [
  {
    type: 'button', label: 'Heading 1', icon: <Heading1 size={14} />,
    action: (el) => formatHeading(el, 'h1'),
  },
  {
    type: 'button', label: 'Heading 2', icon: <Heading2 size={14} />,
    action: (el) => formatHeading(el, 'h2'),
  },
  {
    type: 'button', label: 'Heading 3', icon: <Heading3 size={14} />,
    action: (el) => formatHeading(el, 'h3'),
  },
  { type: 'separator' },
  { type: 'button', label: 'Bold', icon: <Bold size={14} />, command: 'bold' },
  { type: 'button', label: 'Italic', icon: <Italic size={14} />, command: 'italic' },
  { type: 'button', label: 'Underline', icon: <Underline size={14} />, command: 'underline' },
  { type: 'button', label: 'Strikethrough', icon: <Strikethrough size={14} />, command: 'strikeThrough' },
  { type: 'separator' },
  { type: 'button', label: 'Bullet list', icon: <List size={14} />, command: 'insertUnorderedList' },
  { type: 'button', label: 'Numbered list', icon: <ListOrdered size={14} />, command: 'insertOrderedList' },
  { type: 'separator' },
  { type: 'button', label: 'Blockquote', icon: <Quote size={14} />, action: (el) => wrapBlockquote(el) },
  { type: 'button', label: 'Divider', icon: <Minus size={14} />, command: 'insertHorizontalRule' },
  { type: 'separator' },
  {
    type: 'button', label: 'Align left', icon: <AlignLeft size={14} />,
    command: 'justifyLeft',
  },
  {
    type: 'button', label: 'Align center', icon: <AlignCenter size={14} />,
    command: 'justifyCenter',
  },
  {
    type: 'button', label: 'Align right', icon: <AlignRight size={14} />,
    command: 'justifyRight',
  },
  { type: 'separator' },
  {
    type: 'button', label: 'Insert link', icon: <Link size={14} />,
    action: (el) => insertLink(el),
  },
  {
    type: 'button', label: 'Clear formatting', icon: <Eraser size={14} />,
    command: 'removeFormat',
  },
]

function formatHeading(el: HTMLDivElement, tag: 'h1' | 'h2' | 'h3') {
  // Wrap or unwrap selected text in heading tag
  document.execCommand('formatBlock', false, tag)
}

function wrapBlockquote(el: HTMLDivElement) {
  document.execCommand('formatBlock', false, 'blockquote')
}

function insertLink(el: HTMLDivElement) {
  const selection = window.getSelection()
  const selectedText = selection?.toString() || ''
  const url = window.prompt('Enter URL:', 'https://')
  if (url) {
    el.focus()
    if (selectedText) {
      document.execCommand('createLink', false, url)
    } else {
      const linkText = window.prompt('Link text:', url) || url
      document.execCommand(
        'insertHTML',
        false,
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`,
      )
    }
  }
}

export function RichTextEditor({ value, onChange, placeholder, className, minHeight = 300 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const lastValueRef = useRef<string>(value)

  // Sync external value → DOM.
  // Only update if the new value genuinely differs from what's in the DOM
  // (avoids resetting cursor position while the user is typing).
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    // Always sync when the value changes from outside (e.g. switching lessons)
    if (el.innerHTML !== value) {
      el.innerHTML = value
      lastValueRef.current = value
    }
  }, [value])

  const handleInput = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    const html = el.innerHTML
    lastValueRef.current = html
    onChange(html)
  }, [onChange])

  const execCmd = useCallback((item: ToolbarItem) => {
    if (item.type === 'separator') return
    const el = editorRef.current
    if (!el) return
    el.focus()
    if (item.action) {
      item.action(el)
    } else if (item.command) {
      document.execCommand(item.command, false, item.value)
    }
    // Trigger onChange after command
    const html = el.innerHTML
    lastValueRef.current = html
    onChange(html)
  }, [onChange])

  // Handle paste — strip external styles, keep structure
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const html = e.clipboardData.getData('text/html')
    const text = e.clipboardData.getData('text/plain')
    if (html) {
      // Insert cleaned HTML
      const clean = html
        .replace(/ style="[^"]*"/g, '') // strip inline styles
        .replace(/ class="[^"]*"/g, '') // strip class names
      document.execCommand('insertHTML', false, clean)
    } else {
      // Plain text — convert newlines to <br>
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
      document.execCommand('insertHTML', false, escaped)
    }
    const el = editorRef.current
    if (el) {
      lastValueRef.current = el.innerHTML
      onChange(el.innerHTML)
    }
  }, [onChange])

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-background', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/40">
        {TOOLBAR.map((item, i) => {
          if (item.type === 'separator') {
            return <span key={i} className="w-px h-5 bg-border mx-1 inline-block" />
          }
          return (
            <button
              key={i}
              type="button"
              title={item.label}
              onMouseDown={(e) => {
                e.preventDefault() // prevent editor blur
                execCmd(item)
              }}
              className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.icon}
            </button>
          )
        })}
      </div>

      {/* Heading size selector */}
      <div className="flex items-center gap-2 px-2 py-1 border-b border-border bg-muted/20 text-xs">
        <span className="text-muted-foreground">Font size:</span>
        <select
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            const el = editorRef.current
            if (!el) return
            el.focus()
            document.execCommand('fontSize', false, e.target.value)
            const html = el.innerHTML
            lastValueRef.current = html
            onChange(html)
          }}
          className="text-xs bg-transparent border border-border rounded px-1 py-0.5 text-foreground"
          defaultValue="3"
        >
          <option value="1">Small</option>
          <option value="2">Normal–</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">Larger</option>
          <option value="6">X-Large</option>
        </select>

        <span className="text-muted-foreground ml-2">Colour:</span>
        <input
          type="color"
          defaultValue="#000000"
          title="Text color"
          onInput={(e) => {
            const el = editorRef.current
            if (!el) return
            el.focus()
            document.execCommand('foreColor', false, (e.target as HTMLInputElement).value)
            const html = el.innerHTML
            lastValueRef.current = html
            onChange(html)
          }}
          className="w-6 h-6 rounded cursor-pointer border border-border p-0"
        />

        <span className="text-muted-foreground">Highlight:</span>
        <input
          type="color"
          defaultValue="#ffff00"
          title="Highlight color"
          onInput={(e) => {
            const el = editorRef.current
            if (!el) return
            el.focus()
            document.execCommand('hiliteColor', false, (e.target as HTMLInputElement).value)
            const html = el.innerHTML
            lastValueRef.current = html
            onChange(html)
          }}
          className="w-6 h-6 rounded cursor-pointer border border-border p-0"
        />
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder || 'Start writing your article content here…'}
        style={{ minHeight }}
        className={cn(
          'px-4 py-3 focus:outline-none text-foreground text-sm leading-relaxed',
          // Heading styles inside editor
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3',
          '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2',
          '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1.5',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-esrc-green-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3',
          '[&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2',
          '[&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-2',
          '[&_li]:mb-1',
          '[&_a]:text-esrc-green-700 [&_a]:underline',
          '[&_hr]:border-border [&_hr]:my-4',
          // Placeholder
          'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:pointer-events-none',
        )}
      />
    </div>
  )
}
