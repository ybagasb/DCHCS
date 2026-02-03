'use client'

import { useState } from 'react'
import Navbar from '@/app/components/Navbar'
import ChecklistForm from './ChecklistForm'
import ChecklistHistory from './ChecklistHistory'
import { Plus, Printer, ClipboardCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ChecklistPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [month, setMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 font-sans">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
              Data Center Checklist
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Daily inspection and maintenance records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Record
            </button>

            <Link
              href={`/dashboard/checklist/print/monthly?month=${month.split('-')[1]}&year=${month.split('-')[0]}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </Link>
          </div>
        </div>

        <ChecklistHistory refreshKey={refreshKey} month={month} />

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-3xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 relative">
              <ChecklistForm
                onSuccess={() => {
                  setShowForm(false)
                  setRefreshKey((k) => k + 1)
                }}
                onClose={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
