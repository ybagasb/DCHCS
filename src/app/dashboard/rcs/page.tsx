'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/app/components/Navbar'
import { Plus, Database, Printer, FileText, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import RcsForm from '@/app/dashboard/rcs/RcsForm'
import DatastorePopup from '@/app/dashboard/rcs/DatastorePopup'

interface RcsEntry {
    _id: string
    tgl: string
    piket: string
    cpu: { capacity: number; free: number; used: number }
    memory: { capacity: number; free: number; used: number }
    storage: {
        universal: { capacity: number; free: number; used: number }
        datastores: Array<{ name: string; capacity: number; free: number; used: number }>
    }
    notes: string
}

export default function RcsPage() {
    const [entries, setEntries] = useState<RcsEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showDatastores, setShowDatastores] = useState(false)
    const [month, setMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)

    const fetchEntries = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/rcs?month=${month}`)
            if (res.ok) {
                setEntries(await res.json())
            }
        } catch (error) {
            console.error('Failed to fetch RCS entries:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEntries()
    }, [month])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">RCS</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Resources Check System</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 md:gap-3 w-full md:w-auto">
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="col-span-2 sm:col-auto px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            />

                            <button
                                onClick={() => setShowDatastores(true)}
                                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden xs:inline">Datastores</span>
                                <span className="xs:hidden">DS</span>
                            </button>

                            <button
                                onClick={() => setShowForm(true)}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Record
                            </button>

                            <Link
                                href={`/dashboard/rcs/print?month=${month}`}
                                className="col-span-2 sm:col-auto px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Print Report
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Entries List / Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="py-20 text-center text-slate-500 dark:text-slate-400">
                            No data records found for this month.
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 uppercase text-[10px] font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 border-b dark:border-slate-600">Date</th>
                                            <th className="px-6 py-4 border-b dark:border-slate-600">Officer</th>
                                            <th className="px-6 py-4 border-b dark:border-slate-600 text-center">CPU (Used)</th>
                                            <th className="px-6 py-4 border-b dark:border-slate-600 text-center">Memory (Used)</th>
                                            <th className="px-6 py-4 border-b dark:border-slate-600 text-center">Storage (Used)</th>
                                            <th className="px-6 py-4 border-b dark:border-slate-600">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {entries.map((entry) => (
                                            <tr key={entry._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-default">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">{new Date(entry.tgl).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                                    {entry.piket?.split(',')[0]} {entry.piket?.split(',')[1] ? `& ${entry.piket.split(',')[1]}` : ''}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-bold text-blue-600 dark:text-blue-400">{entry.cpu.used}</span> / {entry.cpu.capacity} GHz
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{entry.memory.used}</span> / {entry.memory.capacity} GB
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{entry.storage.universal.used}</span> / {entry.storage.universal.capacity} TB
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate text-xs italic">
                                                    {entry.notes || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                                {entries.map((entry) => (
                                    <div key={entry._id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{new Date(entry.tgl).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                                                <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{entry.piket}</h3>
                                            </div>
                                            <div className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                {new Date(entry.tgl).getFullYear()}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                                <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">CPU</p>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-200">{entry.cpu.used}G</p>
                                            </div>
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                                <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1">RAM</p>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-200">{entry.memory.used}G</p>
                                            </div>
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                                <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Disk</p>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-200">{entry.storage.universal.used}T</p>
                                            </div>
                                        </div>
                                        {entry.notes && (
                                            <p className="mt-4 text-[11px] italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                "{entry.notes}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Modals */}
            {showForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 md:p-8">
                        <RcsForm
                            onClose={() => setShowForm(false)}
                            onSuccess={() => {
                                setShowForm(false)
                                fetchEntries()
                            }}
                        />
                    </div>
                </div>
            )}

            {showDatastores && (
                <DatastorePopup onClose={() => setShowDatastores(false)} />
            )}
        </div>
    )
}
