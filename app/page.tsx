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

  const imageUrl = selectedMeishi?.image_filename
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/meishi-images/${selectedMeishi.image_filename}`
    : null

  return (
    <div className="min-h-screen bg-gray-100">
      {/* スマホ版：カード形式 */}
      <div className="md:hidden flex flex-col h-screen">
        <div className="bg-white border-b p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">名刺管理</h1>
          <AddMeishiForm onSuccess={fetchMeishi} />
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
            <div className="bg-white w-full max-h-[80vh] rounded-t-lg overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMeishi.name}</h2>
                  <button
                    onClick={() => setSelectedMeishi(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">会社名</label>
                  <p className="text-gray-900">{selectedMeishi.company}</p>
                </div>

                {(selectedMeishi.department || selectedMeishi.position) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">部署 / 役職</label>
                    <p className="text-gray-900">
                      {selectedMeishi.department}
                      {selectedMeishi.department && selectedMeishi.position && ' / '}
                      {selectedMeishi.position}
                    </p>
                  </div>
                )}

                {selectedMeishi.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">メール</label>
                    <p className="text-gray-900">{selectedMeishi.email}</p>
                  </div>
                )}

                {selectedMeishi.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">携帯電話</label>
                    <p className="text-gray-900">{selectedMeishi.phone}</p>
                  </div>
                )}

                {selectedMeishi.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">住所</label>
                    <p className="text-gray-900">{selectedMeishi.address}</p>
                  </div>
                )}

                {selectedMeishi.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">メモ</label>
                    <p className="text-gray-900">{selectedMeishi.notes}</p>
                  </div>
                )}

                {imageUrl && (
                  <div>
                    <img src={imageUrl} alt="名刺" className="w-full h-48 object-cover rounded" />
                  </div>
                )}
              </div>
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