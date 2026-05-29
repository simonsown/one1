'use client'

import React, { useState } from 'react'
import { updatePreferences } from '@/actions/profile'
import { toast } from 'react-hot-toast'

interface Props {
  preferences: {
    email_notifications: boolean
    push_notifications: boolean
    weekly_digest: boolean
    theme: 'dark' | 'light' | 'system'
    language: 'vi' | 'en'
  }
}

export function PreferencesForm({ preferences }: Props) {
  const [emailNotif, setEmailNotif] = useState(preferences.email_notifications)
  const [pushNotif, setPushNotif] = useState(preferences.push_notifications)
  const [weeklyDigest, setWeeklyDigest] = useState(preferences.weekly_digest)
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(preferences.theme || 'dark')
  const [language, setLanguage] = useState<'vi' | 'en'>(preferences.language || 'vi')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updatePreferences({
        email_notifications: emailNotif,
        push_notifications: pushNotif,
        weekly_digest: weeklyDigest,
        theme,
        language
      })
      toast.success('Đã lưu cấu hình cài đặt!')
    } catch (err: any) {
      toast.error('Lỗi khi lưu cài đặt.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Notifications toggles */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thông báo nhận</h4>
        
        <label className="flex items-center justify-between p-3 bg-[#f1f1f1]/30 border border-gray-200 rounded-xl cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-gray-900">Thông báo qua Email</p>
            <p className="text-[10px] text-gray-500">Nhận thông báo chấm điểm, bài học mới qua email.</p>
          </div>
          <input 
            type="checkbox" 
            checked={emailNotif}
            onChange={(e) => setEmailNotif(e.target.checked)}
            className="w-4 h-4 rounded accent-[#089e60]"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-[#f1f1f1]/30 border border-gray-200 rounded-xl cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-gray-900">Thông báo đẩy (Push Notifications)</p>
            <p className="text-[10px] text-gray-500">Hiển thị thông báo Toast trực tiếp khi dùng app.</p>
          </div>
          <input 
            type="checkbox" 
            checked={pushNotif}
            onChange={(e) => setPushNotif(e.target.checked)}
            className="w-4 h-4 rounded accent-[#089e60]"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-[#f1f1f1]/30 border border-gray-200 rounded-xl cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-gray-900">Báo cáo học tập tuần</p>
            <p className="text-[10px] text-gray-500">Nhận báo cáo tóm tắt tiến trình học tập hàng tuần.</p>
          </div>
          <input 
            type="checkbox" 
            checked={weeklyDigest}
            onChange={(e) => setWeeklyDigest(e.target.checked)}
            className="w-4 h-4 rounded accent-[#089e60]"
          />
        </label>
      </div>

      {/* Theme and Language grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Giao diện (Theme)</label>
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="w-full bg-[#f1f1f1]/50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-[#089e60]"
          >
            <option value="dark">🌙 Dark Mode</option>
            <option value="light">☀️ Light Mode</option>
            <option value="system">🖥️ System Default</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ngôn ngữ</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="w-full bg-[#f1f1f1]/50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-[#089e60]"
          >
            <option value="vi">🇻🇳 Tiếng Việt</option>
            <option value="en">🇺🇸 English</option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={saving}
        className="w-full py-3 bg-[#089e60] text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
      </button>
    </form>
  )
}
