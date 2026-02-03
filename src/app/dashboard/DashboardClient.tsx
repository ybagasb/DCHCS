'use client'

import { useEffect, useState } from 'react'
import LinkForm from './LinkForm'
import LinkList from './LinkList'
import Navbar from '../components/Navbar'

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Navbar */}
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 overflow-x-hidden">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">OMNIOPSSEC</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Centralized health and operations management.</p>
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
