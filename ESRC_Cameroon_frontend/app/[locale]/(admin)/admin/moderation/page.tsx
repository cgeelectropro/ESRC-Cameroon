'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Check, X, FileText, Briefcase, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface PubItem { id: string; title: string; abstract?: string; type: string; authors?: string[]; createdAt: string }
interface OppItem { id: string; title: string; description?: string; type: string; organization: string; createdAt: string }
interface ForumPost { id: string; title: string; content?: string; createdAt: string; user?: { firstName?: string; lastName?: string; email?: string } }
interface ModerationData {
  pendingPublications: PubItem[]
  pendingOpportunities: OppItem[]
  recentForumPosts?: ForumPost[]
  counts: { publications: number; opportunities: number; forumPosts?: number }
}

export default function AdminModerationPage() {
  const [data, setData] = useState<ModerationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError('')
    apiClient.getAdminModeration()
      .then(r => {
        if (r.success && r.data) {
          const d = r.data as unknown as ModerationData
          setData({
            pendingPublications: d.pendingPublications ?? [],
            pendingOpportunities: d.pendingOpportunities ?? [],
            recentForumPosts: d.recentForumPosts ?? [],
            counts: {
              publications: d.counts?.publications ?? 0,
              opportunities: d.counts?.opportunities ?? 0,
              forumPosts: d.counts?.forumPosts ?? 0,
            },
          })
        } else {
          setError('Failed to load moderation queue')
        }
      })
      .catch(() => setError('Failed to load moderation queue'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const approve = async (type: string, id: string) => {
    setProcessing(id)
    const r = await apiClient.approveAdminItem(type, id)
    if (r.success) { toast.success('Approved'); load() }
    else toast.error('Failed')
    setProcessing(null)
  }

  const reject = async (type: string, id: string) => {
    if (!confirm('Reject and remove this item?')) return
    setProcessing(id)
    const r = await apiClient.rejectAdminItem(type, id)
    if (r.success) { toast.success('Rejected and removed'); load() }
    else toast.error('Failed')
    setProcessing(null)
  }

  const totalPending = (data?.counts.publications ?? 0) + (data?.counts.opportunities ?? 0)

  if (loading) return <div className="p-8"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mt-20" /></div>

  if (error) return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Content Moderation</h1>
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-destructive text-sm">{error}</div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground mt-1">{totalPending} items pending review</p>
      </div>

      <div className="space-y-8">
        {/* Publications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-orange-500"/>
            <h2 className="font-semibold text-lg">Pending Publications <span className="text-sm text-muted-foreground font-normal">({data?.counts.publications ?? 0})</span></h2>
          </div>
          {!data?.pendingPublications?.length ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">No pending publications</div>
          ) : (
            <div className="space-y-3">
              {data.pendingPublications.map(p => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">{p.type.replace(/_/g,' ')}</span>
                      <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{p.title}</h3>
                    {p.abstract && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.abstract}</p>}
                    <p className="text-xs text-muted-foreground mt-2">By {(p.authors ?? []).join(', ') || 'Unknown'}</p>
                  </div>
                  <div className="flex gap-2 items-start shrink-0">
                    <button disabled={processing===p.id} onClick={()=>approve('publication',p.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"><Check className="w-4 h-4"/>Approve</button>
                    <button disabled={processing===p.id} onClick={()=>reject('publication',p.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"><X className="w-4 h-4"/>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opportunities */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-blue-500"/>
            <h2 className="font-semibold text-lg">Pending Opportunities <span className="text-sm text-muted-foreground font-normal">({data?.counts.opportunities ?? 0})</span></h2>
          </div>
          {!data?.pendingOpportunities?.length ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">No pending opportunities</div>
          ) : (
            <div className="space-y-3">
              {data.pendingOpportunities.map(o => (
                <div key={o.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{o.type}</span>
                      <span className="text-xs text-muted-foreground">{o.organization}</span>
                      <span className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{o.title}</h3>
                    {o.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{o.description}</p>}
                  </div>
                  <div className="flex gap-2 items-start shrink-0">
                    <button disabled={processing===o.id} onClick={()=>approve('opportunity',o.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"><Check className="w-4 h-4"/>Approve</button>
                    <button disabled={processing===o.id} onClick={()=>reject('opportunity',o.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"><X className="w-4 h-4"/>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Forum Posts */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-purple-500"/>
            <h2 className="font-semibold text-lg">Recent Forum Posts <span className="text-sm text-muted-foreground font-normal">({data?.counts.forumPosts ?? 0})</span></h2>
          </div>
          {!data?.recentForumPosts?.length ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">No recent forum posts</div>
          ) : (
            <div className="space-y-3">
              {data.recentForumPosts.map(fp => (
                <div key={fp.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">
                      {fp.user ? `${fp.user.firstName || ''} ${fp.user.lastName || ''}`.trim() || fp.user.email : 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(fp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{fp.title}</h3>
                  {fp.content && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{fp.content}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
