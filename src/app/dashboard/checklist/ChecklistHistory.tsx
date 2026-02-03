'use client'

import { useEffect, useState } from 'react'
import { Printer, Calendar, User } from 'lucide-react'

type ChecklistItem = {
  _id: string
  tgl: string
  piket: string
  pac: { temp: string; humdty: string; alarm: string }
  ups: { ups1: string; ups2: string }
  fss: { lcdPanel: string; selenoid: string }
  ems: { tempRoom1: string; tempRoom2: string }
  raisedFloor?: {
    physicalCondition: string
    cleanliness: string
    airflowCooling: string
    notes: string
    status: string
  }
  rackCabling: { rack: string; cabling: string }
  acSplitLights: { acSplit: string; lights: string }
  cctvDc: string
  noted: string
}

export default function ChecklistHistory({ refreshKey, month }: { refreshKey: number; month: string }) {
  const [data, setData] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/checklist?month=${month}`)
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error('Failed to fetch history', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [refreshKey, month])

  if (loading) return (
    <div className="py-20 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )

  if (data.length === 0) return (
    <div className="py-20 text-center text-slate-500 dark:text-slate-400">
      No checklist records found for this month.
    </div>
  )

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4 border-b dark:border-slate-600">Date</th>
              <th className="px-6 py-4 border-b dark:border-slate-600">Officer</th>
              <th className="px-6 py-4 border-b dark:border-slate-600">PAC (T/H)</th>
              <th className="px-6 py-4 border-b dark:border-slate-600">UPS</th>
              <th className="px-6 py-4 border-b dark:border-slate-600">FSS</th>
              <th className="px-6 py-4 border-b dark:border-slate-600">EMS</th>
              <th className="px-6 py-4 border-b dark:border-slate-600">Raised Floor</th>
              <th className="px-6 py-4 border-b dark:border-slate-600 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(item.tgl).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    {item.piket?.split(',')[0] || '-'} & {item.piket?.split(',')[1] || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-blue-600 dark:text-blue-400">{item.pac.temp}°C</span> / {item.pac.humdty}%
                </td>
                <td className="px-6 py-4 text-xs">
                  <div className="flex flex-col">
                    <span className={item.ups.ups1 !== 'Normal' ? 'text-red-500 font-bold' : ''}>U1: {item.ups.ups1}</span>
                    <span className={item.ups.ups2 !== 'Normal' ? 'text-red-500 font-bold' : ''}>U2: {item.ups.ups2}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs">
                  <div>LCD: {item.fss.lcdPanel}</div>
                  <div>Sel: {item.fss.selenoid}</div>
                </td>
                <td className="px-6 py-4 text-xs">
                  <div>R1: {item.ems.tempRoom1}°C</div>
                  <div>R2: {item.ems.tempRoom2}°C</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.raisedFloor?.status === 'Critical' ? 'bg-red-100 text-red-700' :
                    item.raisedFloor?.status === 'Issue' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                    {item.raisedFloor?.status || 'OK'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <a
                    href={`/dashboard/checklist/print/${item._id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-100 dark:border-blue-800"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
