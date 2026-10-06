'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  onSuccess: () => void
}

export default function AddMeishiForm({ onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    department: '',
    position: '',
    phone: '',
    email: '',
    address: '',
    category: '個人',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let image_filename = null

    if (imageFile) {
      const timestamp = Date.now()
      image_filename = `${timestamp}-${imageFile.name}`

      const { error: uploadError } = await supabase.storage
        .from('meishi-images')
        .upload(image_filename, imageFile)

      if (uploadError) {
        alert('画像アップロードエラー: ' + uploadError.message)
        setLoading(false)
        return
      }
    }

    const { error } = await supabase.from('meishi').insert([
      {
        ...formData,
        image_filename,
      },
    ])

    if (error) {
      alert('エラー: ' + error.message)
    } else {
      alert('名刺を追加しました')
      setFormData({
        name: '',
        company: '',
        department: '',
        position: '',
        phone: '',
        email: '',
        address: '',
        category: '個人',
        notes: '',
      })
      setImageFile(null)
      setIsOpen(false)
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <>
      {/* 右下の浮くカメラボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 z-40"
      >
        📷
      </button>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">新規追加</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-2">
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
                  rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">画像</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-gray-900"
                />
                {imageFile && <p className="text-sm text-gray-600 mt-1">{imageFile.name}</p>}
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? '追加中...' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}