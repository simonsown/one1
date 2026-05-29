'use client'

import React, { useState } from 'react'
import { useDiscussion, Thread } from '@/hooks/useDiscussion'
import { ThreadCard } from './ThreadCard'
import { ThreadDetail } from './ThreadDetail'
import { NewThreadModal } from './NewThreadModal'
import { MessageSquare, Plus, RefreshCw } from 'lucide-react'

interface DiscussionPanelProps {
  lessonId: string
  currentUserId: string
  userRole: 'student' | 'teacher'
}

export default function DiscussionPanel({ lessonId, currentUserId, userRole }: DiscussionPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unanswered' | 'pinned'>('all')
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [showNewThread, setShowNewThread] = useState(false)
  const { threads, isLoading, createThread } = useDiscussion(lessonId, activeTab)

  const handleCreateThread = async (title: string, body: string, type: 'question' | 'discussion' | 'announcement') => {
    await createThread(title, body, type, currentUserId)
  }

  if (selectedThread) {
    return (
      <div className="h-full">
        <ThreadDetail 
          thread={selectedThread} 
          currentUserId={currentUserId}
          onBack={() => setSelectedThread(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#ffffff]/20 rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-[#ffffff]/50 flex items-center justify-between flex-shrink-0">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <MessageSquare size={16} className="text-[#089e60]" />
          <span>Thảo luận ({threads.length})</span>
        </h3>
        <button
          onClick={() => setShowNewThread(true)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#089e60]/10 border border-[#089e60]/30 text-[#089e60] hover:bg-[#089e60]/20 transition-all font-semibold"
        >
          <Plus size={14} /> Hỏi đáp
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 py-2 border-b border-gray-200/50 bg-[#ffffff]/10 gap-2 flex-shrink-0">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${activeTab === 'all' ? 'bg-[#089e60] text-white' : 'text-gray-400 hover:text-gray-900'}`}
        >
          Tất cả
        </button>
        {userRole === 'teacher' && (
          <button 
            onClick={() => setActiveTab('unanswered')}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${activeTab === 'unanswered' ? 'bg-[#089e60] text-white' : 'text-gray-400 hover:text-gray-900'}`}
          >
            Chưa trả lời
          </button>
        )}
        <button 
          onClick={() => setActiveTab('pinned')}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${activeTab === 'pinned' ? 'bg-[#089e60] text-white' : 'text-gray-400 hover:text-gray-900'}`}
        >
          Ghim
        </button>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-500">
            <RefreshCw size={24} className="animate-spin text-[#089e60]" />
            <span className="text-xs">Đang tải thảo luận...</span>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            Không có câu hỏi nào.
          </div>
        ) : (
          threads.map(thread => (
            <ThreadCard 
              key={thread.id} 
              thread={thread} 
              onSelect={setSelectedThread} 
            />
          ))
        )}
      </div>

      {/* Modal */}
      <NewThreadModal 
        isOpen={showNewThread} 
        onClose={() => setShowNewThread(false)} 
        onSubmit={handleCreateThread}
        userRole={userRole}
      />
    </div>
  )
}
export { DiscussionPanel }
