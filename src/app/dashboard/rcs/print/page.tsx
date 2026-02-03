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

            {/* Table */}
            <div className="border border-black overflow-hidden">
                <table className="w-full text-[9px] text-center border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b border-black">
                            <th className="border-r border-black p-1 bg-gray-200" rowSpan={2}>Tgl</th>
                            <th className="border-r border-black p-1 bg-gray-200" rowSpan={2}>Petugas</th>
                            <th className="border-r border-black p-1 bg-gray-200 font-bold" colSpan={3}>CPU (GHz)</th>
                            <th className="border-r border-black p-1 bg-gray-200 font-bold" colSpan={3}>Memory (GB)</th>
                            <th className="border-r border-black p-1 bg-gray-200 font-bold" colSpan={3}>Storage Universal (TB)</th>
                            {datastores.map((ds: any) => (
                                <th key={ds._id} className="border-r border-black p-1 bg-gray-200 font-bold" colSpan={3}>{ds.name} (GB)</th>
                            ))}
                            <th className="p-1 bg-gray-200" rowSpan={2}>Notes</th>
                        </tr>
                        <tr className="bg-gray-100 border-b border-black">
                            <th className="border-r border-black p-1">Cap</th><th className="border-r border-black p-1">Free</th><th className="border-r border-black p-1">Used</th>
                            <th className="border-r border-black p-1">Cap</th><th className="border-r border-black p-1">Free</th><th className="border-r border-black p-1">Used</th>
                            <th className="border-r border-black p-1">Cap</th><th className="border-r border-black p-1">Free</th><th className="border-r border-black p-1">Used</th>
                            {datastores.map((ds: any) => (
                                <React.Fragment key={ds._id}>
                                    <th className="border-r border-black p-1">Cap</th>
                                    <th className="border-r border-black p-1">Free</th>
                                    <th className="border-r border-black p-1">Used</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                        {rawData.length === 0 ? (
                            <tr><td colSpan={11 + (datastores.length * 3)} className="text-center p-4">No data found</td></tr>
                        ) : (
                            rawData.map((item: any) => (
                                <tr key={item._id} className="divide-x divide-black border-b border-black last:border-b-0">
                                    <td className="p-1">{new Date(item.tgl).getDate()}</td>
                                    <td className="p-1 whitespace-nowrap overflow-hidden max-w-[80px] text-left px-1">
                                        {item.piket?.split(',')[0]} & {item.piket?.split(',')[1]}
                                    </td>

                                    {/* CPU */}
                                    <td className="p-1">{item.cpu.capacity}</td>
                                    <td className="p-1">{item.cpu.free}</td>
                                    <td className="p-1 font-bold">{item.cpu.used}</td>

                                    {/* Memory */}
                                    <td className="p-1">{item.memory.capacity}</td>
                                    <td className="p-1">{item.memory.free}</td>
                                    <td className="p-1 font-bold">{item.memory.used}</td>

                                    {/* Storage Univ */}
                                    <td className="p-1">{item.storage.universal.capacity}</td>
                                    <td className="p-1">{item.storage.universal.free}</td>
                                    <td className="p-1 font-bold">{item.storage.universal.used}</td>

                                    {/* Datastores */}
                                    {datastores.map((ds: any) => {
                                        const dsData = item.storage.datastores.find((d: any) => d.name === ds.name)
                                        return (
                                            <React.Fragment key={ds._id}>
                                                <td className="p-1">{dsData?.capacity || '-'}</td>
                                                <td className="p-1">{dsData?.free || '-'}</td>
                                                <td className="p-1 font-bold">{dsData?.used || '-'}</td>
                                            </React.Fragment>
                                        )
                                    })}

                                    <td className="p-1 text-left text-[8px] max-w-[150px] truncate px-1">
                                        {item.notes || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="mt-2 text-[8px] flex gap-4">
                <span className="font-bold">Keterangan:</span>
                <span>Cap = Capacity, Free = Tersedia, Used = Digunakan</span>
            </div>

            {/* Footer / Signatures */}
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
