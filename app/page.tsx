'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AddMeishiForm from './components/AddMeishiForm'
import MeishiRow from './components/MeishiRow'

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

export default function Home() {
  const [meishi, setMeishi] = useState<Meishi[]>([])
  const [filteredMeishi, setFilteredMeishi] = useState<Meishi[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedMeishi, setSelectedMeishi] = useState<Meishi | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Meishi | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    fetchMeishi()
  }, [])

  useEffect(() => {
    filterMeishi()
  }, [meishi, searchText, selectedCategory])

  const fetchMeishi = async () => {
    const { data, error } = await supabase
      .from('meishi')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('エラー:', error)
    } else {
      setMeishi(data || [])
    }
    setLoading(false)
  }

  const filterMeishi = () => {
    let filtered = meishi

    if (searchText) {
      const lowerSearch = searchText.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(lowerSearch) ||
          m.company.toLowerCase().includes(lowerSearch) ||
          m.email.toLowerCase().includes(lowerSearch)
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((m) => m.category === selectedCategory)
    }

    setFilteredMeishi(filtered)
  }

  const editImageUrl = editFormData?.image_filename
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/meishi-images/${editFormData.image_filename}`
    : null

  const imageUrl = selectedMeishi?.image_filename
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/meishi-images/${selectedMeishi.image_filename}`
    : null

  const handleDeleteMeishi = async (meishiId: string) => {
    if (!confirm('削除しますか？')) return

    const { error } = await supabase
      .from('meishi')
      .delete()
      .eq('id', meishiId)

    if (error) {
      alert('エラー: ' + error.message)
    } else {
      alert('削除しました')
      setSelectedMeishi(null)
      fetchMeishi()
    }
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editFormData) return
    const { name, value } = e.target
    setEditFormData((prev) => prev ? { ...prev, [name]: value } : null)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFormData) return

    setEditLoading(true)
    const { error } = await supabase
      .from('meishi')
      .update(editFormData)
      .eq('id', editFormData.id)

    if (error) {
      alert('エラー: ' + error.message)
    } else {
      alert('更新しました')
      setIsEditOpen(false)
      fetchMeishi()
      setSelectedMeishi(editFormData)
    }
    setEditLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* スマホ版：カード形式 */}
      <div className="md:hidden flex flex-col h-screen">
        <div className="bg-white border-b p-4">
          <h1 className="text-2xl font-bold text-gray-900">名刺管理</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="名前、会社、メール..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
            >
              <option value="">全て ({meishi.length})</option>
              <option value="個人">個人</option>
              <option value="共有">共有</option>
            </select>
            <div className="text-sm text-gray-600">
              {filteredMeishi.length} 件の名刺
            </div>
          </div>

          {loading ? (
            <p className="text-gray-700 text-center">読み込み中...</p>
          ) : filteredMeishi.length === 0 ? (
            <p className="text-gray-500 text-center">名刺がありません</p>
          ) : (
            <div className="space-y-3">
              {filteredMeishi.map((m) => {
                const imgUrl = m.image_filename
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/meishi-images/${m.image_filename}`
                  : null

                return (
                  <div
                    key={m.id}
                    className="bg-white rounded-lg p-4 flex gap-4 cursor-pointer hover:shadow-lg transition"
                    onClick={() => setSelectedMeishi(m)}
                  >
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(m.created_at).toLocaleDateString('ja-JP')}
                      </div>
                      <div className="font-bold text-gray-900 text-lg">{m.name}</div>
                      <div className="text-gray-600 text-sm">{m.company}</div>
                      {(m.department || m.position) && (
                        <div className="text-gray-500 text-xs">
                          {m.department}
                          {m.department && m.position && ' / '}
                          {m.position}
                        </div>
                      )}
                    </div>

                    {imgUrl && (
                      <div className="w-20 h-14 flex-shrink-0">
                        <img
                          src={imgUrl}
                          alt="名刺"
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* スマホ版：下に詳細パネル */}
        {selectedMeishi && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="bg-gray-900 text-white w-full max-h-[90vh] rounded-t-lg overflow-y-auto">
              {/* ヘッダー */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
                <button
                  onClick={() => setSelectedMeishi(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ←
                </button>
                <h2 className="text-lg font-bold">名刺詳細</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditFormData(selectedMeishi)
                      setIsEditOpen(true)
                    }}
                    className="text-gray-400 hover:text-white px-2 py-1 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => setSelectedMeishi(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ⋮
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* 名刺画像（大） */}
                {imageUrl && (
                  <div className="mb-6">
                    <img src={imageUrl} alt="名刺" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}

                {/* 人物名 + 役職 + 会社 + プロフィール〇 */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-white">{selectedMeishi.name}</div>
                    {selectedMeishi.position && (
                      <div className="text-sm text-gray-400">{selectedMeishi.position}</div>
                    )}
                    {selectedMeishi.company && (
                      <div className="text-sm text-gray-400">{selectedMeishi.company}</div>
                    )}
                    {selectedMeishi.department && (
                      <div className="text-xs text-gray-500">{selectedMeishi.department}</div>
                    )}
                  </div>
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-3xl">👤</span>
                  </div>
                </div>

                {/* セクション: メールアドレス */}
                {selectedMeishi.email && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-sm text-gray-400 mb-2">メールアドレス</div>
                    <div className="flex justify-between items-center">
                      <div className="text-white text-sm">{selectedMeishi.email}</div>
                      <a
                        href={`mailto:${selectedMeishi.email}`}
                        className="text-gray-400 hover:text-white text-xl"
                      >
                        ✉
                      </a>
                    </div>
                  </div>
                )}

                {/* セクション: 携帯電話 */}
                {selectedMeishi.phone && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-sm text-gray-400 mb-2">携帯電話</div>
                    <div className="flex justify-between items-center">
                      <div className="text-white text-sm">{selectedMeishi.phone}</div>
                      <div className="flex gap-2">
                        <a
                          href={`sms:${selectedMeishi.phone}`}
                          className="text-gray-400 hover:text-white text-xl"
                        >
                          💬
                        </a>
                        <a
                          href={`tel:${selectedMeishi.phone}`}
                          className="text-gray-400 hover:text-white text-xl"
                        >
                          📞
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* セクション: 勤務先 */}
                {selectedMeishi.company && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-sm text-gray-400 mb-2">勤務先</div>
                    <div className="flex justify-between items-center">
                      <div className="text-white text-sm">{selectedMeishi.company}</div>
                      <button className="text-gray-400 hover:text-white text-lg">›</button>
                    </div>
                  </div>
                )}

                {/* セクション: メモ */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="text-sm text-gray-400 mb-2 flex justify-between items-center">
                    <span>メモ</span>
                    <button className="text-gray-400 hover:text-white">+</button>
                  </div>
                  {selectedMeishi.notes ? (
                    <div className="text-white text-sm">{selectedMeishi.notes}</div>
                  ) : (
                    <div className="text-gray-500 text-sm">メモがありません</div>
                  )}
                </div>

                {/* セクション: グループ */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="text-sm text-gray-400 mb-2">グループ</div>
                  <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                    selectedMeishi.category === '個人' 
                      ? 'bg-blue-900 text-blue-300' 
                      : 'bg-green-900 text-green-300'
                  }`}>
                    {selectedMeishi.category}
                  </span>
                </div>

                {/* 削除ボタン */}
                <div className="border-t border-gray-700 pt-4">
                  <button
                    onClick={() => handleDeleteMeishi(selectedMeishi.id)}
                    className="w-full px-4 py-2 bg-red-900 text-red-300 rounded hover:bg-red-800"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 編集モーダル */}
        {isEditOpen && editFormData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
            <div className="bg-gray-900 text-white w-full max-h-[90vh] rounded-t-lg overflow-y-auto">
              {/* ヘッダー */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="text-white text-2xl"
                >
                  ✕
                </button>
                <h2 className="text-lg font-bold">名刺情報を編集</h2>
                <button
                  onClick={handleEditSubmit}
                  disabled={editLoading}
                  className="text-green-400 hover:text-green-300 px-2 py-1 text-sm"
                >
                  {editLoading ? '保存中...' : '完了'}
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                {/* 名刺画像 */}
                {editImageUrl && (
                  <div className="mb-6">
                    <img src={editImageUrl} alt="名刺" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}

                {/* 人物名 + プロフィール〇 */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">名前</label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-2xl">✎</span>
                  </div>
                </div>

                {/* 名前フリガナ */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">名前（フリガナ）</label>
                  <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder=""
                  />
                </div>

                {/* 役職 */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">役職</label>
                  <input
                    type="text"
                    name="position"
                    value={editFormData.position}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* 部署 */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">部署</label>
                  <input
                    type="text"
                    name="department"
                    value={editFormData.department}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* 勤務先 */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">勤務先</label>
                  <input
                    type="text"
                    name="company"
                    value={editFormData.company}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* 勤務先フリガナ */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">勤務先（フリガナ）</label>
                  <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                    placeholder=""
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">メールアドレス</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* 携帯電話 */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">携帯電話</label>
                  <input
                    type="text"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* 住所 */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">住所</label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* 分類 */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">分類</label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option>個人</option>
                    <option>共有</option>
                  </select>
                </div>

                {/* メモ */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">メモ</label>
                  <textarea
                    name="notes"
                    value={editFormData.notes}
                    onChange={handleEditChange}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* PC版：左右レイアウト */}
      <div className="hidden md:flex min-h-screen">
        <div className="flex-1">
          <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">名刺管理</h1>

            <AddMeishiForm onSuccess={fetchMeishi} />

            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">検索</label>
                  <input
                    type="text"
                    placeholder="名前、会社、メールで検索..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">分類</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  >
                    <option value="">全て</option>
                    <option value="個人">個人</option>
                    <option value="共有">共有</option>
                  </select>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {filteredMeishi.length} 件の名刺
              </div>
            </div>

            {loading ? (
              <p className="text-gray-700">読み込み中...</p>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 text-left font-medium text-gray-900">名前 / 会社名 / 役職 / 部署</th>
                      <th className="p-3 text-left font-medium text-gray-900">電話番号</th>
                      <th className="p-3 text-left font-medium text-gray-900">メールアドレス</th>
                      <th className="p-3 text-left font-medium text-gray-900">住所</th>
                      <th className="p-3 text-left font-medium text-gray-900">交換日順</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMeishi.map((m) => (
                      <MeishiRow
                        key={m.id}
                        meishi={m}
                        onUpdate={fetchMeishi}
                        onSelect={setSelectedMeishi}
                        isSelected={selectedMeishi?.id === m.id}
                      />
                    ))}
                  </tbody>
                </table>
                {filteredMeishi.length === 0 && (
                  <p className="p-4 text-gray-500 text-center">名刺がありません</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PC版：右パネル */}
        {selectedMeishi && (
          <div className="w-96 bg-white shadow-lg overflow-y-auto flex flex-col">
            <div className="flex-1 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMeishi.name}</h2>
                <button
                  onClick={() => setSelectedMeishi(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">会社名</label>
                <p className="text-base text-gray-900">{selectedMeishi.company}</p>
              </div>

              {(selectedMeishi.department || selectedMeishi.position) && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">部署 / 役職</label>
                  <p className="text-base text-gray-900">
                    {selectedMeishi.department}
                    {selectedMeishi.department && selectedMeishi.position && ' / '}
                    {selectedMeishi.position}
                  </p>
                </div>
              )}

              {selectedMeishi.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">メール</label>
                  <p className="text-base text-gray-900">{selectedMeishi.email}</p>
                </div>
              )}

              {selectedMeishi.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">携帯電話</label>
                  <p className="text-base text-gray-900">{selectedMeishi.phone}</p>
                </div>
              )}

              {selectedMeishi.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">住所</label>
                  <p className="text-base text-gray-900">{selectedMeishi.address}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600">交換日</label>
                <p className="text-base text-gray-900">{new Date(selectedMeishi.created_at).toLocaleDateString('ja-JP')}</p>
              </div>

              {selectedMeishi.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">メモ</label>
                  <p className="text-base text-gray-900">{selectedMeishi.notes}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600">グループ</label>
                <p className="text-base">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    selectedMeishi.category === '個人' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedMeishi.category}
                  </span>
                </p>
              </div>
            </div>

            <div className="border-t">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="名刺"
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">画像なし</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}