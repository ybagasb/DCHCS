'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        window.location.href = '/dashboard'
      } else {
        alert('Login failed. Please check your credentials.')
        setLoading(false)
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="w-25 h-25 mx-auto bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <img
              src="https://www.brantas-abipraya.co.id/sites/default/files/LOGO%20ABIPRAYA%20%281%29_1.png"
              alt="Logo Brantas Abipraya"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Sign in to manage your DCHCS</p>
        </div>

        {/* Form */}
        <form onSubmit={login} className="px-8 pb-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
            <input
              className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="admin"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center">
            <a href="/" className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              ← Back to Home
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}