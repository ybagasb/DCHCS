'use client'

import { useState } from 'react'
import Navbar from '../../components/Navbar'
import ChecklistForm from './ChecklistForm'
import ChecklistHistory from './ChecklistHistory'

export default function ChecklistPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Data Center Checklist</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Daily inspection record.</p>
        </div>

        <ChecklistForm onSuccess={() => setRefreshKey((k) => k + 1)} />

        <div className="pt-10 border-t border-slate-200 dark:border-slate-800">
           <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">History</h3>
           <ChecklistHistory refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  )
}
