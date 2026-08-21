'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Meishi = {
  id: string
  name: string
  company: string
  department: string
  position: string
  phone: string
  email: string
  address: string
  category: string
  notes: string
  image_filename?: string
  created_at: string
}

type Props = {
  meishi: Meishi
  onUpdate: () => void
  onSelect: (meishi: Meishi) => void
  isSelected: boolean
}

export default function MeishiRow({ meishi, onUpdate, onSelect, isSelected }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(meishi)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('meishi')
      .update(formData)
      .eq('id', meishi.id)

    if (error) {
      alert('エラー: ' + error.message)
    } else {
      alert('更新しました')
      setIsEditOpen(false)
      onUpdate()
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return

    const { error } = await supabase
      .from('meishi')
      .delete()
      .eq('id', meishi.id)

    if (error) {
      alert('エラー: ' + error.message)
    } else {
      alert('削除しました')
      onUpdate()
    }
  }

  const imageUrl = meishi.image_filename
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/meishi-images/${meishi.image_filename}`
    : null

  return (
    <>
      <tr
        className={`border-b hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
        onClick={() => onSelect(meishi)}
      >
        <td className="p-3">
          <div className="flex gap-3 items-start">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="名刺"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsImageModalOpen(true)
                }}
                className="w-20 h-14 object-cover rounded cursor-pointer hover:opacity-80 flex-shrink-0"
              />
            )}
            <div className="text-sm">
              <div className="font-bold text-gray-900">{meishi.name}</div>
              <div className="text-gray-600">{meishi.company}</div>
              {(meishi.department || meishi.position) && (
                <div className="text-gray-500 text-xs">
                  {meishi.department}
                  {meishi.department && meishi.position && ' / '}
                  {meishi.position}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="p-3 text-sm text-gray-900">☎ {meishi.phone}</td>
        <td className="p-3 text-sm text-gray-900">✉ {meishi.email}</td>
        <td className="p-3 text-sm text-gray-900">📍 {meishi.address}</td>
        <td className="p-3 text-sm">
          <div className="flex gap-2 items-center">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              meishi.category === '個人' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {meishi.category}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditOpen(true)
              }}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              編集
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              削除
            </button>
          </div>
        </td>
      </tr>

      {/* 編集モーダル */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">名刺を編集</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">名前 *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">会社</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">部署</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">役職</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">電話</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">メール</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">住所</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">分類</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                >
                  <option>個人</option>
                  <option>共有</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">メモ</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 画像拡大モーダル */}
      {isImageModalOpen && imageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl">
            <img
              src={imageUrl}
              alt="名刺"
              className="max-w-full max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}