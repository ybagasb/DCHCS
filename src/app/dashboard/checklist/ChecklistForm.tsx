'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Save, X, Loader2 } from 'lucide-react'

const InputGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-4 p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 h-full">
    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
      {label}
    </h3>
    <div className="grid grid-cols-1 gap-6">{children}</div>
  </div>
)

const InputField = ({
  label,
  value,
  onChange,
  error,
  type = 'text',
  readOnly = false,
  suffix,
}: {
  label: string
  value: string
  onChange: (val: string) => void
  error?: boolean
  type?: string
  readOnly?: boolean
  suffix?: string
}) => (
  <div className="flex flex-col gap-2">
    <label className={`text-sm font-semibold ${error ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 disabled:opacity-50 transition-all ${readOnly ? 'cursor-not-allowed opacity-70 bg-slate-100 dark:bg-slate-800' : ''
          } ${error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium'
          } ${suffix ? 'pr-12' : ''}`}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 my-1.5 mr-1.5 px-2 rounded-lg">
          {suffix}
        </div>
      )}
    </div>
    {error && <span className="text-xs text-red-500">This field is required</span>}
  </div>
)

const SelectField = ({
  label,
  value,
  onChange,
  error,
  options,
}: {
  label: string
  value: string
  onChange: (val: string) => void
  error?: boolean
  options: string[]
}) => (
  <div className="flex flex-col gap-2">
    <label className={`text-sm font-semibold ${error ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 appearance-none transition-all cursor-pointer font-medium ${error
          ? 'border-red-500 focus:ring-red-200'
          : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-100'
          }`}
      >
        <option value="" disabled>
          Select status...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
        <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
      </div>
    </div>
    {error && <span className="text-xs text-red-500">Please select an option</span>}
  </div>
)

const HddGrid = ({
  label,
  count,
  data,
  vertical = false,
  noteValue,
  onToggle,
  onNoteChange
}: {
  label: string;
  count: number;
  data: boolean[];
  vertical?: boolean;
  noteValue: string;
  onToggle: (idx: number) => void;
  onNoteChange: (val: string) => void;
}) => (
  <div className="space-y-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-50 dark:border-slate-700/50 pb-2 flex justify-between items-center">
      {label}
      <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[9px] font-black">{count} HDDS</span>
    </h4>
    <div className={`grid ${vertical ? 'grid-flow-col grid-rows-5 gap-1.5' : 'grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2'}`}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onToggle(i)}
          className={`group relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${data[i]
            ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-lg shadow-amber-200 dark:shadow-amber-900/20 ring-1 ring-amber-500'
            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
        >
          <span className={`text-[8px] font-bold ${data[i] ? 'text-amber-800' : 'text-slate-400 dark:text-slate-500'}`}>{i + 1}</span>
          <div className={`w-3 h-1 mt-1 rounded-full ${data[i] ? 'bg-amber-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />

          {data[i] && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-amber-600 text-white text-[8px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl">
              AMBER DETECTED
            </div>
          )}
        </button>
      ))}
    </div>
    <div className="relative mt-2 group">
      <textarea
        placeholder={`Catatan untuk ${label}...`}
        rows={1}
        value={noteValue}
        onChange={(e) => onNoteChange(e.target.value)}
        className="w-full px-3 py-2 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all italic font-medium text-slate-600 dark:text-slate-300 placeholder-slate-400 pr-8"
      />
      <div className="absolute right-3 top-2.5 opacity-30 group-focus-within:opacity-100 group-focus-within:text-amber-500 transition-all pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
      </div>
    </div>
  </div>
)

