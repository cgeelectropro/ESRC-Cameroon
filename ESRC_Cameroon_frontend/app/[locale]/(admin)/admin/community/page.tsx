'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pin, PinOff, Trash2, ChevronDown, ChevronUp, Search, RefreshCw, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Reply = {
  id: string
  content: string
  user: { firstName: string; lastName: string; avatar: string }
  createdAt: string
  likeCount: number
}

type Post = {
  id: string
  title: string
  content: string
  category: string
  isPinned: boolean
  viewCount: number
  likeCount: number
  createdAt: string
  user: { id: string; firstName: string; lastName: string; role: string }
  _count: { replies: number }
  _expanded?: boolean
  _replies?: Reply[]
}

const CATEGORIES = ['ALL', 'GENERAL', 'ANNOUNCEMENTS', 'Q_AND_A', 'RESOURCES', 'EVENTS', 'PROJECTS']

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandLoadingId, setExpandLoadingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const params: Record<string, string> = { page: '1', limit: '50' }
    if (search) params.search = search
    if (category !== 'ALL') params.category = category
    const res = await apiClient.getAdminForumPosts(params)
    if (res.success && res.data) {
      const d = res.data as { items: Post[]; total: number }
      setPosts(d.items.map((p) => ({ ...p, _expanded: false, _replies: [] })))
      setTotal(d.total)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [category])

  const togglePin = async (post: Post) => {
    await apiClient.updateAdminForumPost(post.id, { isPinned: !post.isPinned })
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, isPinned: !p.isPinned } : p))
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post and all its replies?')) return
    setDeletingId(id)
    await apiClient.deleteAdminForumPost(id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setDeletingId(null)
  }

  const deleteReply = async (postId: string, replyId: string) => {
    if (!confirm('Delete this reply?')) return
    await apiClient.deleteAdminForumReply(replyId)
    setPosts((prev) => prev.map((p) =>
      p.id === postId
        ? { ...p, _replies: p._replies?.filter((r) => r.id !== replyId), _count: { replies: (p._count.replies || 1) - 1 } }
        : p
    ))
  }

  const toggleExpand = async (post: Post) => {
    if (post._expanded) {
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, _expanded: false } : p))
      return
    }
    setExpandLoadingId(post.id)
    try {
      const res = await fetch(`/api/community/forum/${post.id}`)
      const data = await res.json()
      const replies = data?.data?.replies || data?.replies || []
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, _expanded: true, _replies: replies } : p))
    } catch {
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, _expanded: true } : p))
    }
    setExpandLoadingId(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Community / Forum</h1>
        <p className="text-muted-foreground text-sm mt-1">Moderate forum posts and replies</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-1.5" />Refresh
        </Button>
        <span className="text-sm text-muted-foreground ml-auto">{total} posts total</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title / Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Replies</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Likes</TableHead>
              <TableHead className="text-center">Pinned</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : posts.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No posts found</TableCell></TableRow>
            ) : posts.map((post) => (
              <>
                <TableRow key={post.id} className={post.isPinned ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}>
                  <TableCell className="max-w-xs">
                    <button
                      className="font-medium text-sm text-left hover:text-primary transition-colors line-clamp-2"
                      onClick={() => toggleExpand(post)}
                    >
                      {post.isPinned && <Pin className="inline w-3 h-3 mr-1 text-amber-500" />}
                      {post.title}
                    </button>
                    <p className="text-xs text-muted-foreground mt-0.5">{post.user.firstName} {post.user.lastName}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {post.category?.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm">{post._count.replies}</TableCell>
                  <TableCell className="text-center text-sm">{post.viewCount}</TableCell>
                  <TableCell className="text-center text-sm">{post.likeCount}</TableCell>
                  <TableCell className="text-center">
                    <button onClick={() => togglePin(post)} className="hover:opacity-80 transition-opacity">
                      {post.isPinned
                        ? <PinOff className="w-4 h-4 text-amber-500" />
                        : <Pin className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => toggleExpand(post)}
                        disabled={expandLoadingId === post.id}
                      >
                        {post._expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deletePost(post.id)}
                        disabled={deletingId === post.id}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {post._expanded && (
                  <TableRow key={`${post.id}-expand`}>
                    <TableCell colSpan={8} className="bg-muted/30 px-8 py-4">
                      <p className="text-sm text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                      {post._replies && post._replies.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />Replies ({post._replies.length})
                          </p>
                          {post._replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3 bg-card rounded-lg px-4 py-3 border border-border">
                              <img
                                src={reply.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.id}`}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground">{reply.user.firstName} {reply.user.lastName}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">{reply.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">{new Date(reply.createdAt).toLocaleString()}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                                onClick={() => deleteReply(post.id, reply.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No replies</p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
