'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Save } from 'lucide-react'

const InputGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-4 p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full">
    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
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
        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 transition-all ${
          readOnly ? 'cursor-not-allowed opacity-70 bg-slate-100 dark:bg-slate-800' : ''
        } ${
          error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400'
        } ${suffix ? 'pr-10' : ''}`}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 dark:text-slate-400">
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
        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-2 appearance-none transition-all cursor-pointer ${
          error
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
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && <span className="text-xs text-red-500">Please select an option</span>}
  </div>
)

export default function ChecklistForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [loadingPic, setLoadingPic] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, boolean>>({}) // Track errors by field key
  const totalSteps = 8
  
  // Transition lock state to prevent double-click submissions
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
      notes: 'No issue found', 
      status: '' 
    },
    rackCabling: { rack: '', cabling: '' },
    acSplitLights: { acSplit: '', lights: '' },
    cctvDc: '',
    noted: '',
  })
  
  // Fetch PIC schedule when date changes
  useEffect(() => { // eslint-disable-next-line
    const fetchPic = async () => {
      if (!formData.tgl) return
      
      setLoadingPic(true)
      try {
        const res = await fetch(`/api/pic-schedule?date=${formData.tgl}`)
        if (res.ok) {
          const data = await res.json()
          if (data.piket) {
            setFormData(prev => ({ ...prev, piket: data.piket }))
            // Clear error if it existed
            if (errors['piket']) {
              setErrors(prev => ({ ...prev, piket: false }))
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch PIC schedule', error)
      } finally {
        setLoadingPic(false)
      }
    }

    const timer = setTimeout(() => {
        fetchPic()
    }, 500) // Debounce slightly to avoid rapid requests on manual typing if it were a text field (though here it's date picker)

    return () => clearTimeout(timer)
  }, [formData.tgl])



  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (section: string, field: string, value: string) => {
    // Clear error for this field when user types
    const errorKey = section === 'root' ? field : `${section}.${field}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: false }))
    }

    if (section === 'root') {
      setFormData((prev) => ({ ...prev, [field]: value }))
    } else {
      setFormData((prev) => ({
        ...prev,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [section]: { 
            ...(prev as any)[section], 
            [field]: (field === 'temp' || field === 'humdty' || field === 'tempRoom1' || field === 'tempRoom2') 
                ? Number(value) 
                : value 
        },
      }))
    }
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, boolean> = {}
    let isValid = true

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
    } else if (currentStep === 8) {
      // 'noted' is optional
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      isValid = false
    }

    return isValid
  }

  const handleNext = () => {
    if (isTransitioning) return // Lock navigation
    if (validateStep(step)) {
      setErrors({})
      setIsTransitioning(true) // Engage lock
      setStep((s) => Math.min(s + 1, totalSteps))
      window.scrollTo(0, 0)
      setTimeout(() => setIsTransitioning(false), 500) // Release after 0.5s sequence
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isTransitioning) return // Prevent if locked

    console.log('handleSubmit called', { step, totalSteps })
    
    // If not last step, explicitly treat as Next and STOP
    if (step < totalSteps) {
        console.log('Not last step, redirecting to handleNext')
        handleNext()
        return
    }
    
    if (!validateStep(step)) return

    // Confirmation dialog - DOUBLE CHECK step
    if (step === totalSteps) {
        if (!confirm('Confirmation: Save monthly checklist data?')) {
          return
        }
    } else {
        return // Should never reach here due to first check, but safety first
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to submit')
      alert('Data submitted successfully!')
      if (onSuccess) onSuccess()
      setStep(1)
      setFormData({
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
        cctvDc: '',
        noted: '',
      })
    } catch (error) {
      console.error(error)
      alert('Error submitting data')
    } finally {
      setLoading(false)
    }
  }

  const prevStep = () => {
    if (isTransitioning) return // Lock navigation
    setErrors({})
    setIsTransitioning(true)
    setStep((s) => Math.max(s - 1, 1))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <InputGroup label="General Information">
            <InputField
              label="Date"
              type="date"
              value={formData.tgl}
              onChange={(v) => handleChange('root', 'tgl', v)}
              error={errors['tgl']}
            />
            <div className="relative">
              <InputField
                label="Officer On Duty (Piket)"
                value={formData.piket}
                onChange={(v) => handleChange('root', 'piket', v)}
                error={errors['piket']}
                readOnly
              />
              {loadingPic && (
                <div className="absolute right-3 top-9">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </InputGroup>
        )
      case 2:
        return (
          <InputGroup label="PAC System">
            <InputField 
                label="Temperature" 
                value={formData.pac.temp} 
                onChange={(v) => handleChange('pac', 'temp', v)} 
                error={errors['pac.temp']} 
                type="number"
                suffix="°C"
            />
            <InputField 
                label="Humidity" 
                value={formData.pac.humdty} 
                onChange={(v) => handleChange('pac', 'humdty', v)} 
                error={errors['pac.humdty']} 
                type="number"
                suffix="%"
            />
            <SelectField
              label="Alarm Status"
              value={formData.pac.alarm}
              onChange={(v) => handleChange('pac', 'alarm', v)}
              options={['Normal', 'Alarm']}
              error={errors['pac.alarm']}
            />
          </InputGroup>
        )
      case 3:
        return (
          <InputGroup label="UPS System">
            <SelectField
              label="UPS 1"
              value={formData.ups.ups1}
              onChange={(v) => handleChange('ups', 'ups1', v)}
              options={['Normal', 'Backup', 'Fault', 'Off']}
              error={errors['ups.ups1']}
            />
            <SelectField
              label="UPS 2"
              value={formData.ups.ups2}
              onChange={(v) => handleChange('ups', 'ups2', v)}
              options={['Normal', 'Backup', 'Fault', 'Off']}
              error={errors['ups.ups2']}
            />
          </InputGroup>
        )
      case 4:
        return (
          <InputGroup label="Fire Suppression System (FSS)">
            <SelectField
              label="LCD Panel"
              value={formData.fss.lcdPanel}
              onChange={(v) => handleChange('fss', 'lcdPanel', v)}
              options={['Normal', 'Error', 'Off']}
              error={errors['fss.lcdPanel']}
            />
            <SelectField
              label="Selenoid"
              value={formData.fss.selenoid}
              onChange={(v) => handleChange('fss', 'selenoid', v)}
              options={['Normal', 'Warning', 'Danger']}
              error={errors['fss.selenoid']}
            />
          </InputGroup>
        )
      case 5:
        return (
          <InputGroup label="Environment Monitoring System (EMS)">
            <InputField 
                label="Temp Room 1" 
                value={formData.ems.tempRoom1} 
                onChange={(v) => handleChange('ems', 'tempRoom1', v)} 
                error={errors['ems.tempRoom1']} 
                type="number"
                suffix="°C"
            />
            <InputField 
                label="Temp Room 2" 
                value={formData.ems.tempRoom2} 
                onChange={(v) => handleChange('ems', 'tempRoom2', v)} 
                error={errors['ems.tempRoom2']} 
                type="number"
                suffix="°C"
            />
          </InputGroup>
        )
      case 6:
        return (
          <InputGroup label="Raised Floor">
            <SelectField
              label="Physical Condition"
              value={formData.raisedFloor.physicalCondition}
              onChange={(v) => handleChange('raisedFloor', 'physicalCondition', v)}
              options={['Good', 'Bad', 'Damaged']}
              error={errors['raisedFloor.physicalCondition']}
            />
            <SelectField
              label="Cleanliness"
              value={formData.raisedFloor.cleanliness}
              onChange={(v) => handleChange('raisedFloor', 'cleanliness', v)}
              options={['Clean', 'Dirty', 'Dusty']}
              error={errors['raisedFloor.cleanliness']}
            />
            <SelectField
              label="Airflow & Cooling"
              value={formData.raisedFloor.airflowCooling}
              onChange={(v) => handleChange('raisedFloor', 'airflowCooling', v)}
              options={['Normal', 'Blocked', 'Weak']}
              error={errors['raisedFloor.airflowCooling']}
            />
            <SelectField
              label="Overall Status"
              value={formData.raisedFloor.status}
              onChange={(v) => handleChange('raisedFloor', 'status', v)}
              options={['OK', 'Issue', 'Critical']}
              error={errors['raisedFloor.status']}
            />
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">
                    Notes
                </label>
                <input
                    type="text"
                    value={formData.raisedFloor.notes}
                    onChange={(e) => handleChange('raisedFloor', 'notes', e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
                    placeholder="e.g. No issue found"
                />
            </div>
          </InputGroup>
        )
      case 7:
          return (
          <div className="space-y-6">
            <InputGroup label="Infrastructure">
              <SelectField
                label="Rack Status"
                value={formData.rackCabling.rack}
                onChange={(v) => handleChange('rackCabling', 'rack', v)}
                options={['Clean', 'Dirty']}
                error={errors['rackCabling.rack']}
              />
              <SelectField
                label="Cabling"
                value={formData.rackCabling.cabling}
                onChange={(v) => handleChange('rackCabling', 'cabling', v)}
                options={['Tidy', 'Messy']}
                error={errors['rackCabling.cabling']}
              />
              <SelectField
                label="AC Split"
                value={formData.acSplitLights.acSplit}
                onChange={(v) => handleChange('acSplitLights', 'acSplit', v)}
                options={['On', 'Off', 'Problem']}
                error={errors['acSplitLights.acSplit']}
              />
              <SelectField
                label="Lights"
                value={formData.acSplitLights.lights}
                onChange={(v) => handleChange('acSplitLights', 'lights', v)}
                options={['On', 'Off', 'Problem']}
                error={errors['acSplitLights.lights']}
              />
              <SelectField
                label="CCTV DC"
                value={formData.cctvDc}
                onChange={(v) => handleChange('root', 'cctvDc', v)}
                options={['Online', 'Offline', 'Blur']}
                error={errors['cctvDc']}
              />
            </InputGroup>
          </div>
        )
      case 8:
        return (
          <InputGroup label="Additional Information">
            <div className="bg-white dark:bg-slate-800 p-1 rounded-xl">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">
                    Notes / Keterangan Tambahan
                </label>
                <textarea
                    rows={4}
                    value={formData.noted}
                    onChange={(e) => handleChange('root', 'noted', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all resize-none"
                    placeholder="Tuliskan catatan tambahan jika ada..."
                />
            </div>
          </InputGroup>
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">New Checklist Entry</h2>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Step {step} of {totalSteps}
                </span>
            </div>
            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>
        </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1 || isTransitioning}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
            step === 1 || isTransitioning
              ? 'text-slate-300 cursor-not-allowed hidden'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isTransitioning}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || isTransitioning}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
                <span>Saving...</span>
            ) : (
                <>
                    <Save className="w-4 h-4" />
                    Submit Checklist
                </>
            )}
          </button>
        )}
      </div>
    </form>
  )
}
