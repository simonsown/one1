'use client'

import React, { useState, useTransition } from 'react'
import { Bell, Check, Trash2, Calendar, BookOpen, Award, Trophy, UserMinus } from 'lucide-react'

interface StudentProfile {
  id: string
  full_name: string
  avatar_url: string | null
}

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  data: any
  action_url: string
  is_read: boolean
  created_at: string
}

interface ParentNotificationsViewProps {
  initialNotifications: Notification[]
  students: StudentProfile[]
  markAllAsRead: () => Promise<void>
  deleteAll: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  deleteSingle: (id: string) => Promise<void>
}

type TabType = 'all' | 'lesson' | 'quiz' | 'achievement' | 'absent'

export default function ParentNotificationsView({
  initialNotifications,
  students,
  markAllAsRead,
  deleteAll,
  markAsRead,
  deleteSingle
}: ParentNotificationsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [isPending, startTransition] = useTransition()

  // Tạo map tra cứu học sinh theo id
  const studentMap = React.useMemo(() => {
    const map = new Map<string, StudentProfile>()
    students.forEach((s) => map.set(s.id, s))
    return map
  }, [students])

  // Lọc thông báo dựa trên tab đang chọn
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((notif) => {
      if (activeTab === 'all') return true
      if (activeTab === 'lesson') return notif.type === 'lesson_completed'
      if (activeTab === 'quiz') return notif.type === 'quiz_graded' || notif.type === 'child_low_score'
      if (activeTab === 'achievement') return notif.type === 'achievement_earned'
      if (activeTab === 'absent') return notif.type === 'child_absent'
      return true
    })
  }, [notifications, activeTab])

  // UI icon cho từng loại thông báo
  const getIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return <BookOpen size={16} className="text-blue-400" />
      case 'quiz_graded':
        return <Award size={16} className="text-[#00d4aa]" />
      case 'child_low_score':
        return <Award size={16} className="text-red-400" />
      case 'achievement_earned':
        return <Trophy size={16} className="text-yellow-400" />
      case 'child_absent':
        return <UserMinus size={16} className="text-orange-400" />
      default:
        return <Bell size={16} className="text-[#636678]" />
    }
  }

  // Đánh dấu tất cả là đã đọc
  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    })
  }

  // Xóa tất cả thông báo
  const handleDeleteAll = () => {
    if (!confirm('Bạn muốn xóa tất cả thông báo?')) return
    startTransition(async () => {
      await deleteAll()
      setNotifications([])
    })
  }

  // Đánh dấu đọc một thông báo
  const handleMarkSingleRead = async (id: string) => {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
  }

  // Xóa một thông báo
  const handleDeleteSingle = async (id: string) => {
    await deleteSingle(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#dde0ed] flex items-center gap-2">
            <Bell size={24} className="text-[#00d4aa]" />
            Thông báo Phụ huynh
          </h1>
          <p className="text-[#636678] mt-1 text-sm">
            Quản lý thông báo tiến độ, điểm quiz, streaks và thành tích của con.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#00d4aa]/10 hover:bg-[#00d4aa]/25 text-[#00d4aa] border border-[#00d4aa]/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <Check size={14} />
              Đã đọc tất cả
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <Trash2 size={14} />
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-white/5 no-scrollbar scroll-smooth">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'lesson', label: 'Tiến độ học' },
          { key: 'quiz', label: 'Điểm số' },
          { key: 'achievement', label: 'Thành tích' },
          { key: 'absent', label: 'Nghỉ học' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap border ${
              activeTab === tab.key
                ? 'bg-[#00d4aa]/10 border-[#00d4aa]/30 text-[#00d4aa] shadow-[0_0_15px_rgba(0,212,170,0.03)]'
                : 'bg-transparent border-transparent text-[#636678] hover:text-[#dde0ed] hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-[#111318] border border-white/5 rounded-2xl p-10 md:p-14 text-center my-6">
          <div className="w-14 h-14 bg-[#1a1c25] rounded-full flex items-center justify-center mx-auto mb-4 text-[#636678]">
            <Bell size={24} />
          </div>
          <h3 className="text-base font-bold text-[#dde0ed] mb-1">
            Không tìm thấy thông báo
          </h3>
          <p className="text-[#636678] text-xs max-w-xs mx-auto">
            Không có thông báo nào khớp với danh mục bộ lọc hiện tại của bạn.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const studentId = notif.data?.student_id
            const student = studentId ? studentMap.get(studentId) : null

            return (
              <div
                key={notif.id}
                className={`bg-[#111318] border rounded-xl p-4 transition-all hover:border-white/10 flex items-start gap-4 ${
                  notif.is_read ? 'border-white/5 opacity-60' : 'border-[#00d4aa]/20 shadow-[0_0_15px_rgba(0,212,170,0.02)]'
                }`}
              >
                {/* Loại icon */}
                <div className="w-8 h-8 rounded-lg bg-[#1a1c25] border border-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                {/* Avatar & Tên học sinh */}
                {student && (
                  <div className="flex-shrink-0 relative hidden sm:block">
                    {student.avatar_url ? (
                      <img
                        src={student.avatar_url}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                        alt={student.full_name}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#1f2130] flex items-center justify-center text-sm font-bold text-[#00d4aa] border border-white/5 uppercase">
                        {student.full_name[0] || 'S'}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 text-[10px] bg-[#1a1c25] text-[#00d4aa] px-1 rounded-md border border-white/5 font-bold uppercase scale-75">
                      Con
                    </span>
                  </div>
                )}

                {/* Nội dung thông báo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#dde0ed]">{notif.title}</span>
                    {student && (
                      <span className="text-[10px] font-bold text-[#00d4aa] sm:hidden">
                        ({student.full_name})
                      </span>
                    )}
                  </div>
                  {student && (
                    <div className="text-[10px] text-[#636678] font-bold mt-0.5 hidden sm:block">
                      Học sinh: <span className="text-[#dde0ed]">{student.full_name}</span>
                    </div>
                  )}
                  <div className="text-xs text-[#8a8d9f] mt-1.5 leading-relaxed">{notif.body}</div>

                  {/* Time Footer */}
                  <div className="flex items-center gap-1.5 text-[9px] text-[#636678] font-bold mt-3">
                    <Calendar size={11} />
                    <span>{new Date(notif.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 self-stretch sm:self-auto justify-between items-end">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkSingleRead(notif.id)}
                      className="text-[10px] font-bold text-[#00d4aa] hover:underline bg-[#00d4aa]/5 border border-[#00d4aa]/10 hover:border-[#00d4aa]/30 px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                  {notif.action_url && (
                    <a
                      href={notif.action_url}
                      className="text-[10px] font-bold text-[#dde0ed] hover:underline bg-white/5 border border-white/5 hover:border-white/10 px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                    >
                      Xem chi tiết con
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteSingle(notif.id)}
                    className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Xóa thông báo"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
