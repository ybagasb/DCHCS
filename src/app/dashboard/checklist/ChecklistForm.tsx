'use client'

import { useState } from 'react'
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
}: {
  label: string
  value: string
  onChange: (val: string) => void
  error?: boolean
  type?: string
}) => (
  <div className="flex flex-col gap-2">
    <label className={`text-sm font-semibold ${error ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 transition-all ${
        error
          ? 'border-red-500 focus:ring-red-200'
          : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400'
      }`}
    />
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
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, boolean>>({}) // Track errors by field key
  const totalSteps = 6

  const [formData, setFormData] = useState({
    tgl: new Date().toISOString().split('T')[0],
    piket: '',
    pac: { temp: '', humdty: '', alarm: '' },
    ups: { ups1: '', ups2: '' },
    fss: { lcdPanel: '', selenoid: '' },
    ems: { tempRoom1: '', tempRoom2: '' },
    rackCabling: { rack: '', cabling: '' },
    acSplitLights: { acSplit: '', lights: '' },
    cctvDc: '',
    noted: '',
  })

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
        [section]: { ...(prev as any)[section], [field]: value },
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
      if (!formData.rackCabling.rack) newErrors['rackCabling.rack'] = true
      if (!formData.rackCabling.cabling) newErrors['rackCabling.cabling'] = true
      if (!formData.acSplitLights.acSplit) newErrors['acSplitLights.acSplit'] = true
      if (!formData.acSplitLights.lights) newErrors['acSplitLights.lights'] = true
      if (!formData.cctvDc) newErrors['cctvDc'] = true
      // 'noted' is optional
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      isValid = false
    }

    return isValid
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, totalSteps))
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate final step before submitting
    if (!validateStep(step)) return

    // Confirmation dialog
    if (!confirm('Are you certain you want to verify and submit this checklist data?')) {
      return
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

  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

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
            <InputField
              label="Officer On Duty (Piket)"
              value={formData.piket}
              onChange={(v) => handleChange('root', 'piket', v)}
              error={errors['piket']}
            />
          </InputGroup>
        )
      case 2:
        return (
          <InputGroup label="PAC System">
            <InputField label="Temperature" value={formData.pac.temp} onChange={(v) => handleChange('pac', 'temp', v)} error={errors['pac.temp']} />
            <InputField label="Humidity" value={formData.pac.humdty} onChange={(v) => handleChange('pac', 'humdty', v)} error={errors['pac.humdty']} />
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
            <InputField label="Temp Room 1" value={formData.ems.tempRoom1} onChange={(v) => handleChange('ems', 'tempRoom1', v)} error={errors['ems.tempRoom1']} />
            <InputField label="Temp Room 2" value={formData.ems.tempRoom2} onChange={(v) => handleChange('ems', 'tempRoom2', v)} error={errors['ems.tempRoom2']} />
          </InputGroup>
        )
      case 6:
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
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">
                    Additional Notes
                </label>
                <textarea
                    rows={3}
                    value={formData.noted}
                    onChange={(e) => handleChange('root', 'noted', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all resize-none"
                    placeholder="Any observations or issues..."
                />
            </div>
          </div>
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
          disabled={step === 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
            step === 1
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
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
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
