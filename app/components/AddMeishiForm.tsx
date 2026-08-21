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
  const [imagePreview, setImagePreview] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    name_kana: '',
    company: '',
    company_kana: '',
    department: '',
    position: '',
    phone: '',
    company_phone: '',
    fax: '',
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
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let imageFilename = ''

    // 画像があればアップロード
    if (imageFile) {
      const timestamp = Date.now()
      const filename = `${timestamp}-${imageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('meishi-images')
        .upload(filename, imageFile)

      if (uploadError) {
        alert('画像のアップロードエラー: ' + uploadError.message)
        setLoading(false)
        return
      }

      imageFilename = filename
    }

    // 名刺データを保存
    const { error } = await supabase.from('meishi').insert([
      {
        name: formData.name,
        company: formData.company,
        department: formData.department,
        position: formData.position,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        category: formData.category,
        notes: formData.notes,
        image_filename: imageFilename,
      },
    ])

    if (error) {
      alert('エラー: ' + error.message)
    } else {
      alert('名刺を追加しました')
      setFormData({
        name: '',
        name_kana: '',
        company: '',
        company_kana: '',
        department: '',
        position: '',
        phone: '',
        company_phone: '',
        fax: '',
        email: '',
        address: '',
        category: '個人',
        notes: '',
      })
      setImageFile(null)
      setImagePreview('')
      setIsOpen(false)
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-blue-700"
      >
        新規追加
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1"></div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* プロフィール画像 */}
            <div className="text-center mb-4 relative">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="プレビュー" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-gray-400">画像</span>
                )}
                <label className="absolute bottom-0 right-0 bg-gray-400 rounded-full p-2 cursor-pointer hover:bg-gray-500">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="text-white text-lg">📷</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">名前</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">名前（フリガナ）</label>
                <input
                  type="text"
                  name="name_kana"
                  value={formData.name_kana}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">勤務先</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">勤務先（フリガナ）</label>
                <input
                  type="text"
                  name="company_kana"
                  value={formData.company_kana}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">部署</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">役職</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">メールアドレス</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">携帯電話</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">会社電話</label>
                <input
                  type="text"
                  name="company_phone"
                  value={formData.company_phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ファックス</label>
                <input
                  type="text"
                  name="fax"
                  value={formData.fax}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">住所</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">メモ</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-400 text-white py-2 rounded hover:bg-green-500 disabled:bg-gray-400 font-medium"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-blue-600 py-2 rounded border border-blue-600 hover:bg-blue-50"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}