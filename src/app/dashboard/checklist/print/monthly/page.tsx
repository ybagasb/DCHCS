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

  const countAmbers = (storage: any) => {
    if (!storage) return 0;
    let count = 0;
    if (storage.rack3?.msa2050) count += storage.rack3.msa2050.filter((x: boolean) => x).length;
    if (storage.rack4?.msa2040) count += storage.rack4.msa2040.filter((x: boolean) => x).length;
    if (storage.rack4?.d3710_1) count += storage.rack4.d3710_1.filter((x: boolean) => x).length;
    if (storage.rack4?.d3710_2) count += storage.rack4.d3710_2.filter((x: boolean) => x).length;
    if (storage.rack5?.dl380) count += storage.rack5.dl380.filter((x: boolean) => x).length;
    return count;
  }

  const renderMetric = (val: any, unit: string) => (
    <div className="flex items-baseline justify-center gap-0.5">
      <span className="font-bold">{val || '-'}</span>
      <span className="text-[6px] opacity-40 uppercase font-normal">{unit}</span>
    </div>
  );

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
              <th className="border-r border-black p-1 bg-gray-200" colSpan={6}>Infrastructure</th>
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
              <th className="border-r border-black p-1">HDD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {rawData.length === 0 ? (
              <tr><td colSpan={17} className="text-center p-4">No data found</td></tr>
            ) : (
              rawData.map((item: any) => (
                <tr key={item._id} className="divide-x divide-black border-b border-black last:border-b-0">
                  <td className="p-1">{new Date(item.tgl).getDate()}</td>
                  <td className="p-1 whitespace-nowrap overflow-hidden max-w-[100px] text-left px-2" title={item.piket}>
                    {item.piket?.split(',')[0]} & {item.piket?.split(',')[1]}
                  </td>

                  {/* PAC */}
                  <td className={`p-1 ${evaluateStatus(item.pac?.temp, 'range', [19, 24]).color}`}>
                    {renderMetric(item.pac?.temp, '°C')}
                  </td>
                  <td className={`p-1 ${evaluateStatus(item.pac?.humdty, 'range', [40, 60]).color}`}>
                    {renderMetric(item.pac?.humdty, '%')}
                  </td>
                  <td className={`p-1 font-bold ${item.pac?.alarm !== 'Normal' ? 'text-red-600' : ''}`}>
                    {item.pac?.alarm === 'Normal' ? 'OK' : '!'}
                  </td>

                  {/* UPS */}
                  <td className="p-1">{item.ups?.ups1 === 'Normal' ? 'OK' : item.ups?.ups1?.substring(0, 1)}</td>
                  <td className="p-1">{item.ups?.ups2 === 'Normal' ? 'OK' : item.ups?.ups2?.substring(0, 1)}</td>

                  {/* EMS */}
                  <td className={`p-1 ${evaluateStatus(item.ems?.tempRoom1, 'lessThan', 25).color}`}>
                    {renderMetric(item.ems?.tempRoom1, '°C')}
                  </td>
                  <td className={`p-1 ${evaluateStatus(item.ems?.tempRoom2, 'lessThan', 25).color}`}>
                    {renderMetric(item.ems?.tempRoom2, '°C')}
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
                  <td className={`p-1 font-bold ${countAmbers(item.storage) > 0 ? 'text-amber-600' : ''}`}>
                    {countAmbers(item.storage) > 0 ? `${countAmbers(item.storage)}!` : 'OK'}
                  </td>

                  <td className="p-1 text-left text-[9px] max-w-[200px] px-2">
                    <div className="flex flex-col gap-0.5">
                      {item.noted && <span className="mb-0.5">{item.noted}</span>}
                      {item.raisedFloor?.notes && item.raisedFloor.notes !== 'No issue found' && (
                        <span className="italic text-gray-600"><span className="font-bold not-italic text-black">[Floor]:</span> {item.raisedFloor.notes}</span>
                      )}
                      {item.storage?.rack3?.notes && <span className="italic text-gray-600"><span className="font-bold not-italic text-black">[Rack 3 MSA 2050]:</span> {item.storage.rack3.notes}</span>}
                      {item.storage?.rack4?.note_msa2040 && <span className="italic text-gray-600"><span className="font-bold not-italic text-black">[R4 MSA 2040]:</span> {item.storage.rack4.note_msa2040}</span>}
                      {item.storage?.rack4?.note_d3710_1 && <span className="italic text-gray-600"><span className="font-bold not-italic text-black">[R4 Encl 1]:</span> {item.storage.rack4.note_d3710_1}</span>}
                      {item.storage?.rack4?.note_d3710_2 && <span className="italic text-gray-600"><span className="font-bold not-italic text-black">[R4 Encl 2]:</span> {item.storage.rack4.note_d3710_2}</span>}
                      {item.storage?.rack4?.notes && <span className="italic text-gray-600"><span className="font-bold not-italic text-black">[Rack 4]:</span> {item.storage.rack4.notes}</span>}
                      {item.storage?.rack5?.notes && <span className="italic text-gray-600"><span className="font-bold not-italic text-black">[Rack 5]:</span> {item.storage.rack5.notes}</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 border border-black p-2 bg-slate-50">
        <p className="font-bold text-[10px] mb-2 border-b border-black/10 pb-1">Keterangan / Legend:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-[9px]">
          <div className="flex items-center gap-2">
            <span className="font-bold w-6 h-4 flex items-center justify-center bg-white border border-black rounded-[2px] shadow-sm">OK</span>
            <span>: Kondisi Normal / Baik / Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold w-6 h-4 flex items-center justify-center bg-white border border-black rounded-[2px] shadow-sm text-red-600">!</span>
            <span>: Alarm / Warning / HDD Amber</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold w-6 h-4 flex items-center justify-center bg-white border border-black rounded-[2px] shadow-sm">X</span>
            <span>: Abnormal / Off / Kotor / Rusak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold w-6 h-4 flex items-center justify-center bg-white border border-black rounded-[2px] shadow-sm text-red-600">Val</span>
            <span>: Nilai Melewati Batas Parameter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold w-6 h-4 flex items-center justify-center bg-white border border-black rounded-[2px] shadow-sm">B</span>
            <span>: UPS Mode Backup</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold w-6 h-4 flex items-center justify-center bg-white border border-black rounded-[2px] shadow-sm">F</span>
            <span>: UPS Fault / Error</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold w-6 h-4 flex items-center justify-center bg-white border border-black rounded-[2px] shadow-sm">O</span>
            <span>: UPS Off / Mati</span>
          </div>
        </div>
      </div>

      {/* Footer / Signatures - Simple 2 Col */}
      {/* Footer / Signatures - Aligned Right */}
      <div className="mt-16 flex justify-end gap-20 pr-10">
        <div className="text-center">
          <p className="mb-20">Mengetahui,</p>
          <p className="font-bold underline">VP IT & Trasf. Digital</p>
        </div>
        <div className="text-center">
          <p className="mb-20">Dibuat Oleh,</p>
          <p className="font-bold underline">Staf IT Infrastructure</p>
        </div>
      </div>
    </div>
  )
}
