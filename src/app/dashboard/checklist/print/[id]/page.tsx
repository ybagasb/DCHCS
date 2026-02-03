import React from 'react'
import { connectDB } from '@/lib/mongodb'
import { Checklist } from '@/models/Checklist'
import { notFound } from 'next/navigation'
import PrintButton from './PrintButton'

export default async function PrintChecklistPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await connectDB()

    // Fetch data
    const item = await Checklist.findById(params.id).lean()
    if (!item) return notFound()

    // Format date
    const dateStr = new Date(item.tgl).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    // Helper logic for status
    const evaluateStatus = (value: any, type: 'range' | 'lessThan' | 'equal', ref: any) => {
        if (value === undefined || value === null || value === '') return { text: '-', color: '' };
        const val = String(value).trim();

        if (type === 'range') {
            const num = parseFloat(val);
            if (isNaN(num)) return { text: 'Invalid', color: 'text-red-500 font-bold' };
            if (num >= ref[0] && num <= ref[1]) return { text: 'Normal', color: '' }; // Range is inclusive
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

    const renderMetric = (val: any, unit: string) => (
        <div className="flex items-baseline justify-center gap-1 font-mono">
            <span className="font-bold">{val || '-'}</span>
            <span className="text-[7px] opacity-40 uppercase font-normal">{unit}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-black p-8 font-serif print:p-0">
            {/* Print Button - Hidden on Print */}
            <div className="print:hidden mb-6 flex justify-end">
                <PrintButton />
            </div>

            {/* Document Container */}
            <div className="max-w-[210mm] mx-auto bg-white print:w-full print:max-w-none">

                {/* Kop Surat / Letterhead */}
                <header className="border-b-4 border-black mb-6 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Logo Placeholder - You would ideally replace this with an Image component */}
                        {/* Logo Abipraya */}
                        <div className="w-20 h-20 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="http://10.10.55.60/sites/default/files/LOGO%20ABIPRAYA%20%281%29_1.png"
                                alt="Logo Brantas Abipraya"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-1xl font-black uppercase tracking-wide">PT BRANTAS ABIPRAYA (Persero)</h1>
                            <p className="text-sm">Jl. D.I. Panjaitan Kav. 14, Jakarta 13340</p>
                            <p className="text-sm">Telp: (021) 8516290 | Fax: (021) 8516289</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold uppercase border-2 border-black inline-block px-4 py-1">
                            Checklist Item Data Center
                        </h2>
                    </div>
                </header>

                {/* General Info */}
                <section className="mb-6 flex justify-between items-end border-b border-black/50 pb-3">
                    <div>
                        <table className="text-sm">
                            <tbody>
                                <tr>
                                    <td className="font-bold pr-4">Hari / Tanggal</td>
                                    <td>: {dateStr}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold pr-4">Petugas Piket</td>
                                    <td>: {item.piket || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* content Table */}
                <div className="border-2 border-black">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-100 print:bg-slate-200">
                                <th className="border border-black px-3 py-1 text-left w-1/4">Category</th>
                                <th className="border border-black px-3 py-1 text-left w-1/4">Item</th>
                                <th className="border border-black px-3 py-1 text-center w-1/4">Value</th>
                                <th className="border border-black px-3 py-1 text-center w-1/4">Reference</th>
                                <th className="border border-black px-3 py-1 text-center w-1/4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* PAC */}
                            <tr>
                                <td className="border border-black px-3 py-1 font-bold" rowSpan={3}>PAC System</td>
                                <td className="border border-black px-3 py-1">Temperature</td>
                                <td className="border border-black px-3 py-1 text-center">{renderMetric(item.pac?.temp, '°C')}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500 text-[10px]">19-24 <span className="text-[7px]">°C</span></td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.pac?.temp, 'range', [19, 24]).color}`}>
                                    {evaluateStatus(item.pac?.temp, 'range', [19, 24]).text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">Humidity</td>
                                <td className="border border-black px-3 py-1 text-center">{renderMetric(item.pac?.humdty, '%')}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500 text-[10px]">40-60 <span className="text-[7px]">%</span></td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.pac?.humdty, 'range', [40, 60]).color}`}>
                                    {evaluateStatus(item.pac?.humdty, 'range', [40, 60]).text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">Alarm</td>
                                <td className={`border border-black px-3 py-1 text-center font-bold ${item.pac?.alarm === 'Alarm' ? 'text-red-600 print:text-black' : ''}`}>
                                    {item.pac?.alarm || '-'}
                                </td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">Normal</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.pac?.alarm, 'equal', 'Normal').color}`}>
                                    {evaluateStatus(item.pac?.alarm, 'equal', 'Normal').text}
                                </td>
                            </tr>

                            {/* UPS */}
                            <tr>
                                <td className="border border-black px-3 py-1 font-bold" rowSpan={2}>UPS System</td>
                                <td className="border border-black px-3 py-1">UPS 1</td>
                                <td className="border border-black px-3 py-1 text-center">{item.ups?.ups1 || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">Normal</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.ups?.ups1, 'equal', 'Normal').color}`}>
                                    {evaluateStatus(item.ups?.ups1, 'equal', 'Normal').text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">UPS 2</td>
                                <td className="border border-black px-3 py-1 text-center">{item.ups?.ups2 || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">Normal</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.ups?.ups2, 'equal', 'Normal').color}`}>
                                    {evaluateStatus(item.ups?.ups2, 'equal', 'Normal').text}
                                </td>
                            </tr>

                            {/* FSS */}
                            <tr>
                                <td className="border border-black px-3 py-1 font-bold" rowSpan={2}>Fire Suppression (FSS)</td>
                                <td className="border border-black px-3 py-1">LCD Panel</td>
                                <td className="border border-black px-3 py-1 text-center">{item.fss?.lcdPanel || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">Normal</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.fss?.lcdPanel, 'equal', 'Normal').color}`}>
                                    {evaluateStatus(item.fss?.lcdPanel, 'equal', 'Normal').text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">Selenoid</td>
                                <td className="border border-black px-3 py-1 text-center">{item.fss?.selenoid || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">Normal</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.fss?.selenoid, 'equal', 'Normal').color}`}>
                                    {evaluateStatus(item.fss?.selenoid, 'equal', 'Normal').text}
                                </td>
                            </tr>

                            {/* EMS */}
                            <tr>
                                <td className="border border-black px-3 py-1 font-bold" rowSpan={2}>Env. Monitoring (EMS)</td>
                                <td className="border border-black px-3 py-1">Temp Room 1</td>
                                <td className="border border-black px-3 py-1 text-center">{renderMetric(item.ems?.tempRoom1, '°C')}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500 text-[10px]">&lt; 25 <span className="text-[7px]">°C</span></td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.ems?.tempRoom1, 'lessThan', 25).color}`}>
                                    {evaluateStatus(item.ems?.tempRoom1, 'lessThan', 25).text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">Temp Room 2</td>
                                <td className="border border-black px-3 py-1 text-center">{renderMetric(item.ems?.tempRoom2, '°C')}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500 text-[10px]">&lt; 25 <span className="text-[7px]">°C</span></td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.ems?.tempRoom2, 'lessThan', 25).color}`}>
                                    {evaluateStatus(item.ems?.tempRoom2, 'lessThan', 25).text}
                                </td>
                            </tr>

                            {/* Raised Floor */}
                            <tr>
                                <td className="border border-black px-3 py-1 font-bold" rowSpan={4}>Raised Floor</td>
                                <td className="border border-black px-3 py-1">Physical Cond.</td>
                                <td className="border border-black px-3 py-1 text-center">{item.raisedFloor?.physicalCondition || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">Good</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.raisedFloor?.physicalCondition, 'equal', 'Good').color}`}>
                                    {evaluateStatus(item.raisedFloor?.physicalCondition, 'equal', 'Good').text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">Cleanliness</td>
                                <td className="border border-black px-3 py-1 text-center">{item.raisedFloor?.cleanliness || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">Clean</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.raisedFloor?.cleanliness, 'equal', 'Clean').color}`}>
                                    {evaluateStatus(item.raisedFloor?.cleanliness, 'equal', 'Clean').text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">Airflow</td>
                                <td className="border border-black px-3 py-1 text-center">{item.raisedFloor?.airflowCooling || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">Normal</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.raisedFloor?.airflowCooling, 'equal', 'Normal').color}`}>
                                    {evaluateStatus(item.raisedFloor?.airflowCooling, 'equal', 'Normal').text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">Overall Status</td>
                                <td className={`border border-black px-3 py-1 text-center font-bold ${item.raisedFloor?.status === 'OK' ? '' : 'text-red-600 print:text-black'}`}>
                                    {item.raisedFloor?.status || '-'}
                                </td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">OK</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.raisedFloor?.status, 'equal', 'OK').color}`}>
                                    {evaluateStatus(item.raisedFloor?.status, 'equal', 'OK').text}
                                </td>
                            </tr>

                            {/* Infrastructure */}
                            <tr>
                                <td className="border border-black px-3 py-1 font-bold" rowSpan={5}>Infrastructure</td>
                                <td className="border border-black px-3 py-1">Rack Status</td>
                                <td className="border border-black px-3 py-1 text-center">{item.rackCabling?.rack || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">Clean & Locked</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.rackCabling?.rack, 'equal', 'Clean & Locked').color}`}>
                                    {evaluateStatus(item.rackCabling?.rack, 'equal', 'Clean & Locked').text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">Cabling</td>
                                <td className="border border-black px-3 py-1 text-center">{item.rackCabling?.cabling || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">Tidy</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.rackCabling?.cabling, 'equal', 'Tidy').color}`}>
                                    {evaluateStatus(item.rackCabling?.cabling, 'equal', 'Tidy').text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">AC Split</td>
                                <td className="border border-black px-3 py-1 text-center">{item.acSplitLights?.acSplit || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">On</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.acSplitLights?.acSplit, 'equal', 'On').color}`}>
                                    {evaluateStatus(item.acSplitLights?.acSplit, 'equal', 'On').text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">Lights</td>
                                <td className="border border-black px-3 py-1 text-center">{item.acSplitLights?.lights || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">On</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.acSplitLights?.lights, 'equal', 'On').color}`}>
                                    {evaluateStatus(item.acSplitLights?.lights, 'equal', 'On').text}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black px-3 py-1">CCTV DC</td>
                                <td className="border border-black px-3 py-1 text-center">{item.cctvDc || '-'}</td>
                                <td className="border border-black px-3 py-1 text-center text-slate-500">Online</td>
                                <td className={`border border-black px-3 py-1 text-center ${evaluateStatus(item.cctvDc, 'equal', 'Online').color}`}>
                                    {evaluateStatus(item.cctvDc, 'equal', 'Online').text}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Physical Storage Health (HDD Amber Check) */}
                <div className="mt-6 border-2 border-black">
                    <div className="bg-slate-200 border-b-2 border-black px-3 py-1 flex justify-between items-center">
                        <h3 className="font-bold uppercase text-[11px]">Physical Storage Health (HDD Amber Check)</h3>
                        <div className="flex gap-4 text-[9px] font-bold">
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-black/20"></div> Normal</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 border border-black/20 flex items-center justify-center text-[8px]">!</div> Amber / Error</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-black">
                        {/* Rack 3 */}
                        <div className="p-2 space-y-2">
                            <h4 className="font-black text-[10px] border-b border-black/10 pb-1">RACK 3 - MSA 2050</h4>
                            <div className="grid grid-cols-8 gap-1">
                                {item.storage?.rack3?.msa2050?.map((isAmber: boolean, i: number) => (
                                    <div key={i} className={`h-4 border flex items-center justify-center text-[7px] font-bold ${isAmber ? 'bg-amber-400 border-amber-600' : 'bg-slate-50 border-slate-200'}`}>
                                        {isAmber ? '!' : i + 1}
                                    </div>
                                ))}
                            </div>
                            {item.storage?.rack3?.notes && <div className="mt-2 text-[9px] italic bg-slate-50 p-1 border border-black/5">Note: {item.storage.rack3.notes}</div>}
                        </div>

                        {/* Rack 4 */}
                        <div className="p-2 space-y-3">
                            <h4 className="font-black text-[10px] border-b border-black/10 pb-1">RACK 4 - MSA 2040 & ENCL</h4>
                            <div className="space-y-2">
                                <div className="text-[8px] font-bold opacity-50 uppercase">MSA 2040 (24 HDDs)</div>
                                <div className="grid grid-cols-8 gap-1">
                                    {item.storage?.rack4?.msa2040?.map((isAmber: boolean, i: number) => (
                                        <div key={i} className={`h-4 border flex items-center justify-center text-[7px] font-bold ${isAmber ? 'bg-amber-400 border-amber-600' : 'bg-slate-50 border-slate-200'}`}>
                                            {isAmber ? '!' : i + 1}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div>
                                        <div className="text-[7px] font-bold opacity-50 uppercase mb-1">D3710 (1)</div>
                                        <div className="grid grid-cols-4 gap-1">
                                            {item.storage?.rack4?.d3710_1?.map((isAmber: boolean, i: number) => (
                                                <div key={i} className={`h-3.5 border flex items-center justify-center text-[6px] font-bold ${isAmber ? 'bg-amber-400 border-amber-600' : 'bg-slate-50 border-slate-200'}`}>
                                                    {isAmber ? '!' : i + 1}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[7px] font-bold opacity-50 uppercase mb-1">D3710 (2)</div>
                                        <div className="grid grid-cols-4 gap-1">
                                            {item.storage?.rack4?.d3710_2?.map((isAmber: boolean, i: number) => (
                                                <div key={i} className={`h-3.5 border flex items-center justify-center text-[6px] font-bold ${isAmber ? 'bg-amber-400 border-amber-600' : 'bg-slate-50 border-slate-200'}`}>
                                                    {isAmber ? '!' : i + 1}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {item.storage?.rack4?.notes && <div className="mt-2 text-[9px] italic bg-slate-50 p-1 border border-black/5">Note: {item.storage.rack4.notes}</div>}
                        </div>

                        {/* Rack 5 */}
                        <div className="p-2 space-y-2">
                            <h4 className="font-black text-[10px] border-b border-black/10 pb-1">RACK 5 - DL380 GEN10</h4>
                            <div className="grid grid-cols-8 gap-1">
                                {item.storage?.rack5?.dl380?.map((isAmber: boolean, i: number) => (
                                    <div key={i} className={`h-4 border flex items-center justify-center text-[7px] font-bold ${isAmber ? 'bg-amber-400 border-amber-600' : 'bg-slate-50 border-slate-200'}`}>
                                        {isAmber ? '!' : i + 1}
                                    </div>
                                ))}
                            </div>
                            {item.storage?.rack5?.notes && <div className="mt-2 text-[9px] italic bg-slate-50 p-1 border border-black/5">Note: {item.storage.rack5.notes}</div>}
                        </div>
                    </div>
                    {/* Static Notes for Witness */}
                    <div className="bg-slate-50 border-t border-black p-2 text-[8px] italic text-slate-600">
                        * Centang/Tanda (!) menunjukkan HDD dalam kondisi Amber (Bermasalah). Petugas wajib segera melaporkan jika ditemukan anomali fisik pada storage.
                    </div>
                </div>

                {/* Notes */}
                <div className="mt-6 border border-black p-4 min-h-[100px]">
                    <h3 className="font-bold underline mb-2">Catatan Tambahan:</h3>
                    <p className="whitespace-pre-wrap">
                        {item.noted || ''}
                        {item.raisedFloor?.notes && item.raisedFloor.notes !== 'No issue found' ? `\n\n[Raised Floor]: ${item.raisedFloor.notes}` : ''}
                    </p>
                </div>

                {/* Signatures
                <div className="mt-5 flex justify-end">
                    <div className="mr-12 text-center">
                        <p className="mb-20">Mengetahui,</p>
                        <div className="border-b border-black w-40 mx-auto"></div>
                        <p className="mt-1 font-bold">VP IT & Transformasi Digital</p>
                    </div>
                    <div className="text-center">
                        <p className="mb-13">Dibuat Oleh,</p>
                        <p className="font-bold border-b border-black inline-block min-w-[160px] pb-1">
                            {item.piket || '......................'}
                        </p>
                        <p className="mt-1 font-bold">Staf IT Infra</p>
                    </div>
                </div> */}

            </div>
        </div>
    )
}
