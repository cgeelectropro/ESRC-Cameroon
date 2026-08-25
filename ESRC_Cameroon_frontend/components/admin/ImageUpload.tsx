'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  accept?: string
  folder?: string
}

export function ImageUpload({ value, onChange, label = 'Image', accept = 'image/*', folder = 'images' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      const data = await res.json()
      if (data.success && data.data?.url) {
        onChange(data.data.url)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Uploaded" className="w-full max-w-xs h-40 object-cover rounded-lg border border-border"/>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            <X className="w-3 h-3"/>
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin"/>
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground"/>
          )}
          <div className="text-center">
            <p className="text-sm font-medium">{uploading ? 'Uploading...' : 'Click or drag to upload'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, GIF, WebP up to 10MB</p>
          </div>
          <button
            type="button"
            disabled={uploading}
            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Upload className="w-3 h-3"/>
            Choose File
          </button>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />

      {/* Also allow direct URL input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border"/>
        <span className="text-xs text-muted-foreground">or paste URL</span>
        <div className="flex-1 h-px bg-border"/>
      </div>
      <input
        type="url"
        placeholder="https://..."
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  )
}