export default function ChecklistForm({ onSuccess, onClose }: { onSuccess?: () => void; onClose?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [loadingPic, setLoadingPic] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const totalSteps = 9
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [formData, setFormData] = useState({
    tgl: new Date().toISOString().split('T')[0],
    piket: '',
    pac: { temp: '', humdty: '', alarm: '' },
    ups: { ups1: '', ups2: '' },
    fss: { lcdPanel: '', selenoid: '' },
    ems: { tempRoom1: '', tempRoom2: '' },
    raisedFloor: {
      physicalCondition: '',
      cleanliness: '',
      airflowCooling: '',
      notes: '',
      status: ''
    },
    rackCabling: { rack: '', cabling: '' },
    acSplitLights: { acSplit: '', lights: '' },
    storage: {
      rack3: { msa2050: Array(24).fill(false), notes: '' },
      rack4: {
        msa2040: Array(24).fill(false),
        note_msa2040: '',
        d3710_1: Array(25).fill(false),
        note_d3710_1: '',
        d3710_2: Array(25).fill(false),
        note_d3710_2: '',
        notes: ''
      },
      rack5: { dl380: Array(24).fill(false), notes: '' }
    },
    cctvDc: '',
    noted: '',
  })


  useEffect(() => {
    const fetchPic = async () => {
      if (!formData.tgl) return
      setLoadingPic(true)
      try {
        const res = await fetch(`/api/pic-schedule?date=${formData.tgl}`)
        if (res.ok) {
          const data = await res.json()
          if (data.piket) {
            setFormData(prev => ({ ...prev, piket: data.piket }))
            if (errors['piket']) setErrors(prev => ({ ...prev, piket: false }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch PIC schedule', error)
      } finally {
        setLoadingPic(false)
      }
    }
    fetchPic()
  }, [formData.tgl])

  const handleChange = (section: string, field: string, value: string) => {
    const errorKey = section === 'root' ? field : `${section}.${field}`
    if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: false }))

    if (section === 'root') {
      setFormData((prev) => ({ ...prev, [field]: value }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev as any)[section],
          [field]: (field === 'temp' || field === 'humdty' || field === 'tempRoom1' || field === 'tempRoom2')
            ? value
            : value
        },
      }))
    }
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, boolean> = {}
    if (currentStep === 1) {
      if (!formData.tgl) newErrors['tgl'] = true
      if (!formData.piket.trim()) newErrors['piket'] = true
    } else if (currentStep === 2) {
      if (!formData.pac.temp) newErrors['pac.temp'] = true
      if (!formData.pac.humdty) newErrors['pac.humdty'] = true
      if (!formData.pac.alarm) newErrors['pac.alarm'] = true
    } else if (currentStep === 3) {
      if (!formData.ups.ups1) newErrors['ups.ups1'] = true
      if (!formData.ups.ups2) newErrors['ups.ups2'] = true
    } else if (currentStep === 4) {
      if (!formData.fss.lcdPanel) newErrors['fss.lcdPanel'] = true
      if (!formData.fss.selenoid) newErrors['fss.selenoid'] = true
    } else if (currentStep === 5) {
      if (!formData.ems.tempRoom1) newErrors['ems.tempRoom1'] = true
      if (!formData.ems.tempRoom2) newErrors['ems.tempRoom2'] = true
    } else if (currentStep === 6) {
      if (!formData.raisedFloor.physicalCondition) newErrors['raisedFloor.physicalCondition'] = true
      if (!formData.raisedFloor.cleanliness) newErrors['raisedFloor.cleanliness'] = true
      if (!formData.raisedFloor.airflowCooling) newErrors['raisedFloor.airflowCooling'] = true
      if (!formData.raisedFloor.status) newErrors['raisedFloor.status'] = true
    } else if (currentStep === 7) {
      if (!formData.rackCabling.rack) newErrors['rackCabling.rack'] = true
      if (!formData.rackCabling.cabling) newErrors['rackCabling.cabling'] = true
      if (!formData.acSplitLights.acSplit) newErrors['acSplitLights.acSplit'] = true
      if (!formData.acSplitLights.lights) newErrors['acSplitLights.lights'] = true
      if (!formData.cctvDc) newErrors['cctvDc'] = true
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }
    return true
  }

  const handleNext = () => {
    if (isTransitioning) return
    if (validateStep(step)) {
      setErrors({})
      setIsTransitioning(true)
      setStep((s) => Math.min(s + 1, totalSteps))
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(step)) return

    setLoading(true)
    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to submit')
      alert('Checklist submitted successfully!')
      if (onSuccess) onSuccess()
    } catch (error) {
      alert('Error submitting data')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <InputGroup label="General Information">
            <InputField label="Date" type="date" value={formData.tgl} onChange={(v) => handleChange('root', 'tgl', v)} error={errors['tgl']} />
            <div className="relative">
              <InputField label="Officer (Piket)" value={formData.piket} onChange={(v) => handleChange('root', 'piket', v)} error={errors['piket']} readOnly />
              {loadingPic && <div className="absolute right-3 top-9 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
            </div>
          </InputGroup>
        )
      case 2:
        return (
          <InputGroup label="PAC System">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Temperature" value={formData.pac.temp} onChange={(v) => handleChange('pac', 'temp', v)} error={errors['pac.temp']} type="number" suffix="°C" />
              <InputField label="Humidity" value={formData.pac.humdty} onChange={(v) => handleChange('pac', 'humdty', v)} error={errors['pac.humdty']} type="number" suffix="%" />
            </div>
            <SelectField label="Alarm Status" value={formData.pac.alarm} onChange={(v) => handleChange('pac', 'alarm', v)} options={['Normal', 'Alarm']} error={errors['pac.alarm']} />
          </InputGroup>
        )
      case 3:
        return (
          <InputGroup label="UPS System">
            <SelectField label="UPS 1" value={formData.ups.ups1} onChange={(v) => handleChange('ups', 'ups1', v)} options={['Normal', 'Backup', 'Fault', 'Off']} error={errors['ups.ups1']} />
            <SelectField label="UPS 2" value={formData.ups.ups2} onChange={(v) => handleChange('ups', 'ups2', v)} options={['Normal', 'Backup', 'Fault', 'Off']} error={errors['ups.ups2']} />
          </InputGroup>
        )
      case 4:
        return (
          <InputGroup label="Fire Suppression (FSS)">
            <SelectField label="LCD Panel" value={formData.fss.lcdPanel} onChange={(v) => handleChange('fss', 'lcdPanel', v)} options={['Normal', 'Error', 'Off']} error={errors['fss.lcdPanel']} />
            <SelectField label="Selenoid" value={formData.fss.selenoid} onChange={(v) => handleChange('fss', 'selenoid', v)} options={['Normal', 'Warning', 'Danger']} error={errors['fss.selenoid']} />
          </InputGroup>
        )
      case 5:
        return (
          <InputGroup label="Environment Monitoring (EMS)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Temp Room 1" value={formData.ems.tempRoom1} onChange={(v) => handleChange('ems', 'tempRoom1', v)} error={errors['ems.tempRoom1']} type="number" suffix="°C" />
              <InputField label="Temp Room 2" value={formData.ems.tempRoom2} onChange={(v) => handleChange('ems', 'tempRoom2', v)} error={errors['ems.tempRoom2']} type="number" suffix="°C" />
            </div>
          </InputGroup>
        )
      case 6:
        return (
          <InputGroup label="Raised Floor">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Physical" value={formData.raisedFloor.physicalCondition} onChange={(v) => handleChange('raisedFloor', 'physicalCondition', v)} options={['Good', 'Bad', 'Damaged']} error={errors['raisedFloor.physicalCondition']} />
              <SelectField label="Cleanliness" value={formData.raisedFloor.cleanliness} onChange={(v) => handleChange('raisedFloor', 'cleanliness', v)} options={['Clean', 'Dirty', 'Dusty']} error={errors['raisedFloor.cleanliness']} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Airflow" value={formData.raisedFloor.airflowCooling} onChange={(v) => handleChange('raisedFloor', 'airflowCooling', v)} options={['Normal', 'Blocked', 'Weak']} error={errors['raisedFloor.airflowCooling']} />
              <SelectField label="Overall Status" value={formData.raisedFloor.status} onChange={(v) => handleChange('raisedFloor', 'status', v)} options={['OK', 'Issue', 'Critical']} error={errors['raisedFloor.status']} />
            </div>
            <InputField label="Notes" value={formData.raisedFloor.notes} onChange={(v) => handleChange('raisedFloor', 'notes', v)} />
          </InputGroup>
        )
      case 7:
        return (
          <InputGroup label="Infrastructures">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Rack Status" value={formData.rackCabling.rack} onChange={(v) => handleChange('rackCabling', 'rack', v)} options={['Clean & Locked', 'Dirty']} error={errors['rackCabling.rack']} />
              <SelectField label="Cabling" value={formData.rackCabling.cabling} onChange={(v) => handleChange('rackCabling', 'cabling', v)} options={['Tidy', 'Messy']} error={errors['rackCabling.cabling']} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField label="AC Split" value={formData.acSplitLights.acSplit} onChange={(v) => handleChange('acSplitLights', 'acSplit', v)} options={['On', 'Off', 'Problem']} error={errors['acSplitLights.acSplit']} />
              <SelectField label="Lights" value={formData.acSplitLights.lights} onChange={(v) => handleChange('acSplitLights', 'lights', v)} options={['On', 'Off', 'Problem']} error={errors['acSplitLights.lights']} />
              <SelectField label="CCTV DC" value={formData.cctvDc} onChange={(v) => handleChange('root', 'cctvDc', v)} options={['Online', 'Offline', 'Blur']} error={errors['cctvDc']} />
            </div>
          </InputGroup>
        )
      case 8:
        const handleHddToggle = (rack: string, controller: string, index: number) => {
          setFormData(prev => ({
            ...prev,
            storage: {
              ...(prev.storage as any),
              [rack]: {
                ...(prev.storage as any)[rack],
                [controller]: (prev.storage as any)[rack][controller].map((val: boolean, i: number) => i === index ? !val : val)
              }
            }
          }))
        }

        const handleRackNoteChange = (rack: string, key: string, val: string) => {
          setFormData(prev => ({
            ...prev,
            storage: {
              ...(prev.storage as any),
              [rack]: {
                ...(prev.storage as any)[rack],
                [key]: val
              }
            }
          }))
        }

        return (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-xl">
              <h3 className="text-amber-800 dark:text-amber-200 font-bold text-sm mb-2 flex items-center gap-2">
                ⚠️ STORAGE HEALTH MONITORING (HDD AMBER)
              </h3>
              <ul className="text-[11px] text-amber-700 dark:text-amber-300 space-y-1 font-medium">
                <li>• Centang tombol jika status HDD adalah <strong>AMBER / ERROR</strong>.</li>
                <li>• Catat <strong>Size (Kapasitas)</strong> dan <strong>Tipe</strong> HDD yang bermasalah pada kolom catatan.</li>
                <li>• Jika ditemukan HDD Amber, segera lapor ke bagian terkait!</li>
              </ul>
            </div>

            <div className="space-y-6 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {/* RACK 3 */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">R3</span>
                  RACK 03 - STORAGE MSA 2050
                </h3>
                <HddGrid
                  label="MSA 2050 Controller"
                  count={24}
                  data={(formData.storage as any).rack3.msa2050}
                  onToggle={(idx) => handleHddToggle('rack3', 'msa2050', idx)}
                  noteValue={(formData.storage as any).rack3.notes}
                  onNoteChange={(val) => handleRackNoteChange('rack3', 'notes', val)}
                />
              </div>

              {/* RACK 4 */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">R4</span>
                  RACK 04 - STORAGE CLUSTER
                </h3>
                <HddGrid
                  label="MSA 2040 Controller"
                  count={24}
                  data={(formData.storage as any).rack4.msa2040}
                  onToggle={(idx) => handleHddToggle('rack4', 'msa2040', idx)}
                  noteValue={(formData.storage as any).rack4.note_msa2040}
                  onNoteChange={(val) => handleRackNoteChange('rack4', 'note_msa2040', val)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <HddGrid
                    label="Enclosure D3710 (1)"
                    count={25}
                    vertical
                    data={(formData.storage as any).rack4.d3710_1}
                    onToggle={(idx) => handleHddToggle('rack4', 'd3710_1', idx)}
                    noteValue={(formData.storage as any).rack4.note_d3710_1}
                    onNoteChange={(val) => handleRackNoteChange('rack4', 'note_d3710_1', val)}
                  />
                  <HddGrid
                    label="Enclosure D3710 (2)"
                    count={25}
                    vertical
                    data={(formData.storage as any).rack4.d3710_2}
                    onToggle={(idx) => handleHddToggle('rack4', 'd3710_2', idx)}
                    noteValue={(formData.storage as any).rack4.note_d3710_2}
                    onNoteChange={(val) => handleRackNoteChange('rack4', 'note_d3710_2', val)}
                  />
                </div>
              </div>

              {/* RACK 5 */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 pb-10">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px]">R5</span>
                  RACK 05 - BACKUP STORAGE
                </h3>
                <HddGrid
                  label="DL380 PROLIANT GEN10"
                  count={24}
                  data={(formData.storage as any).rack5.dl380}
                  onToggle={(idx) => handleHddToggle('rack5', 'dl380', idx)}
                  noteValue={(formData.storage as any).rack5.notes}
                  onNoteChange={(val) => handleRackNoteChange('rack5', 'notes', val)}
                />
              </div>
            </div>
          </div>
        )
      case 9:
        return (
          <InputGroup label="Additional Information">
            <textarea
              rows={5}
              value={formData.noted}
              onChange={(e) => handleChange('root', 'noted', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all resize-none font-medium"
              placeholder="Any additional notes..."
            />
          </InputGroup>
        )
    }
  }

  return (
    <div className="relative">
      <button onClick={onClose} className="absolute -right-4 -top-4 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-500 transition-all z-10">
        <X className="w-5 h-5" />
      </button>

      <div className="mb-8 pr-10">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Step {step} of {totalSteps}</p>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-blue-600 scale-x-110' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Daily DC Checklist</h2>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center mt-10 pt-6 border-t dark:border-slate-700">
        <button
          type="button"
          onClick={() => setStep(s => Math.max(s - 1, 1))}
          disabled={step === 1}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            Next Step <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Submit Checklist
          </button>
        )}
      </div>
    </div>
  )
}
