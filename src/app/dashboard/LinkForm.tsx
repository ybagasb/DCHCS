'use client'

import { useEffect, useState } from 'react'
import { LinkType } from './DashboardClient'

export default function LinkForm({
  editing,
  onSuccess,
}: {
  editing: LinkType | null
  onSuccess: () => void
}) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [icon, setIcon] = useState('')

  useEffect(() => {
    if (editing) {
      setTitle(editing.title)
      setUrl(editing.url)
      setIcon(editing.icon || '')
    } else {
      setTitle('')
      setUrl('')
      setIcon('')
    }
  }, [editing])

  const submit = async () => {
    if (!title || !url) {
      alert('Nama dan URL wajib diisi')
      return
    }

    await fetch(
      editing ? `/api/links/${editing._id}` : '/api/links',
      {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url, icon }),
      }
    )

    onSuccess()
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          {editing ? 'Edit Link' : 'Add New Link'}
        </h2>
        {editing && (
          <button
            onClick={() => onSuccess()} // This acts as cancel in this context if we want, but for now just title
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Application Name</label>
          <input
            className="w-full border border-slate-200 p-3 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="e.g. Grafana"
            value={title}
            onChange={e => setTitle(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
          <input
            className="w-full border border-slate-200 p-3 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
            placeholder="https://..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Icon URL (Optional)</label>
          <div className="flex gap-3">
            <input
              className="flex-1 w-full border border-slate-200 p-3 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
              placeholder="https://..."
              value={icon}
              onChange={e => setIcon(e.target.value)}
              spellCheck={false}
            />
            {icon && (
              <div className="w-12 h-12 flex-shrink-0 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={icon}
                  alt="preview"
                  className="w-8 h-8 object-contain"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={submit}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200"
      >
        {editing ? 'Update Link' : 'Create Link'}
      </button>
    </div>
  )
}
