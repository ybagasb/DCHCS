'use client'

import { useEffect, useState } from 'react'

type ChecklistItem = {
  _id: string
  tgl: string
  piket: string
  pac: { temp: string; humdty: string; alarm: string }
  ups: { ups1: string; ups2: string }
  fss: { lcdPanel: string; selenoid: string }
  ems: { tempRoom1: string; tempRoom2: string }
  rackCabling: { rack: string; cabling: string }
  acSplitLights: { acSplit: string; lights: string }
  cctvDc: string
  noted: string
}

export default function ChecklistHistory({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/checklist')
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error('Failed to fetch history', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [refreshKey])

  if (loading) return <div className="text-center py-4 text-slate-500">Loading history...</div>
  if (data.length === 0) return <div className="text-center py-4 text-slate-500">No records found.</div>

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
          <tr>
            <th className="px-6 py-3 whitespace-nowrap">Date</th>
            <th className="px-6 py-3 whitespace-nowrap">Officer</th>
            <th className="px-6 py-3 whitespace-nowrap">PAC (T/H)</th>
            <th className="px-6 py-3 whitespace-nowrap">UPS</th>
            <th className="px-6 py-3 whitespace-nowrap">FSS</th>
            <th className="px-6 py-3 whitespace-nowrap">EMS (R1/R2)</th>
            <th className="px-6 py-3 whitespace-nowrap">Infra</th>
            <th className="px-6 py-3 whitespace-nowrap">CCTV</th>
            <th className="px-6 py-3 whitespace-nowrap">Notes</th>
            <th className="px-6 py-3 whitespace-nowrap text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item._id}
              className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                {new Date(item.tgl).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                {item.piket || '-'}
              </td>
              <td className="px-6 py-4">
                {item.pac.temp}°C / {item.pac.humdty}%
                {item.pac.alarm && <div className="text-red-500 text-xs mt-1">Alarm: {item.pac.alarm}</div>}
              </td>
              <td className="px-6 py-4">
                <div>1: {item.ups.ups1}</div>
                <div>2: {item.ups.ups2}</div>
              </td>
              <td className="px-6 py-4">
                <div>LCD: {item.fss.lcdPanel}</div>
                <div>Sel: {item.fss.selenoid}</div>
              </td>
              <td className="px-6 py-4">
                <div>1: {item.ems.tempRoom1}°C</div>
                <div>2: {item.ems.tempRoom2}°C</div>
              </td>
              <td className="px-6 py-4">
                <div>Rack: {item.rackCabling.rack}</div>
                <div>Cab: {item.rackCabling.cabling}</div>
                <div>AC: {item.acSplitLights.acSplit}</div>
                <div>Light: {item.acSplitLights.lights}</div>
              </td>
              <td className="px-6 py-4">{item.cctvDc}</td>
              <td className="px-6 py-4 max-w-xs truncate" title={item.noted}>
                {item.noted || '-'}
              </td>
              <td className="px-6 py-4 text-center">
                <a
                  href={`/dashboard/checklist/print/${item._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors"
                  title="Print Checklist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
