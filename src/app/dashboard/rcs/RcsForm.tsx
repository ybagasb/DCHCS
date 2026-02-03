'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Save, X, Loader2 } from 'lucide-react'

interface Datastore {
    _id: string
    name: string
}

interface StepProps {
    formData: any
    setFormData: (data: any) => void
    errors: any
}

const InputField = ({ label, value, onChange, error, type = 'text', readOnly = false, suffix, onUnitChange, unitValue, unitOptions }: any) => (
    <div className="space-y-1.5">
        <label className={`text-sm font-semibold ${error ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
            {label}
        </label>
        <div className="flex gap-2">
            <div className="relative flex-1">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    readOnly={readOnly}
                    className={`w-full ${suffix && !onUnitChange ? 'pr-14' : 'px-4'} py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 transition-all ${readOnly ? 'opacity-70 cursor-not-allowed' : ''
                        } ${error
                            ? 'border-red-500 focus:ring-red-100 dark:focus:ring-red-900/20'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100'
                        }`}
                />
                {suffix && !onUnitChange && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-sm pointer-events-none">
                        {suffix}
                    </span>
                )}
            </div>
            {onUnitChange && (
                <select
                    value={unitValue}
                    onChange={(e) => onUnitChange(e.target.value)}
                    className="w-20 px-2 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {unitOptions.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            )}
        </div>
        {error && <p className="text-xs text-red-500">This field is required</p>}
    </div>
)

export default function RcsForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [loadingPic, setLoadingPic] = useState(false)
    const [datastores, setDatastores] = useState<Datastore[]>([])
    const [errors, setErrors] = useState<Record<string, boolean>>({})

    const [formData, setFormData] = useState({
        tgl: new Date().toISOString().split('T')[0],
        piket: '',
        cpu: { capacity: '', free: '', used: '', unit: 'GHz' },
        memory: { capacity: '', free: '', used: '', unit: 'GB' },
        storage: {
            universal: { capacity: '', free: '', used: '', unit: 'TB' },
            datastores: [] as any[]
        },
        notes: ''
    })

    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetch('/api/datastores')
                if (res.ok) {
                    const ds = await res.json()
                    setDatastores(ds)
                    setFormData(prev => ({
                        ...prev,
                        storage: {
                            ...prev.storage,
                            datastores: ds.map((d: any) => ({ name: d.name, capacity: '', free: '', used: '', unit: 'GB' }))
                        }
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch datastores:', error)
            }
        }
        init()
    }, [])

    useEffect(() => {
        const fetchPic = async () => {
            if (!formData.tgl) return
            setLoadingPic(true)
            try {
                const res = await fetch(`/api/pic-schedule?date=${formData.tgl}`)
                if (res.ok) {
                    const data = await res.json()
                    setFormData(prev => ({ ...prev, piket: data.piket || '' }))
                }
            } catch (error) {
                console.error('Failed to fetch PIC:', error)
            } finally {
                setLoadingPic(false)
            }
        }
        fetchPic()
    }, [formData.tgl])

    const validateStep = () => {
        const newErrors: any = {}
        if (step === 1) {
            if (!formData.tgl) newErrors.tgl = true
            if (!formData.piket) newErrors.piket = true
        } else if (step === 2) {
            if (!formData.cpu.capacity) newErrors['cpu.capacity'] = true
            if (!formData.cpu.used) newErrors['cpu.used'] = true
        } else if (step === 3) {
            if (!formData.memory.capacity) newErrors['memory.capacity'] = true
            if (!formData.memory.used) newErrors['memory.used'] = true
        } else if (step === 4) {
            if (!formData.storage.universal.capacity) newErrors['storage.universal.capacity'] = true
            if (!formData.storage.universal.used) newErrors['storage.universal.used'] = true
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep()) setStep(s => s + 1)
    }

    const handleSubmit = async () => {
        if (!validateStep()) return
        setLoading(true)
        try {
            const res = await fetch('/api/rcs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                alert('Data submitted successfully!')
                onSuccess()
            }
        } catch (error) {
            alert('Failed to submit data')
        } finally {
            setLoading(false)
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold">General Information</h3>
                        <InputField
                            label="Date"
                            type="date"
                            value={formData.tgl}
                            onChange={(v: string) => setFormData({ ...formData, tgl: v })}
                            error={errors.tgl}
                        />
                        <div className="relative">
                            <InputField
                                label="Officer On Duty (Piket)"
                                value={formData.piket}
                                readOnly
                                error={errors.piket}
                            />
                            {loadingPic && <Loader2 className="absolute right-3 top-9 w-4 h-4 animate-spin text-blue-500" />}
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold">CPU Resources</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField
                                label="Capacity"
                                type="number"
                                suffix="GHz"
                                value={formData.cpu.capacity}
                                onChange={(v: string) => setFormData({ ...formData, cpu: { ...formData.cpu, capacity: v } })}
                                error={errors['cpu.capacity']}
                            />
                            <InputField
                                label="Free"
                                type="number"
                                suffix="GHz"
                                value={formData.cpu.free}
                                onChange={(v: string) => setFormData({ ...formData, cpu: { ...formData.cpu, free: v } })}
                            />
                            <InputField
                                label="Used"
                                type="number"
                                suffix="GHz"
                                value={formData.cpu.used}
                                onChange={(v: string) => setFormData({ ...formData, cpu: { ...formData.cpu, used: v } })}
                                error={errors['cpu.used']}
                            />
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold">Memory Resources</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField
                                label="Capacity"
                                type="number"
                                suffix="GB"
                                value={formData.memory.capacity}
                                onChange={(v: string) => setFormData({ ...formData, memory: { ...formData.memory, capacity: v } })}
                                error={errors['memory.capacity']}
                            />
                            <InputField
                                label="Free"
                                type="number"
                                suffix="GB"
                                value={formData.memory.free}
                                onChange={(v: string) => setFormData({ ...formData, memory: { ...formData.memory, free: v } })}
                            />
                            <InputField
                                label="Used"
                                type="number"
                                suffix="GB"
                                value={formData.memory.used}
                                onChange={(v: string) => setFormData({ ...formData, memory: { ...formData.memory, used: v } })}
                                error={errors['memory.used']}
                            />
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="space-y-8 overflow-y-auto pr-2" style={{ maxHeight: '60vh' }}>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Universal Storage</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField
                                    label="Capacity"
                                    type="number"
                                    suffix="Unit"
                                    onUnitChange={(u: string) => setFormData({ ...formData, storage: { ...formData.storage, universal: { ...formData.storage.universal, unit: u } } })}
                                    unitValue={formData.storage.universal.unit}
                                    unitOptions={['TB', 'GB', 'MB']}
                                    value={formData.storage.universal.capacity}
                                    onChange={(v: string) => setFormData({ ...formData, storage: { ...formData.storage, universal: { ...formData.storage.universal, capacity: v } } })}
                                    error={errors['storage.universal.capacity']}
                                />
                                <InputField
                                    label="Free"
                                    type="number"
                                    readOnly={true}
                                    suffix={formData.storage.universal.unit}
                                    value={formData.storage.universal.free}
                                    onChange={(v: string) => setFormData({ ...formData, storage: { ...formData.storage, universal: { ...formData.storage.universal, free: v } } })}
                                />
                                <InputField
                                    label="Used"
                                    type="number"
                                    suffix={formData.storage.universal.unit}
                                    value={formData.storage.universal.used}
                                    onChange={(v: string) => {
                                        const cap = parseFloat(formData.storage.universal.capacity) || 0;
                                        const used = parseFloat(v) || 0;
                                        setFormData({
                                            ...formData,
                                            storage: {
                                                ...formData.storage,
                                                universal: {
                                                    ...formData.storage.universal,
                                                    used: v,
                                                    free: (cap - used).toString()
                                                }
                                            }
                                        })
                                    }}
                                    error={errors['storage.universal.used']}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-bold border-t pt-6 dark:border-slate-700">Datastore Storage</h3>
                            {formData.storage.datastores.map((ds, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-4">
                                    <h4 className="font-bold text-blue-600 dark:text-blue-400">{ds.name}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <InputField
                                            label="Capacity"
                                            type="number"
                                            suffix="Unit"
                                            onUnitChange={(u: string) => {
                                                const newDs = [...formData.storage.datastores]
                                                newDs[idx].unit = u
                                                setFormData({ ...formData, storage: { ...formData.storage, datastores: newDs } })
                                            }}
                                            unitValue={ds.unit}
                                            unitOptions={['TB', 'GB', 'MB']}
                                            value={ds.capacity}
                                            onChange={(v: string) => {
                                                const newDs = [...formData.storage.datastores]
                                                newDs[idx].capacity = v
                                                setFormData({ ...formData, storage: { ...formData.storage, datastores: newDs } })
                                            }}
                                        />
                                        <InputField
                                            label="Free"
                                            type="number"
                                            readOnly={true}
                                            suffix={ds.unit}
                                            value={ds.free}
                                            onChange={(v: string) => {
                                                const newDs = [...formData.storage.datastores]
                                                newDs[idx].free = v
                                                setFormData({ ...formData, storage: { ...formData.storage, datastores: newDs } })
                                            }}
                                        />
                                        <InputField
                                            label="Used"
                                            type="number"
                                            suffix={ds.unit}
                                            value={ds.used}
                                            onChange={(v: string) => {
                                                const newDs = [...formData.storage.datastores]
                                                const cap = parseFloat(newDs[idx].capacity) || 0;
                                                const used = parseFloat(v) || 0;
                                                newDs[idx].used = v
                                                newDs[idx].free = (cap - used).toString()
                                                setFormData({ ...formData, storage: { ...formData.storage, datastores: newDs } })
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case 5:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold">Notes & Completion</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Notes / Remarks</label>
                            <textarea
                                rows={5}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                placeholder="Enter any additional notes..."
                            />
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="relative">
            <button onClick={onClose} className="absolute -right-4 -top-4 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-500 transition-all z-10">
                <X className="w-5 h-5" />
            </button>

            <div className="mb-8 pr-10"> {/* Add padding to avoid close button */}
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Step {step} of 5</p>
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(s => (
                            <div key={s} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${s <= step ? 'bg-blue-600 scale-x-110' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        ))}
                    </div>
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">Resources Checklist</h2>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center mt-10 pt-6 border-t dark:border-slate-700">
                <button
                    onClick={() => setStep(s => s - 1)}
                    disabled={step === 1}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>

                {step < 5 ? (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                    >
                        Next Step
                        <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Submit Report
                    </button>
                )}
            </div>
        </div>
    )
}
