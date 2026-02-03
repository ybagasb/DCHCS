import React from 'react'
import { connectDB } from '@/lib/mongodb'
import { Rcs } from '@/models/Rcs'
import { Datastore } from '@/models/Datastore'
import Link from 'next/link'
import RcsPrintControls from './RcsPrintControls'

export const dynamic = 'force-dynamic'

export default async function RcsMonthlyPrintPage(props: {
    searchParams: Promise<{ month: string }>
}) {
    const searchParams = await props.searchParams
    const queryMonth = searchParams.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const [year, month] = queryMonth.split('-').map(Number)

    await connectDB()

    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

    // Fetch RCS data and Datastores
    const [rawData, datastores] = await Promise.all([
        Rcs.find({
            tgl: {
                $gte: startDate,
                $lte: endDate,
            },
        }).sort({ tgl: 1 }).lean(),
        Datastore.find({}).sort({ name: 1 }).lean()
    ])

    const monthName = new Date(year, month - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' })

    return (
        <div className="bg-white text-black min-h-screen p-4 text-[10px] sm:text-xs print:p-0 font-sans">
            <RcsPrintControls month={queryMonth} />

            {/* Header - Standardized like Image 1 */}
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
                    <h1 className="font-bold text-sm uppercase">LAPORAN RESOURCES CHECK SYSTEM - {monthName}</h1>
                </div>
            </div>

            {/* Helper for rendering values with inline units */}
            {(() => {
                const renderMetric = (val: any, unit: string, isBig = false) => (
                    <div className="whitespace-nowrap flex items-baseline justify-center gap-1">
                        <span className={isBig ? "font-bold text-[10px]" : "font-semibold"}>{val || '-'}</span>
                        <span className="text-[6px] opacity-50 uppercase font-normal">{unit}</span>
                    </div>
                );

                return (
                    <div className="space-y-10">
                        {/* SECTION 1: COMPUTE RESOURCES */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b-2 border-black pb-1">
                                <h2 className="font-extrabold text-[10px] uppercase tracking-[0.2em]">01. Compute Resources (CPU & Memory)</h2>
                                <span className="text-[8px] italic opacity-60">Monthly Infrastructure Health Check</span>
                            </div>
                            <div className="border border-black overflow-hidden shadow-sm">
                                <table className="w-full text-center border-collapse table-fixed">
                                    <thead>
                                        <tr className="bg-gray-100 border-b border-black text-[8px] font-bold">
                                            <th className="border-r border-black p-2 bg-gray-200 w-[45px]">Tgl</th>
                                            <th className="border-r border-black p-2 bg-gray-200 w-[100px]">Petugas</th>
                                            <th className="border-r border-black p-2 bg-gray-100" colSpan={3}>CPU Performance</th>
                                            <th className="border-r border-black p-2 bg-gray-100" colSpan={3}>RAM Utilization</th>
                                            <th className="p-2 bg-gray-200 w-[200px]">Catatan / Notes</th>
                                        </tr>
                                        <tr className="bg-gray-50 border-b border-black text-[7px] uppercase tracking-tighter">
                                            <th className="border-r border-black"></th>
                                            <th className="border-r border-black"></th>
                                            <th className="border-r border-black p-1">Cap</th>
                                            <th className="border-r border-black p-1">Free</th>
                                            <th className="border-r border-black p-1 font-bold">Used</th>
                                            <th className="border-r border-black p-1">Cap</th>
                                            <th className="border-r border-black p-1">Free</th>
                                            <th className="border-r border-black p-1 font-bold">Used</th>
                                            <th className=""></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-300 text-[8px]">
                                        {rawData.length === 0 ? (
                                            <tr><td colSpan={9} className="py-10 text-gray-400">Data not yet recorded for this period.</td></tr>
                                        ) : (
                                            rawData.map((item: any, idx) => (
                                                <tr key={item._id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/20 transition-colors`}>
                                                    <td className="p-2 font-bold text-[10px] border-r border-black">{new Date(item.tgl).getDate()}</td>
                                                    <td className="p-2 text-left border-r border-black">
                                                        <div className="font-medium leading-tight">
                                                            {item.piket?.split(',')[0]} &
                                                            {item.piket?.split(',')[1]}
                                                        </div>
                                                    </td>
                                                    <td className="border-r border-gray-200">{renderMetric(item.cpu.capacity, item.cpu.unit || 'GHz')}</td>
                                                    <td className="border-r border-gray-200">{renderMetric(item.cpu.free, item.cpu.unit || 'GHz')}</td>
                                                    <td className="border-r border-black bg-blue-50/30">{renderMetric(item.cpu.used, item.cpu.unit || 'GHz', true)}</td>
                                                    <td className="border-r border-gray-200">{renderMetric(item.memory.capacity, item.memory.unit || 'GB')}</td>
                                                    <td className="border-r border-gray-200">{renderMetric(item.memory.free, item.memory.unit || 'GB')}</td>
                                                    <td className="border-r border-black bg-indigo-50/30">{renderMetric(item.memory.used, item.memory.unit || 'GB', true)}</td>
                                                    <td className="p-2 text-left text-[7px] italic text-gray-600 truncate">{item.notes || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* SECTION 2: STORAGE RESOURCES */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b-2 border-black pb-1">
                                <h2 className="font-extrabold text-[10px] uppercase tracking-[0.2em]">02. Storage Resources (Universal & Datastores)</h2>
                                <span className="text-[8px] italic opacity-60 text-red-600 font-bold">* Check Free Space Thresholds</span>
                            </div>
                            <div className="border border-black overflow-hidden shadow-sm">
                                <table className="w-full text-center border-collapse table-fixed">
                                    <thead>
                                        <tr className="bg-gray-100 border-b border-black text-[8px] font-bold">
                                            <th className="border-r border-black p-2 bg-gray-200 w-[45px]" rowSpan={2}>Tgl</th>
                                            <th className="border-r border-black p-2 bg-gray-200 w-[80px]" rowSpan={2}>Petugas</th>
                                            <th className="border-r border-black p-2 bg-gray-100" colSpan={3}>Universal Storage Cluster</th>
                                            <th className="p-2 bg-gray-100 w-[450px]" rowSpan={2}>Individual Datastores Performance Grid</th>
                                        </tr>
                                        <tr className="bg-gray-50 border-b border-black text-[7px] uppercase tracking-tighter">
                                            <th className="border-r border-black p-1">Cap</th>
                                            <th className="border-r border-black p-1 text-red-600">Free</th>
                                            <th className="border-r border-black p-1 font-bold">Used</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black text-[8px]">
                                        {rawData.length === 0 ? (
                                            <tr><td colSpan={6} className="py-10 text-gray-400">Data not yet recorded for this period.</td></tr>
                                        ) : (
                                            rawData.map((item: any, idx) => {
                                                return (
                                                    <tr key={item._id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                                        <td className="p-2 font-black text-[10px] border-r border-black bg-gray-50/50">{new Date(item.tgl).getDate()}</td>
                                                        <td className="p-2 text-left border-r border-black align-top font-medium">
                                                            {item.piket?.split(',')[0]} & {item.piket?.split(',')[1]}
                                                        </td>
                                                        <td className="border-r border-gray-200">{renderMetric(item.storage.universal.capacity, item.storage.universal.unit || 'TB')}</td>
                                                        <td className="border-r border-gray-200 text-red-600 font-bold">{renderMetric(item.storage.universal.free, item.storage.universal.unit || 'TB')}</td>
                                                        <td className="border-r border-black bg-emerald-50/30">{renderMetric(item.storage.universal.used, item.storage.universal.unit || 'TB', true)}</td>

                                                        {/* Datastore Grid Cell - Increased columns and reduced padding */}
                                                        <td className="p-1.5 align-top text-left bg-white/50">
                                                            <div className="grid grid-cols-4 gap-y-1.5 gap-x-3">
                                                                {datastores.map((ds: any) => {
                                                                    const dsData = item.storage.datastores.find((d: any) => d.name === ds.name);
                                                                    const unit = dsData?.unit || 'GB';
                                                                    return (
                                                                        <div key={ds._id} className="flex flex-col border-b border-gray-100 pb-0.5">
                                                                            <span className="text-[6px] font-bold uppercase text-blue-600 truncate">{ds.name}</span>
                                                                            <div className="flex justify-between items-center text-[7px] leading-none">
                                                                                <span className="opacity-40">U/C:</span>
                                                                                <span className="font-bold">{dsData?.used || '0'}/{dsData?.capacity || '0'}<span className="ml-0.5 text-[5px] uppercase opacity-40">{unit}</span></span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Legend */}
            <div className="mt-4 flex justify-between items-center text-[7px] border-t border-gray-200 pt-2 px-1">
                <div className="flex gap-4 opacity-70 italic font-medium">
                    <span><strong className="not-italic">CAP</strong> = Capacity (Kapasitas Total)</span>
                    <span><strong className="not-italic">FREE</strong> = Tersedia (Kapasitas Kosong)</span>
                    <span><strong className="not-italic">USED</strong> = Digunakan (Pemakaian)</span> |
                    <span><strong className="not-italic">U</strong> = Used (Pemakaian)</span>
                    <span><strong className="not-italic">C</strong> = Capacity (Kapasitas Total)</span>
                </div>
                <div className="text-gray-400 font-bold tracking-widest uppercase">
                    RCS Automated Report Module v2.1
                </div>
            </div>

            {/* Footer / Signatures */}
            <div className="mt-12 flex justify-end gap-16 pr-10">
                <div className="text-center min-w-[150px]">
                    <p className="mb-14 text-[9px] font-medium tracking-tighter">Mengetahui,</p>
                    <div className="border-b border-black w-full mb-1"></div>
                    <p className="font-extrabold uppercase text-[9px]">VP IT & Trasf. Digital</p>
                </div>
                <div className="text-center min-w-[150px]">
                    <p className="mb-14 text-[9px] font-medium tracking-tighter">Dibuat Oleh,</p>
                    <div className="border-b border-black w-full mb-1"></div>
                    <p className="font-extrabold uppercase text-[9px]">Staf IT Infrastructure</p>
                </div>
            </div>
        </div>
    )
}
