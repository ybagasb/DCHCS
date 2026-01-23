import React from 'react'
import { connectDB } from '@/lib/mongodb'
import { Checklist } from '@/models/Checklist'
import PrintButton from '../[id]/PrintButton'

export const dynamic = 'force-dynamic'

export default async function MonthlyPrintPage(props: {
  searchParams: Promise<{ month: string; year: string }>
}) {
  const searchParams = await props.searchParams
  const month = parseInt(searchParams.month) || new Date().getMonth() + 1
  const year = parseInt(searchParams.year) || new Date().getFullYear()

  await connectDB()

  const startDate = new Date(Date.UTC(year, month - 1, 1))
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

  // Fetch data sorted by date
  const rawData = await Checklist.find({
    tgl: {
      $gte: startDate.toISOString(),
      $lte: endDate.toISOString(),
    },
  })
  .sort({ tgl: 1 })
  .lean()

  // Helper logic for status (duplicated from print/[id] for consistency, could be shared util)
  const evaluateStatus = (value: any, type: 'range' | 'lessThan' | 'equal', ref: any) => {
      if (value === undefined || value === null || value === '') return { text: '-', color: '' };
      const val = String(value).trim();
      
      if (type === 'range') {
          const num = parseFloat(val);
          if (isNaN(num)) return { text: 'Invalid', color: 'text-red-500 font-bold' };
          if (num >= ref[0] && num <= ref[1]) return { text: 'Normal', color: '' };
          return { text: 'Check', color: 'text-red-600 font-bold' }; 
      }
      if (type === 'lessThan') {
          const num = parseFloat(val);
          if (isNaN(num)) return { text: 'Invalid', color: 'text-red-500 font-bold' };
          if (num < ref) return { text: 'Normal', color: '' };
          return { text: 'Check', color: 'text-red-600 font-bold' };
      }
      if (type === 'equal') {
           if (val.toLowerCase() === String(ref).toLowerCase()) return { text: 'Normal', color: '' };
           return { text: 'Check', color: 'text-red-600 font-bold' };
      }
      return { text: '-', color: '' };
  }

  const monthName = new Date(year, month - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-white text-black p-8 font-serif print:p-0">
      {/* Print Button */}
      <div className="print:hidden mb-6 flex justify-between items-center">
        <a href="/dashboard/checklist/report" className="text-blue-600 hover:underline flex items-center gap-1">
            &larr; Back to Report
        </a>
        <PrintButton />
      </div>

      {/* Document Container - A4 Landscape Width approx 297mm */}
      <div className="w-[297mm] mx-auto bg-white print:w-full print:max-w-none origin-top-left print:scale-95">
        
        {/* Kop Surat */}
        <header className="border-b-4 border-black mb-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://www.brantas-abipraya.co.id/sites/default/files/LOGO%20ABIPRAYA%20%281%29_1.png" 
                  alt="Logo Brantas Abipraya"
                  className="w-full h-full object-contain"
                />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-wide">PT BRANTAS ABIPRAYA (Persero)</h1>
              <p className="text-xs">Jl. D.I. Panjaitan Kav. 14, Jakarta 13340</p>
            </div>
          </div>
          <div className="text-right">
             <h2 className="text-lg font-bold uppercase border-2 border-black inline-block px-3 py-1">
                Laporan Checklist Data Center - {monthName}
             </h2>
          </div>
        </header>

        {/* Table */}
        <div className="border border-black">
            <table className="w-full text-[9px] border-collapse">
                <thead>
                <tr className="bg-gray-200 text-center">
                  <th className="border border-black p-1 min-w-[30px]" rowSpan={2}>Tgl</th>
                  <th className="border border-black p-1" rowSpan={2}>Petugas</th>
                  <th className="border border-black p-1" colSpan={3}>PAC System (19-24°C / 40-60%)</th>
                  <th className="border border-black p-1" colSpan={2}>UPS</th>
                  <th className="border border-black p-1" colSpan={2}>EMS (&lt;25°C)</th>
                  <th className="border border-black p-1" colSpan={1}>Floor</th>
                  <th className="border border-black p-1" colSpan={5}>Infrastructure</th>
                  <th className="border border-black p-1" rowSpan={2}>Notes</th>
                </tr>
                <tr className="bg-gray-100 text-center">
                  <th className="border border-black p-1">Temp</th>
                  <th className="border border-black p-1">Hum</th>
                  <th className="border border-black p-1">Alarm</th>
                  <th className="border border-black p-1">UPS1</th>
                  <th className="border border-black p-1">UPS2</th>
                  <th className="border border-black p-1">R1</th>
                  <th className="border border-black p-1">R2</th>
                  <th className="border border-black p-1">Stat</th>
                  <th className="border border-black p-1">Rack</th>
                  <th className="border border-black p-1">Cabl</th>
                  <th className="border border-black p-1">AC</th>
                  <th className="border border-black p-1">Light</th>
                  <th className="border border-black p-1">CCTV</th>
                </tr>
                </thead>
                <tbody>
                    {rawData.length === 0 ? (
                        <tr><td colSpan={18} className="text-center p-4">No data found</td></tr>
                    ) : (
                        rawData.map((item: any) => (
                         <tr key={item._id} className="text-center hover:bg-gray-50 print:hover:bg-transparent">
                            <td className="border border-black p-1">{new Date(item.tgl).getDate()}</td>
                            <td className="border border-black p-1 whitespace-nowrap overflow-hidden max-w-[60px] text-left px-2" title={item.piket}>
                                {item.piket?.split(',')[0]}
                            </td>
                            
                            {/* PAC */}
                            <td className={`border border-black p-1 ${evaluateStatus(item.pac?.temp, 'range', [19, 24]).color}`}>
                                {item.pac?.temp}
                            </td>
                            <td className={`border border-black p-1 ${evaluateStatus(item.pac?.humdty, 'range', [40, 60]).color}`}>
                                {item.pac?.humdty}
                            </td>
                            <td className={`border border-black p-1 font-bold ${item.pac?.alarm !== 'Normal' ? 'text-red-600' : ''}`}>
                                {item.pac?.alarm === 'Normal' ? 'OK' : '!'}
                            </td>

                            {/* UPS */}
                            <td className="border border-black p-1">{item.ups?.ups1 === 'Normal' ? 'OK' : item.ups?.ups1?.substring(0,1)}</td>
                            <td className="border border-black p-1">{item.ups?.ups2 === 'Normal' ? 'OK' : item.ups?.ups2?.substring(0,1)}</td>

                            {/* EMS */}
                            <td className={`border border-black p-1 ${evaluateStatus(item.ems?.tempRoom1, 'lessThan', 25).color}`}>
                                {item.ems?.tempRoom1}
                            </td>
                            <td className={`border border-black p-1 ${evaluateStatus(item.ems?.tempRoom2, 'lessThan', 25).color}`}>
                                {item.ems?.tempRoom2}
                            </td>

                            {/* Raised Floor */}
                            <td className={`border border-black p-1 font-bold ${item.raisedFloor?.status === 'OK' ? '' : 'text-red-600'}`}>
                                {item.raisedFloor?.status}
                            </td>

                            {/* Infra */}
                            <td className="border border-black p-1">{item.rackCabling?.rack === 'Clean' ? 'OK' : 'X'}</td>
                            <td className="border border-black p-1">{item.rackCabling?.cabling === 'Tidy' ? 'OK' : 'X'}</td>
                            <td className="border border-black p-1">{item.acSplitLights?.acSplit === 'On' ? 'OK' : 'X'}</td>
                            <td className="border border-black p-1">{item.acSplitLights?.lights === 'On' ? 'OK' : 'X'}</td>
                            <td className="border border-black p-1">{item.cctvDc === 'Online' ? 'OK' : 'X'}</td>

                            <td className="border border-black p-1 text-left text-[8px] max-w-[150px] overflow-hidden whitespace-nowrap">
                                {item.noted ? item.noted : ''}
                                {item.raisedFloor?.notes && item.raisedFloor.notes !== 'No issue found' ? ` | RF: ${item.raisedFloor.notes}` : ''}
                            </td>
                         </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Legend */}
        <div className="mt-2 text-[8px] flex gap-4">
            <span>Legend: </span>
            <span className="font-bold">OK</span> = Normal/Good/Clean/Tidy/On/Online
            <span className="font-bold text-red-600">!</span> = Alarm/Warning
            <span className="font-bold text-red-600">X</span> = Dirty/Messy/Off/Problem
        </div>


        {/* Signatures */}
        <div className="mt-4 flex justify-end page-break-inside-avoid">
            <div className="mr-8 text-center bg-white">
                <p className="mb-12 text-xs">Mengetahui,</p>
                <p className="font-bold text-xs underline">VP Inovasi & Trasf. Digital</p>
            </div>
             <div className="text-center bg-white">
                <p className="mb-12 text-xs">Dibuat Oleh,</p>
                <p className="font-bold text-xs underline">Staf IT Infrastructure</p>
            </div>
        </div>

        <style type="text/css" media="print">{`
            @page { size: landscape; margin: 10mm; }
        `}</style>
      </div>
    </div>
  )
}
