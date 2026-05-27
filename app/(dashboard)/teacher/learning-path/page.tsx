'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createPath, updateItemOrder, setUnlockCondition } from '@/actions/learning-path'
import { Plus, ArrowUp, ArrowDown, Lock, Unlock, Settings, Trash, RefreshCw } from 'lucide-react'

export default function TeacherLearningPathPage() {
  const [paths, setPaths] = useState<any[]>([])
  const [selectedPath, setSelectedPath] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // New Path Form
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  
  // New Item Form
  const [itemTitle, setItemTitle] = useState('')
  const [itemType, setItemType] = useState<'lesson' | 'quiz' | 'lab_session'>('lesson')
  const [itemMinutes, setItemMinutes] = useState(30)
  
  const supabase = createClientComponentClient()

  const loadPaths = async () => {
    setLoading(true)
    const { data: lp } = await supabase.from('learning_paths').select('*').order('created_at', { ascending: false })
    if (lp && lp.length > 0) {
      setPaths(lp)
      setSelectedPath(lp[0])
      await loadItems(lp[0].id)
    }
    setLoading(false)
  }

  const loadItems = async (pathId: string) => {
    const { data: pi } = await supabase
      .from('path_items')
      .select('*')
      .eq('path_id', pathId)
      .order('order', { ascending: true })
    if (pi) setItems(pi)
  }

  useEffect(() => {
    loadPaths()
  }, [])

  const handleCreatePath = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setSaving(true)
    try {
      const path = await createPath(newTitle, newDesc)
      setPaths([path, ...paths])
      setSelectedPath(path)
      setItems([])
      setNewTitle('')
      setNewDesc('')
    } catch (err) {
      alert('Lỗi khi tạo lộ trình.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemTitle.trim() || !selectedPath) return

    setSaving(true)
    const nextOrder = items.length + 1
    
    // Default unlock condition for items after the first one is 'complete_previous'
    const defaultUnlock = nextOrder === 1 ? null : { type: 'complete_previous' }

    const { data: newItem, error } = await supabase
      .from('path_items')
      .insert({
        path_id: selectedPath.id,
        title: itemTitle,
        item_type: itemType,
        estimated_minutes: itemMinutes,
        order: nextOrder,
        unlock_condition: defaultUnlock
      })
      .select()
      .single()

    if (!error && newItem) {
      setItems([...items, newItem])
      setItemTitle('')
    }
    setSaving(false)
  }

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase.from('path_items').delete().eq('id', itemId)
    if (!error) {
      const updated = items.filter(i => i.id !== itemId).map((item, idx) => ({
        ...item,
        order: idx + 1
      }))
      setItems(updated)
      // Update DB orders
      await updateItemOrder(selectedPath.id, updated.map(u => ({ id: u.id, order: u.order })))
    }
  }

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    
    if (targetIdx < 0 || targetIdx >= newItems.length) return

    // Swap items
    const temp = newItems[index]
    newItems[index] = newItems[targetIdx]
    newItems[targetIdx] = temp

    // Re-assign orders
    const updated = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1
    }))

    setItems(updated)

    // Save orders in DB
    await updateItemOrder(selectedPath.id, updated.map(u => ({ id: u.id, order: u.order })))
  }

  const toggleUnlockCondition = async (item: any) => {
    // Toggles between Always open (null) and Complete previous
    const isCurrentlyLocked = !!item.unlock_condition
    const newCondition = isCurrentlyLocked ? null : { type: 'complete_previous' }
    
    setItems(items.map(i => i.id === item.id ? { ...i, unlock_condition: newCondition } : i))
    await setUnlockCondition(item.id, newCondition)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e13] text-white pt-24 flex flex-col items-center justify-center gap-2">
        <RefreshCw size={28} className="animate-spin text-[#00d4aa]" />
        <span className="text-xs text-gray-500">Đang tải cấu hình lộ trình...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0e13] text-white pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Paths Manager & Create forms */}
        <div className="space-y-6">
          <div className="bg-[#1a1c25] border border-gray-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Lộ trình học tập</h2>
            <div className="space-y-2">
              {paths.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPath(p); loadItems(p.id); }}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${selectedPath?.id === p.id ? 'border-[#00d4aa] bg-[#00d4aa]/10 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1c25] border border-gray-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3">Tạo lộ trình mới</h3>
            <form onSubmit={handleCreatePath} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Tên lộ trình..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] transition-colors"
              />
              <textarea
                placeholder="Mô tả lộ trình học..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-[#00d4aa] text-[#0d0e13] font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
              >
                Tạo lộ trình
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Timeline builder */}
        <div className="md:col-span-2 space-y-6">
          {selectedPath ? (
            <>
              {/* Add Item form */}
              <div className="bg-[#1a1c25] border border-gray-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-md font-bold text-white mb-4">Thêm nhiệm vụ vào lộ trình</h3>
                <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tên nhiệm vụ</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Lắp Ráp CPU vào Mainboard"
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Loại bài</label>
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value as any)}
                      className="w-full bg-[#1e202f]/50 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00d4aa] transition-colors"
                    >
                      <option value="lesson">📖 Bài học</option>
                      <option value="quiz">📝 Trắc nghiệm</option>
                      <option value="lab_session">⚙️ Thực hành</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2.5 bg-[#00d4aa] text-[#0d0e13] font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Thêm bài
                  </button>
                </form>
              </div>

              {/* Items List */}
              <div className="bg-[#1a1c25] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-md font-bold text-white mb-2">Chi tiết tiến trình bài giảng</h3>
                
                {items.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-xs">
                    Chưa có bài giảng nào trong lộ trình này.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={item.id} className="p-4 bg-[#1e202f]/50 border border-gray-800 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#00d4aa] w-6">#{item.order}</span>
                          <div>
                            <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">
                              {item.item_type === 'quiz' ? '📝 TRẮC NGHIỆM' : item.item_type === 'lab_session' ? '⚙️ THỰC HÀNH' : '📖 BÀI HỌC'}
                            </p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                          {/* Move up / down */}
                          <button
                            disabled={idx === 0}
                            onClick={() => moveItem(idx, 'up')}
                            className="p-1.5 bg-gray-800 rounded hover:bg-gray-700 text-gray-400 disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            disabled={idx === items.length - 1}
                            onClick={() => moveItem(idx, 'down')}
                            className="p-1.5 bg-gray-800 rounded hover:bg-gray-700 text-gray-400 disabled:opacity-30"
                          >
                            <ArrowDown size={14} />
                          </button>

                          {/* Toggle Lock */}
                          <button
                            onClick={() => toggleUnlockCondition(item)}
                            className={`p-1.5 rounded flex items-center gap-1 text-[10px] font-bold border transition-colors ${item.unlock_condition ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#00d4aa]/10 border-[#00d4aa]/30 text-[#00d4aa]'}`}
                          >
                            {item.unlock_condition ? <Lock size={12} /> : <Unlock size={12} />}
                            {item.unlock_condition ? 'Khóa tuần tự' : 'Mở tự do'}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 hover:bg-red-500/20"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-[#1a1c25] border border-gray-800 rounded-2xl text-gray-500">
              Hãy tạo hoặc chọn một Lộ trình ở cột bên trái để bắt đầu sắp xếp.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
