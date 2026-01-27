'use client'

import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
}

const AREA_OPTIONS = ['Aplikasi', 'Network', 'Hardware']
const LOCATION_OPTIONS = ['Head Office', 'Head Office & Public']

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const toLocalISOString = (date: Date) => {
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
        pic: ''
    }
    const [form, setForm] = useState(initialForm)
    const [areaDropdown, setAreaDropdown] = useState('')
    const [locationDropdown, setLocationDropdown] = useState('')
    const router = useRouter()

    useEffect(() => {
        fetchIncidents()
    }, [])

    const fetchIncidents = async () => {
        try {
            const res = await fetch('/api/incidents')
            const data = await res.json()
            setIncidents(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingId ? `/api/incidents/${editingId}` : '/api/incidents'
            const method = editingId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            if (res.ok) {
                setIsModalOpen(false)
                setEditingId(null)
                setForm(initialForm)
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
            pic: incident.pic || ''
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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Incident Management</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Track and resolve IT incidents.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/dashboard/incidents/print"
                            className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print Report
                        </Link>
                        <button
                            onClick={() => {
                                setEditingId(null)
                                setForm(initialForm)
                                setAreaDropdown('')
                                setLocationDropdown('')
                                setIsModalOpen(true)
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            New Incident
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-4 font-semibold whitespace-nowrap">ID</th>
                                        <th className="p-4 font-semibold whitespace-nowrap">Date</th>
                                        <th className="p-4 font-semibold">Description</th>
                                        <th className="p-4 font-semibold whitespace-nowrap">Reporter</th>
                                        <th className="p-4 font-semibold whitespace-nowrap">Category</th>
                                        <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {incidents.map(inc => (
                                        <tr key={inc._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 font-mono font-medium text-blue-600 dark:text-blue-400">{inc.incidentId}</td>
                                            <td className="p-4 whitespace-nowrap text-slate-500">{new Date(inc.reportDate).toLocaleDateString()}</td>
                                            <td className="p-4 max-w-xs truncate" title={inc.description}>{inc.description}</td>
                                            <td className="p-4 text-slate-500">{inc.reporter}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${inc.category === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    inc.category === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}>
                                                    {inc.category}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${inc.status === 'Open' ? 'border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400' :
                                                    inc.status === 'Closed' ? 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-400' :
                                                        'border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-400'
                                                    }`}>
                                                    {inc.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                                <button onClick={() => handleEdit(inc)} className="text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                                                <button onClick={() => handleDelete(inc._id)} className="text-red-500 hover:text-red-600">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {incidents.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-slate-500">No incidents found. Create one to get started.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{editingId ? 'Edit Incident' : 'Report New Incident'}</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                            <form id="incident-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Report Time</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            value={form.reportDate}
                                            onChange={e => setForm({ ...form, reportDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Status</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            value={form.status}
                                            onChange={e => setForm({ ...form, status: e.target.value })}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Reporter</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            value={form.reporter}
                                            onChange={e => setForm({ ...form, reporter: e.target.value })}
                                            required
                                            placeholder="Nama Pelapor"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Unit / Department</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            value={form.unit}
                                            onChange={e => setForm({ ...form, unit: e.target.value })}
                                            required
                                            placeholder="Unit Kerja"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Description</label>
                                    <textarea
                                        className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        required
                                        placeholder="Detail kejadian..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Area</label>
                                        <div className="space-y-2">
                                            <select
                                                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                value={areaDropdown}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setAreaDropdown(val);
                                                    if (val !== 'Other') {
                                                        setForm({ ...form, area: val });
                                                    } else {
                                                        setForm({ ...form, area: '' });
                                                    }
                                                }}
                                                required={areaDropdown !== 'Other'}
                                            >
                                                <option value="" disabled>Select Area</option>
                                                {AREA_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                                <option value="Other">Other...</option>
                                            </select>

                                            {areaDropdown === 'Other' && (
                                                <input
                                                    type="text"
                                                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    value={form.area}
                                                    onChange={e => setForm({ ...form, area: e.target.value })}
                                                    required
                                                    placeholder="Input Custom Area"
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Location</label>
                                        <div className="space-y-2">
                                            <select
                                                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                value={locationDropdown}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setLocationDropdown(val);
                                                    if (val !== 'Other') {
                                                        setForm({ ...form, location: val });
                                                    } else {
                                                        setForm({ ...form, location: '' });
                                                    }
                                                }}
                                                required={locationDropdown !== 'Other'}
                                            >
                                                <option value="" disabled>Select Location</option>
                                                {LOCATION_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                                <option value="Other">Other...</option>
                                            </select>

                                            {locationDropdown === 'Other' && (
                                                <input
                                                    type="text"
                                                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    value={form.location}
                                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                                    required
                                                    placeholder="Input Custom Location"
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Category</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                        >
                                            <option value="High">High / Mendesak</option>
                                            <option value="Medium">Medium / Sedang</option>
                                            <option value="Low">Low / Rendah</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-6">
                                    <h4 className="font-semibold mb-3 text-slate-500 text-sm uppercase tracking-wider bg-slate-100 dark:bg-slate-800 inline-block px-2 py-1 rounded">Verification / Solution</h4>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Investigation</label>
                                            <textarea
                                                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                                rows={2}
                                                value={form.investigation}
                                                onChange={e => setForm({ ...form, investigation: e.target.value })}
                                                placeholder="Hasil investigasi..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Solution</label>
                                            <textarea
                                                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                                rows={2}
                                                value={form.solution}
                                                onChange={e => setForm({ ...form, solution: e.target.value })}
                                                placeholder="Solusi permanen/sementara..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Completion Time</label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                                    value={form.completionDate}
                                                    onChange={e => setForm({ ...form, completionDate: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">PIC</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                                    value={form.pic}
                                                    onChange={e => setForm({ ...form, pic: e.target.value })}
                                                    placeholder="Joko - Infra"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0 rounded-b-2xl">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="incident-form"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Save Incident
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
