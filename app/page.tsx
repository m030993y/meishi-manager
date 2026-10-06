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

        {/* 右下の浮くカメラボタン */}
        <div className="fixed bottom-6 right-6 z-40">
          <AddMeishiForm onSuccess={fetchMeishi} />
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