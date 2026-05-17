'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Notification } from '@/hooks/useNotifications'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { CheckCheck } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) {
        setNotifications(data as Notification[])
      }
      setLoading(false)
    }
    loadData()
  }, [supabase])

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e13] text-white pt-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0e13] text-white pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-row items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Tất cả thông báo</h1>
          
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-[#00d4aa] hover:bg-[#00d4aa]/10 px-4 py-2 rounded-lg transition-colors"
          >
            <CheckCheck size={20} />
            <span className="font-medium">Đánh dấu tất cả đã đọc</span>
          </button>
        </div>

        <div className="bg-[#1a1c25] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Bạn không có thông báo nào.
            </div>
          ) : (
            notifications.map(notif => (
              <NotificationItem 
                key={notif.id} 
                notification={notif} 
                onRead={markAsRead} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
