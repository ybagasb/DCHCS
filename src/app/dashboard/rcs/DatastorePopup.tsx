'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Loader2 } from 'lucide-react'

interface Datastore {
    _id: string
    name: string
}

export default function DatastorePopup({ onClose }: { onClose: () => void }) {
    const [datastores, setDatastores] = useState<Datastore[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState('')
    const [saving, setSaving] = useState(false)

    const fetchDatastores = async () => {
        try {
            const res = await fetch('/api/datastores')
            if (res.ok) setDatastores(await res.json())
        } catch (error) {
            console.error('Failed to fetch datastores:', error)
        } finally {
            setLoading(false)
        }
    }

    const addDatastore = async () => {
        if (!newName.trim()) return
        setSaving(true)
        try {
            const res = await fetch('/api/datastores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim() })
            })
            if (res.ok) {
                setNewName('')
                fetchDatastores()
            }
        } catch (error) {
            console.error('Failed to add datastore:', error)
        } finally {
            setSaving(false)
        }
    }

    const deleteDatastore = async (id: string) => {
        if (!confirm('Are you sure you want to delete this datastore?')) return
        try {
            const res = await fetch(`/api/datastores?id=${id}`, { method: 'DELETE' })
            if (res.ok) fetchDatastores()
        } catch (error) {
            console.error('Failed to delete datastore:', error)
        }
    }

    useEffect(() => {
        fetchDatastores()
    }, [])

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                    <h2 className="text-lg font-bold">Manage Datastores</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Datastore name..."
                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyDown={(e) => e.key === 'Enter' && addDatastore()}
                        />
                        <button
                            onClick={addDatastore}
                            disabled={saving || !newName.trim()}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {loading ? (
                            <div className="py-4 justify-center flex">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        ) : datastores.length === 0 ? (
                            <p className="text-sm text-center text-slate-500">No datastores added yet.</p>
                        ) : (
                            datastores.map((ds) => (
                                <div key={ds._id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                    <span className="text-sm font-medium">{ds.name}</span>
                                    <button
                                        onClick={() => deleteDatastore(ds._id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
