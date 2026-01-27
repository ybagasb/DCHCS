'use client'

import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'

type User = {
    _id: string
    username: string
    fullName?: string
    role: string
    createdAt: string
}

export default function AccountsPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ username: '', password: '', fullName: '' })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users')
            const data = await res.json()
            setUsers(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            const url = editingId ? `/api/users/${editingId}` : '/api/users'
            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'Operation failed')
            }

            setForm({ username: '', password: '', fullName: '' })
            setEditingId(null)
            fetchUsers()
        } catch (err: any) {
            setError(err.message)
        }
    }

    const handleEdit = (user: User) => {
        setEditingId(user._id)
        setForm({ username: user.username, password: '', fullName: user.fullName || '' })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchUsers()
            } else {
                alert('Failed to delete user')
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setForm({ username: '', password: '', fullName: '' })
        setError('')
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Account Management</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage admin accounts for DCHCS.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Account' : 'Add New Account'}</h3>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Username</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {editingId ? 'New Password (leave blank to keep)' : 'Password'}
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        required={!editingId}
                                        minLength={6}
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                                    >
                                        {editingId ? 'Update' : 'Create'}
                                    </button>
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-2 space-y-4">
                        {loading ? (
                            <p>Loading users...</p>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Username</th>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Full Name</th>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {users.map(user => (
                                            <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4 font-medium">{user.username}</td>
                                                <td className="p-4 text-slate-500 dark:text-slate-400">{user.fullName || '-'}</td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        className="text-red-500 hover:text-red-600 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-slate-500">
                                                    No users found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
