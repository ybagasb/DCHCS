'use client'

import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Printer, Loader2, AlertCircle, Calendar, User, FileText, CheckCircle2, Info, Search, ShieldAlert, ChevronRight, ChevronLeft, Paperclip, X, Trash2 } from 'lucide-react'

type Incident = {
    _id: string
    incidentId: string
    reportDate: string
    reporter: string
    unit: string
    description: string
    category: string
    status: string
    pic?: string
    area: string
    location: string
    investigation?: string
    solution?: string
    completionDate?: string
    attachments?: Array<{
        name: string
        url: string
        fileType: string
    }>
}

const AREA_OPTIONS = ['Aplikasi', 'Network', 'Hardware']
const LOCATION_OPTIONS = ['Head Office', 'Head Office & Public']

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const toLocalISOString = (date: any) => {
        if (!date || isNaN(new Date(date).getTime())) return ''
        const d = new Date(date)
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        return d.toISOString().slice(0, 16)
    }

    // Form State
    const initialForm = {
        reportDate: toLocalISOString(new Date()),
        reporter: '',
        unit: '',
        description: '',
        area: '',
        location: '',
        category: 'Medium',
        status: 'Open',
        investigation: '',
        solution: '',
        completionDate: '',
        pic: '',
        incidentId: '',
        attachments: [] as Array<{ name: string; url: string; fileType: string }>
    }
    const [form, setForm] = useState(initialForm)
    const [areaDropdown, setAreaDropdown] = useState('')
    const [locationDropdown, setLocationDropdown] = useState('')
    const [month, setMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)
    const [step, setStep] = useState(1)
    const router = useRouter()

    useEffect(() => {
        fetchIncidents()
    }, [month])

    const fetchIncidents = async () => {
        setLoading(true)
        setError(null)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        try {
            const res = await fetch(`/api/incidents?month=${month}&t=${Date.now()}`, {
                signal: controller.signal
            })
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            const data = await res.json()
            setIncidents(data)
        } catch (err: any) {
            console.error('Fetch error:', err)
            setError(err.name === 'AbortError' ? 'Request timed out' : err.message)
        } finally {
            clearTimeout(timeoutId)
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (step < 5) {
            setStep(s => s + 1)
            return
        }
        try {
            const url = editingId ? `/api/incidents/${editingId}` : '/api/incidents'
            const method = editingId ? 'PUT' : 'POST'

            // Prepare data by ensuring dates are sent as UTC ISO strings
            const submissionData = {
                ...form,
                reportDate: form.reportDate ? new Date(form.reportDate).toISOString() : new Date().toISOString(),
                completionDate: form.completionDate ? new Date(form.completionDate).toISOString() : undefined
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            })

            if (res.ok) {
                setIsModalOpen(false)
                setEditingId(null)
                setForm(initialForm)
                setStep(1)
                fetchIncidents()
            } else {
                alert('Failed to save incident')
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleEdit = (incident: Incident) => {
        setEditingId(incident._id)
        setStep(1)
        setForm({
            reportDate: incident.reportDate ? toLocalISOString(new Date(incident.reportDate)) : '',
            reporter: incident.reporter,
            unit: incident.unit,
            description: incident.description,
            area: incident.area,
            location: incident.location,
            category: incident.category,
            status: incident.status,
            investigation: incident.investigation || '',
            solution: incident.solution || '',
            completionDate: incident.completionDate ? toLocalISOString(new Date(incident.completionDate)) : '',
            pic: incident.pic || '',
            incidentId: incident.incidentId,
            attachments: incident.attachments || []
        })

        // Logical check for dropdowns
        const isStandardArea = AREA_OPTIONS.includes(incident.area)
        setAreaDropdown(isStandardArea ? incident.area : 'Other')

        const isStandardLocation = LOCATION_OPTIONS.includes(incident.location)
        setLocationDropdown(isStandardLocation ? incident.location : 'Other')

        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        await fetch(`/api/incidents/${id}`, { method: 'DELETE' })
        fetchIncidents()
    }

    const [uploading, setUploading] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const MAX_SIZE = 200 * 1024 * 1024 // 200MB
        setUploading(true)
        try {
            const uploaded = [...form.attachments]
            for (let i = 0; i < files.length; i++) {
                if (files[i].size > MAX_SIZE) {
                    alert(`File "${files[i].name}" is too large. Maximum size is 200MB.`)
                    continue
                }
                const formData = new FormData()
                formData.append('file', files[i])
                if (form.incidentId) {
                    formData.append('incidentId', form.incidentId)
                }

                const res = await fetch('/api/incidents/upload', {
                    method: 'POST',
                    body: formData
                })

                if (res.ok) {
                    const data = await res.json()
                    uploaded.push(data)
                }
            }
            setForm({ ...form, attachments: uploaded })
        } catch (err) {
            console.error('Upload failed', err)
            alert('Failed to upload some files')
        } finally {
            setUploading(false)
        }
    }

    const removeAttachment = async (index: number) => {
        const attachment = form.attachments[index]
        if (!attachment) return

        if (!confirm(`Apakah kamu yakin ingin menghapus file "${attachment.name}", file ini akan terhapus permanen dari server?`)) {
            return
        }

        try {
            const res = await fetch('/api/incidents/upload/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: attachment.url })
            })

            if (res.ok) {
                const newAttachments = [...form.attachments]
                newAttachments.splice(index, 1)
                setForm({ ...form, attachments: newAttachments })
            } else {
                console.error('Failed to delete file from server')
                alert('Failed to delete file from server')
            }
        } catch (err) {
            console.error('Error deleting file', err)
            alert('Error deleting file')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
                                <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">INCIDENTS</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Track and resolve IT issues.</p>
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
                                onClick={async () => {
                                    setEditingId(null)
                                    setForm(initialForm)
                                    setStep(1)
                                    setAreaDropdown('')
                                    setLocationDropdown('')
                                    setIsModalOpen(true)
                                    const res = await fetch('/api/incidents?nextId=true')
                                    const data = await res.json()
                                    setForm(f => ({ ...f, incidentId: data.incidentId }))
                                }}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Incident
                            </button>

                            <Link
                                href="/dashboard/incidents/print"
                                className="col-span-2 sm:col-auto px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Print Report
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center px-4">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Failed to load incidents</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto text-sm">{error}</p>
                            <button onClick={fetchIncidents} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Try Again</button>
                        </div>
                    ) : incidents.length === 0 ? (
                        <div className="py-20 text-center text-slate-500 dark:text-slate-400">
                            No incident records found for this month.
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 uppercase text-[10px] font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 border-b dark:border-slate-600">ID</th>
                                            <th className="px-6 py-4 border-b dark:border-slate-600">Time & Reporter</th>
                                            <th className="px-6 py-4 border-b dark:border-slate-600">Area & Location</th>
                                            <th className="px-6 py-4 border-b dark:border-slate-600">Description</th>
                                            <th className="px-6 py-4 border-b dark:border-slate-600 text-center">Severity</th>
                                            <th className="px-6 py-4 border-b dark:border-slate-600 text-center">Status</th>
                                            <th className="px-6 py-4 border-b dark:border-slate-600 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {incidents.map(inc => (
                                            <tr key={inc._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{inc.incidentId}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800 dark:text-white">{new Date(inc.reportDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                                                    <div className="text-[11px] text-slate-500 flex items-center gap-1"><User className="w-3 h-3" /> {inc.reporter} ({inc.unit})</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-700 dark:text-slate-300">{inc.area}</div>
                                                    <div className="text-[11px] text-slate-500">{inc.location}</div>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs truncate italic text-slate-600 dark:text-slate-400" title={inc.description}>
                                                    {inc.description}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${inc.category === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        inc.category === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        }`}>
                                                        {inc.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${inc.status === 'Open' ? 'border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400' :
                                                        inc.status === 'Closed' ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' :
                                                            'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400'
                                                        }`}>
                                                        {inc.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-3">
                                                    <button onClick={() => handleEdit(inc)} className="text-blue-600 hover:text-blue-700 font-bold text-xs uppercase">Edit</button>
                                                    <button onClick={() => handleDelete(inc._id)} className="text-red-500 hover:text-red-600 font-bold text-xs uppercase">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                                {incidents.map(inc => (
                                    <div key={inc._id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{inc.incidentId}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${inc.category === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                                        {inc.category}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-1">{inc.reporter}</h3>
                                                <p className="text-[10px] text-slate-500">{new Date(inc.reportDate).toLocaleDateString()} at {new Date(inc.reportDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${inc.status === 'Open' ? 'border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20' : 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'}`}>
                                                {inc.status}
                                            </span>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 text-xs italic text-slate-600 dark:text-slate-400">
                                            "{inc.description}"
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Area</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{inc.area}</p>
                                            </div>
                                            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Unit</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{inc.unit}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(inc)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Edit</button>
                                            <button onClick={() => handleDelete(inc._id)} className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                    {editingId ? 'Edit Incident' : 'New Incident Report'}
                                </h3>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); setStep(1); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        {/* Progress Bar (Wizard Style) */}
                        <div className="px-8 pt-6 pb-2">
                            <div className="flex justify-between mb-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div key={s} className="flex flex-col items-center gap-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                            {s}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                            <form id="incident-form" onSubmit={handleSubmit} className="space-y-6">
                                {step === 1 && (
                                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Report Time</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="datetime-local"
                                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                        value={form.reportDate}
                                                        onChange={e => setForm({ ...form, reportDate: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Reporter Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                        value={form.reporter}
                                                        onChange={e => setForm({ ...form, reporter: e.target.value })}
                                                        required
                                                        placeholder="e.g. Bagas"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Unit / Department</label>
                                                <div className="relative">
                                                    <Info className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                        value={form.unit}
                                                        onChange={e => setForm({ ...form, unit: e.target.value })}
                                                        required
                                                        placeholder="e.g. Infrastructure"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Area</label>
                                                <select
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    value={areaDropdown}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setAreaDropdown(val);
                                                        if (val !== 'Other') setForm({ ...form, area: val });
                                                        else setForm({ ...form, area: '' });
                                                    }}
                                                    required={areaDropdown !== 'Other'}
                                                >
                                                    <option value="" disabled>Select Area</option>
                                                    {AREA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    <option value="Other">Other...</option>
                                                </select>
                                                {areaDropdown === 'Other' && (
                                                    <input
                                                        type="text"
                                                        className="mt-2 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-500 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                        value={form.area}
                                                        onChange={e => setForm({ ...form, area: e.target.value })}
                                                        required
                                                        placeholder="Specify Area"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Location</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={locationDropdown}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setLocationDropdown(val);
                                                    if (val !== 'Other') setForm({ ...form, location: val });
                                                    else setForm({ ...form, location: '' });
                                                }}
                                                required={locationDropdown !== 'Other'}
                                            >
                                                <option value="" disabled>Select Location</option>
                                                {LOCATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="Other">Other...</option>
                                            </select>
                                            {locationDropdown === 'Other' && (
                                                <input
                                                    type="text"
                                                    className="mt-2 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-blue-500 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    value={form.location}
                                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                                    required
                                                    placeholder="Specify Location"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Incident Description</label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                                <textarea
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px]"
                                                    value={form.description}
                                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                                    required
                                                    placeholder="Provide details about the incident..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Category / Severity</label>
                                                <select
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                                    value={form.category}
                                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                                >
                                                    <option value="High">High / Critical</option>
                                                    <option value="Medium">Medium / Normal</option>
                                                    <option value="Low">Low / Minor</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Initial Status</label>
                                                <select
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                                                    value={form.status}
                                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                                >
                                                    <option value="Open">Open</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Investigation Details</label>
                                            <textarea
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px]"
                                                value={form.investigation}
                                                onChange={e => setForm({ ...form, investigation: e.target.value })}
                                                placeholder="What was discovered during investigation?"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Resolution / Solution</label>
                                            <textarea
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px]"
                                                value={form.solution}
                                                onChange={e => setForm({ ...form, solution: e.target.value })}
                                                placeholder="How was the issue resolved?"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Completion Time</label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    value={form.completionDate}
                                                    onChange={e => setForm({ ...form, completionDate: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Action Taken By (PIC)</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    value={form.pic}
                                                    onChange={e => setForm({ ...form, pic: e.target.value })}
                                                    placeholder="Name of PIC"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Evidence & Attachments</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {form.attachments.map((att, idx) => (
                                                <div key={idx} className="relative group rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 aspect-square shadow-sm">
                                                    {att.fileType.startsWith('image/') ? (
                                                        <img src={att.url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                                            <Paperclip className="w-8 h-8 text-slate-300 mb-2" />
                                                            <span className="text-[10px] font-medium text-slate-500 truncate w-full text-center px-2">{att.name}</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <button type="button" onClick={() => removeAttachment(idx)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <a href={att.url} target="_blank" rel="noopener" className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg">
                                                            <Search className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                            <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-slate-400 hover:text-blue-500 shadow-sm">
                                                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : (
                                                    <>
                                                        <Plus className="w-8 h-8 mb-1" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Add Files</span>
                                                    </>
                                                )}
                                                <input type="file" className="hidden" multiple onChange={handleFileUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                        <p className="text-[10px] text-slate-400 italic text-center">Max size 200MB. Supported: Images, PDF, Docs.</p>
                                    </div>
                                )}

                                {step === 5 && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Preview Detail Insiden</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reporter & Unit</p>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{form.reporter}</p>
                                                    <p className="text-xs text-slate-500">{form.unit}</p>
                                                </div>

                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu & Lokasi</p>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{new Date(form.reportDate).toLocaleString()}</p>
                                                    <p className="text-xs text-slate-500">{form.area} - {form.location}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status & Kategori</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${form.category === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{form.category}</span>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-200 text-slate-700">{form.status}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PIC Terkait</p>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{form.pic || '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deskripsi Masalah</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{form.description}"</p>
                                        </div>

                                        {form.attachments.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Lampiran Dokumen ({form.attachments.length})</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {form.attachments.map((att, i) => (
                                                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                                            <Paperclip className="w-3 h-3 text-blue-500" />
                                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{att.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
                            <div className="flex justify-between gap-4">
                                {step > 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setStep(s => s - 1)}
                                        className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Back
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => { setIsModalOpen(false); setStep(1); }}
                                        className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                )}

                                {step < 5 ? (
                                    <button
                                        type="button"
                                        onClick={() => setStep(s => s + 1)}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e as any)}
                                        className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Save Incident
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
