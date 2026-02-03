import React from 'react'
import { connectDB } from '@/lib/mongodb'
import { Checklist } from '@/models/Checklist'
import PrintControls from './PrintControls'

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
    <div className="bg-white text-black min-h-screen p-4 text-[10px] sm:text-xs print:p-0 font-sans">
      <PrintControls />

      {/* Header - Standardized */}
      <div className="border-b-[3px] border-black mb-2 pb-2 flex justify-between items-end">
        <div className="flex items-center gap-4">
          <div className="w-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="http://10.10.55.60/sites/default/files/LOGO%20ABIPRAYA%20%281%29_1.png"
              alt="Logo"
              className="w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide">PT BRANTAS ABIPRAYA (PERSERO)</span>
            <span className="text-[10px]">Jl. D.I. Panjaitan Kav. 14, Jakarta 13340</span>
          </div>
        </div>
        <div className="border border-black px-4 py-1">
          <h1 className="font-bold text-sm uppercase">LAPORAN CHECKLIST DATA CENTER - {monthName}</h1>
        </div>
      </div>

      {/* Table */}
      <div className="border border-black overflow-hidden">
        <table className="w-full text-[10px] text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="border-r border-black p-1 bg-gray-200" rowSpan={2}>Tgl</th>
              <th className="border-r border-black p-1 bg-gray-200" rowSpan={2}>Petugas</th>
              <th className="border-r border-black p-1 bg-gray-200" colSpan={3}>PAC System (19-24°C / 40-60%)</th>
              <th className="border-r border-black p-1 bg-gray-200" colSpan={2}>UPS</th>
              <th className="border-r border-black p-1 bg-gray-200" colSpan={2}>EMS (&lt;25°C)</th>
              <th className="border-r border-black p-1 bg-gray-200" colSpan={1}>Floor</th>
              <th className="border-r border-black p-1 bg-gray-200" colSpan={5}>Infrastructure</th>
              <th className="p-1 bg-gray-200" rowSpan={2}>Notes</th>
            </tr>
            <tr className="bg-gray-100 border-b border-black">
              <th className="border-r border-black p-1">Temp</th>
              <th className="border-r border-black p-1">Hum</th>
              <th className="border-r border-black p-1">Alarm</th>
              <th className="border-r border-black p-1">UPS1</th>
              <th className="border-r border-black p-1">UPS2</th>
              <th className="border-r border-black p-1">R1</th>
              <th className="border-r border-black p-1">R2</th>
              <th className="border-r border-black p-1">Stat</th>
              <th className="border-r border-black p-1">Rack</th>
              <th className="border-r border-black p-1">Cabl</th>
              <th className="border-r border-black p-1">AC</th>
              <th className="border-r border-black p-1">Light</th>
              <th className="border-r border-black p-1">CCTV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {rawData.length === 0 ? (
              <tr><td colSpan={16} className="text-center p-4">No data found</td></tr>
            ) : (
              rawData.map((item: any) => (
                <tr key={item._id} className="divide-x divide-black border-b border-black last:border-b-0">
                  <td className="p-1">{new Date(item.tgl).getDate()}</td>
                  <td className="p-1 whitespace-nowrap overflow-hidden max-w-[100px] text-left px-2" title={item.piket}>
                    {item.piket?.split(',')[0]}
                  </td>

                  {/* PAC */}
                  <td className={`p-1 ${evaluateStatus(item.pac?.temp, 'range', [19, 24]).color}`}>
                    {item.pac?.temp}
                  </td>
                  <td className={`p-1 ${evaluateStatus(item.pac?.humdty, 'range', [40, 60]).color}`}>
                    {item.pac?.humdty}
                  </td>
                  <td className={`p-1 font-bold ${item.pac?.alarm !== 'Normal' ? 'text-red-600' : ''}`}>
                    {item.pac?.alarm === 'Normal' ? 'OK' : '!'}
                  </td>

                  {/* UPS */}
                  <td className="p-1">{item.ups?.ups1 === 'Normal' ? 'OK' : item.ups?.ups1?.substring(0, 1)}</td>
                  <td className="p-1">{item.ups?.ups2 === 'Normal' ? 'OK' : item.ups?.ups2?.substring(0, 1)}</td>

                  {/* EMS */}
                  <td className={`p-1 ${evaluateStatus(item.ems?.tempRoom1, 'lessThan', 25).color}`}>
                    {item.ems?.tempRoom1}
                  </td>
                  <td className={`p-1 ${evaluateStatus(item.ems?.tempRoom2, 'lessThan', 25).color}`}>
                    {item.ems?.tempRoom2}
                  </td>

                  {/* Raised Floor - Stat */}
                  <td className={`p-1 font-bold ${item.raisedFloor?.status === 'OK' ? '' : 'text-red-600'}`}>
                    {item.raisedFloor?.status === 'OK' ? 'OK' : 'Issue'}
                  </td>

                  <td className="p-1">{item.rackCabling?.rack === 'Clean & Locked' ? 'OK' : 'X'}</td>
                  <td className="p-1">{item.rackCabling?.cabling === 'Tidy' ? 'OK' : 'X'}</td>
                  <td className="p-1">{item.acSplitLights?.acSplit === 'On' ? 'OK' : 'X'}</td>
                  <td className="p-1">{item.acSplitLights?.lights === 'On' ? 'OK' : 'X'}</td>
                  <td className="p-1">{item.cctvDc === 'Online' ? 'OK' : 'X'}</td>

                  <td className="p-1 text-left text-[9px] max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis px-2">
                    {item.noted ? item.noted : ''}
                    {item.raisedFloor?.notes && item.raisedFloor.notes !== 'No issue found' ? ` ${item.raisedFloor.notes}` : ''}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-2 text-[9px] flex gap-4">
        <span className="font-bold">Legend:</span>
        <span><span className="font-bold">OK</span> = Normal/Good/Clean & Locked/Tidy/On/Online</span>
        <span><span className="font-bold text-red-600">!</span> = Alarm/Warning</span>
        <span><span className="font-bold text-red-600">X</span> = Dirty/Messy/Off/Problem</span>
      </div>

      {/* Footer / Signatures - Simple 2 Col */}
      {/* Footer / Signatures - Aligned Right */}
      <div className="mt-16 flex justify-end gap-20 pr-10">
        <div className="text-center">
          <p className="mb-20">Mengetahui,</p>
          <p className="font-bold underline">VP Inovasi & Trasf. Digital</p>
        </div>
        <div className="text-center">
          <p className="mb-20">Dibuat Oleh,</p>
          <p className="font-bold underline">Staf IT Infrastructure</p>
        </div>
      </div>
    </div>
  )
}
