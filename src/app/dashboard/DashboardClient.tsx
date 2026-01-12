'use client'

import { useEffect, useState } from 'react'
import LinkForm from './LinkForm'
import LinkList from './LinkList'
import ThemeToggle from '../components/ThemeToggle'

export type LinkType = {
  _id: string
  title: string
  url: string
  icon?: string
}

export default function DashboardClient() {
  const [links, setLinks] = useState<LinkType[]>([])
  const [editing, setEditing] = useState<LinkType | null>(null)
  const [search, setSearch] = useState('')

  const loadLinks = async (query = '') => {
    const res = await fetch(`/api/links?q=${query}`)
    const data = await res.json()
    setLinks(data)
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadLinks(search)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              DashboardLink
            </h1>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <button
                onClick={logout}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                Sign Out
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your links efficiently.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-full leading-5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
              placeholder="Search links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <LinkForm
                editing={editing}
                onSuccess={() => {
                  setEditing(null)
                  loadLinks(search)
                }}
              />
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <LinkList
              links={links}
              onEdit={(link) => {
                setEditing(link)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              onDelete={() => loadLinks(search)}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
