'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api-client'
import { useAuthOptional } from '@/contexts/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MessageCircle, MessageSquare, Plus, X } from 'lucide-react'
import { ForumPost as ForumPostComponent } from '@/components/community/ForumPost'

interface ForumPostType {
  id: string
  title: string
  author: string
  category: string
  content: string
  views: number
  replies: number
  likes: number
  pinned: boolean
  createdAt: Date | string
  user?: { firstName: string; lastName: string }
}

const CATEGORY_KEYS = [
  { key: 'all', value: 'all' },
  { key: 'entrepreneurship', value: 'Entrepreneurship' },
  { key: 'technology', value: 'Technology' },
  { key: 'agriculture', value: 'Agriculture' },
  { key: 'finance', value: 'Finance' },
  { key: 'impact', value: 'Impact Measurement' },
  { key: 'women', value: 'Women in Business' },
  { key: 'partnerships', value: 'Partnerships' },
]

export default function CommunityPage() {
  const t = useTranslations('community')
  const auth = useAuthOptional()
  const isAuthenticated = auth?.isAuthenticated ?? false

  const [posts, setPosts] = useState<ForumPostType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Entrepreneurship' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  const fetchPosts = async () => {
    try {
      const res = await apiClient.getForumPosts()
      if (res.success && res.data) {
        const raw = (Array.isArray(res.data) ? res.data : []) as ForumPostType[]
        // Normalise author field from nested user object
        const normalised = raw.map((p) => ({
          ...p,
          author: p.author ?? (p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Anonymous'),
        }))
        setPosts(normalised)
      }
    } catch (err) {
      console.error('Failed to fetch forum posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const filteredPosts = posts.filter((post) => {
    const matchCategory =
      selectedCategory === 'all' ||
      post.category?.toLowerCase() === selectedCategory.toLowerCase()
    const matchSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const handleSubmitPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return
    if (!isAuthenticated) {
      setSubmitError(t('newPost.loginRequired'))
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await apiClient.createForumPost(newPost)
      if (res.success) {
        setModalOpen(false)
        setNewPost({ title: '', content: '', category: 'Entrepreneurship' })
        await fetchPosts()
      } else {
        setSubmitError(res.error || 'Failed to post')
      }
    } catch {
      setSubmitError('Failed to post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        imageKey="community"
      />

      <main className="flex-grow section-padding">
        <div className="container-width space-y-8">
          {/* Search and Create */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
              <MessageSquare size={18} className="absolute left-3 top-3 text-muted-foreground" />
            </div>
            <Button
              className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white px-6 gap-2"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={18} />
              {t('startDiscussion')}
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_KEYS.map(({ key, value }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(value === 'all' ? 'all' : value)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  (value === 'all' && selectedCategory === 'all') ||
                  (value !== 'all' && selectedCategory === value)
                    ? 'bg-esrc-green-700 text-white'
                    : 'bg-card text-foreground border border-border hover:border-primary'
                }`}
              >
                {t(`categories.${key}`)}
              </button>
            ))}
          </div>

          {/* Forum Posts */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-esrc-green-700 mx-auto mb-4" />
                <p className="text-muted-foreground">{t('loading')}</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-card p-12 rounded-lg border text-center">
                <MessageCircle size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">{t('noDiscussions')}</p>
                <Button
                  className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white gap-2"
                  onClick={() => setModalOpen(true)}
                >
                  <Plus size={18} />
                  {t('beFirst')}
                </Button>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isLiked = likedIds.has(post.id)
                return (
                  <ForumPostComponent
                    key={post.id}
                    post={post}
                    isLiked={isLiked}
                    displayLikes={isLiked ? post.likes + 1 : post.likes}
                    onLike={handleLike}
                  />
                )
              })
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* New Discussion Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{t('newPost.title')}</DialogTitle>
          </DialogHeader>

          {!isAuthenticated ? (
            <div className="py-6 text-center">
              <MessageCircle size={40} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">{t('newPost.loginRequired')}</p>
              <Button
                className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white"
                onClick={() => setModalOpen(false)}
              >
                <X size={16} className="mr-2" />
                {t('newPost.cancel')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="post-title">{t('newPost.titleLabel')}</Label>
                <Input
                  id="post-title"
                  placeholder={t('newPost.titlePlaceholder')}
                  value={newPost.title}
                  onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-category">{t('newPost.categoryLabel')}</Label>
                <select
                  id="post-category"
                  value={newPost.category}
                  onChange={(e) => setNewPost((p) => ({ ...p, category: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORY_KEYS.filter((c) => c.key !== 'all').map(({ key, value }) => (
                    <option key={key} value={value}>
                      {t(`categories.${key}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-content">{t('newPost.contentLabel')}</Label>
                <Textarea
                  id="post-content"
                  placeholder={t('newPost.contentPlaceholder')}
                  value={newPost.content}
                  onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))}
                  rows={5}
                />
              </div>

              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  {t('newPost.cancel')}
                </Button>
                <Button
                  className="flex-1 bg-esrc-green-700 hover:bg-esrc-green-900 text-white"
                  onClick={handleSubmitPost}
                  disabled={submitting || !newPost.title.trim() || !newPost.content.trim()}
                >
                  {submitting ? t('newPost.submitting') : t('newPost.submit')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
