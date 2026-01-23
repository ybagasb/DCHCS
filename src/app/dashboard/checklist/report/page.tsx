'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useReactToPrint } from 'react-to-print'
import { FileText, Printer, Loader2, ArrowLeft } from 'lucide-react'
import { div } from 'framer-motion/client'

interface ChecklistItem {
  _id: string
  tgl: string
  piket: string
  pac: { temp: number; humdty: number; alarm: string }
  ups: { ups1: string; ups2: string }
  ems: { tempRoom1: number; tempRoom2: number }
  raisedFloor: { status: string; notes?: string }
  rackCabling: { rack: string; cabling: string }
  acSplitLights: { acSplit: string; lights: string }
  cctvDc: string
  noted: string
}

export default function MonthlyReportPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ChecklistItem[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const componentRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Monthly_Checklist_Report_${month}_${year}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  } as any)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/checklist/monthly?month=${month}&year=${year}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch report', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 print:hidden">
        <div>
          <Link href="/dashboard/checklist" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-2 transition-colors print:hidden">
            <ArrowLeft className="w-4 h-4" />
            Back to Checklist
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Monthly Report
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View and print daily checklist logs for a specific month.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <Link
            href={`/dashboard/checklist/print/monthly?month=${month}&year=${year}`}
            target="_blank"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Preview
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div ref={componentRef} className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 print:shadow-none print:border-none print:p-0">
          
          <div className="hidden print:block mb-6 text-center">
            <h2 className="text-2xl font-bold text-black border-b-2 border-black pb-2 mb-2">DAILY CHECKLIST REPORT DATA CENTER</h2>
            <p className="text-sm text-gray-600">Period: {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="py-20 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              No data found for this period.
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700 print:bg-gray-200 text-slate-700 dark:text-slate-200 print:text-black">
                  <th className="border p-2 min-w-[50px]">Date</th>
                  <th className="border p-2">Officer</th>
                  <th className="border p-2 text-center" colSpan={3}>PAC System</th>
                  <th className="border p-2 text-center" colSpan={2}>UPS</th>
                  <th className="border p-2 text-center" colSpan={2}>EMS</th>
                  <th className="border p-2 text-center">Floor</th>
                  <th className="border p-2 text-center" colSpan={5}>Infrastructure</th>
                  <th className="border p-2">Notes</th>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800 print:bg-white text-[10px] text-center text-slate-500 print:text-gray-600">
                  <th className="border p-1"></th>
                  <th className="border p-1"></th>
                  <th className="border p-1">Temp</th>
                  <th className="border p-1">Hum</th>
                  <th className="border p-1">Alarm</th>
                  <th className="border p-1">UPS 1</th>
                  <th className="border p-1">UPS 2</th>
                  <th className="border p-1">R1</th>
                  <th className="border p-1">R2</th>
                  <th className="border p-1">Stat</th>
                  <th className="border p-1">Rack</th>
                  <th className="border p-1">Cable</th>
                  <th className="border p-1">AC Spl</th>
                  <th className="border p-1">Light</th>
                  <th className="border p-1">CCTV</th>
                  <th className="border p-1"></th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-300 print:text-black">
                {data.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 print:hover:bg-transparent">
                    <td className="border p-2 text-center whitespace-nowrap">
                      {new Date(item.tgl).getDate()}
                    </td>
                    <td className="border p-2 font-medium truncate max-w-[100px]">{item.piket}</td>
                    
                    {/* PAC */}
                    <td className="border p-2 text-center">{item.pac?.temp}</td>
                    <td className="border p-2 text-center">{item.pac?.humdty}</td>
                    <td className={`border p-2 text-center ${item.pac?.alarm !== 'Normal' ? 'text-red-500 font-bold print:text-black' : ''}`}>
                      {item.pac?.alarm === 'Normal' ? 'N' : '!'}
                    </td>

                    {/* UPS */}
                    <td className="border p-2 text-center">{item.ups?.ups1 === 'Normal' ? 'N' : item.ups?.ups1?.substring(0,1)}</td>
                    <td className="border p-2 text-center">{item.ups?.ups2 === 'Normal' ? 'N' : item.ups?.ups2?.substring(0,1)}</td>

                    {/* EMS */}
                    <td className="border p-2 text-center">{item.ems?.tempRoom1}</td>
                    <td className="border p-2 text-center">{item.ems?.tempRoom2}</td>

                    {/* Raised Floor */}
                    <td className="border p-2 text-center font-medium">
                        {item.raisedFloor?.status === 'OK' ? 'OK' : (
                            <span className={item.raisedFloor?.status === 'Critical' ? 'text-red-500 font-bold' : 'text-yellow-600 font-bold'}>
                                {item.raisedFloor?.status || '-'}
                            </span>
                        )}
                    </td>

                    {/* Infra */}
                    <td className="border p-2 text-center">{item.rackCabling?.rack === 'Clean' ? 'OK' : 'X'}</td>
                    <td className="border p-2 text-center">{item.rackCabling?.cabling === 'Tidy' ? 'OK' : 'X'}</td>
                    <td className="border p-2 text-center">{item.acSplitLights?.acSplit === 'On' ? 'ON' : 'OFF'}</td>
                    <td className="border p-2 text-center">{item.acSplitLights?.lights === 'On' ? 'ON' : 'OFF'}</td>
                    <td className="border p-2 text-center">{item.cctvDc === 'Online' ? 'ON' : 'OFF'}</td>

                    <td className="border p-2 text-[10px] break-words max-w-[150px]">
                      <div className="flex flex-col gap-1">
                        {item.noted && <span>{item.noted}</span>}
                        {item.raisedFloor?.notes && item.raisedFloor?.notes !== 'No issue found' && (
                            <span className="italic text-slate-500">Floor: {item.raisedFloor.notes}</span>
                        )}
                        {!item.noted && (!item.raisedFloor?.notes || item.raisedFloor?.notes === 'No issue found') && '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="hidden print:block mt-8">
            <div className="flex justify-end mt-10">
                <div className="mr-12 text-center">
                    <p className="mb-20">Mengetahui/Diperiksa Oleh,</p>
                    <div className="border-b border-black w-40 mx-auto"></div>
                    <p className="mt-2 text-sm">(IT Infrastructure)</p>
                </div>
            </div>
            <div className="mt-8 text-[10px] text-gray-500">
                Legend: N = Normal, OK = Good/Clean/Tidy, ! = Alarm/Warning, X = Dirty/Messy
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
