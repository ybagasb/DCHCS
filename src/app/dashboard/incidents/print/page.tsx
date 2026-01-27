'use client'

import { useEffect, useState } from 'react'

type Incident = {
    _id: string
    incidentId: string
    reportDate: string
    reporter: string
    unit: string
    description: string
    category: string
    status: string
    pic?: string
    area: string
    location: string
    investigation?: string
    solution?: string
    completionDate?: string
}

export default function IncidentPrintPage() {
    const [incidents, setIncidents] = useState<Incident[]>([])

    useEffect(() => {
        fetch('/api/incidents')
            .then(res => res.json())
            .then(data => {
                setIncidents(data)
                // Auto print after loading? maybe not.
            })
    }, [])

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <div className="bg-white text-black min-h-screen p-4 text-[10px] sm:text-xs print:p-0">
            <style jsx global>{`
        @media print {
            @page {
                size: landscape;
                margin: 5mm;
            }
            body {
                -webkit-print-color-adjust: exact;
            }
            .no-print {
                display: none !important;
            }
        }
      `}</style>

            {/* Controls */}
            <div className="mb-4 no-print flex gap-4">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                >
                    Print Report
                </button>
                <button
                    onClick={() => window.history.back()}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300 transition"
                >
                    Back
                </button>
            </div>

            {/* Header */}
            <div className="border border-black mb-1">
                <div className="grid grid-cols-12 divide-x divide-black">
                    {/* Logo */}
                    <div className="col-span-2 flex items-center justify-center p-2">
                        <div className="w-20 h-20 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                            src="https://www.brantas-abipraya.co.id/sites/default/files/LOGO%20ABIPRAYA%20%281%29_1.png" 
                            alt="Logo Brantas Abipraya"
                            className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Title Section */}
                    <div className="col-span-7 flex flex-col justify-center text-center p-2">
                        <h1 className="font-bold text-sm">UNIT KERJA INOVASI DAN TRANSFORMASI DIGITAL</h1>
                        <h2 className="font-bold text-sm">DEPARTEMEN PENGEMBANGAN BISNIS DAN MANAJEMEN RISIKO</h2>
                        <h3 className="font-bold text-sm">PT. BRANTAS ABIPRAYA (PERSERO)</h3>
                        <div className="mt-4 border-t border-black w-full pt-1">
                            <h1 className="font-bold text-lg">FORM PENGELOLAAN INSIDEN TI</h1>
                        </div>
                    </div>

                    {/* Doc Info */}
                    <div className="col-span-3 text-[10px] p-2 space-y-1">
                        <div className="grid grid-cols-2">
                            <span className="font-semibold">No. Dokumen: </span>
                        </div>
                        <div className="grid grid-cols-2">
                            <span className="font-semibold">Klasifikasi Dokumen:</span>
                        </div>
                        <div className="grid grid-cols-2">
                            <span className="font-semibold">Tanggal Edisi:</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="border border-black overflow-hidden">
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="border-r border-b border-black p-1 w-[8%]">Incident ID</th>
                            <th className="border-r border-b border-black p-1 w-[8%]">Waktu Pelaporan</th>
                            <th className="border-r border-b border-black p-1 w-[8%]">Pelapor</th>
                            <th className="border-r border-b border-black p-1 w-[8%]">Unit Kerja</th>
                            <th className="border-r border-b border-black p-1 w-[15%]">Deskripsi Insiden</th>
                            <th className="border-r border-b border-black p-1 w-[6%]">Area Insiden</th>
                            <th className="border-r border-b border-black p-1 w-[6%]">Lokasi</th>
                            <th className="border-r border-b border-black p-1 w-[5%]">Kategori</th>
                            <th className="border-r border-b border-black p-1 w-[12%]">Investigasi</th>
                            <th className="border-r border-b border-black p-1 w-[12%]">Solusi</th>
                            <th className="border-r border-b border-black p-1 w-[8%]">Waktu Penyelesaian</th>
                            <th className="border-r border-b border-black p-1 w-[6%]">PIC</th>
                            <th className="border-b border-black p-1 w-[5%]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                        {incidents.map((incident) => (
                            <tr key={incident._id} className="divide-x divide-black border-b border-black last:border-b-0 h-[50px]">
                                <td className="p-1 align-top">{incident.incidentId}</td>
                                <td className="p-1 align-top">{formatDate(incident.reportDate)}</td>
                                <td className="p-1 align-top">{incident.reporter}</td>
                                <td className="p-1 align-top">{incident.unit}</td>
                                <td className="p-1 align-top text-left">{incident.description}</td>
                                <td className="p-1 align-top">{incident.area}</td>
                                <td className="p-1 align-top">{incident.location}</td>
                                <td className="p-1 align-top">{incident.category}</td>
                                <td className="p-1 align-top text-left">{incident.investigation || '-'}</td>
                                <td className="p-1 align-top text-left">{incident.solution || '-'}</td>
                                <td className="p-1 align-top">{formatDate(incident.completionDate) || '-'}</td>
                                <td className="p-1 align-top">{incident.pic || '-'}</td>
                                <td className="p-1 align-top">{incident.status}</td>
                            </tr>
                        ))}
                        {/* Empty rows to fill space if needed, or just let it be dynamic */}
                        {Array.from({ length: Math.max(0, 5 - incidents.length) }).map((_, i) => (
                            <tr key={`empty-${i}`} className="divide-x divide-black border-b border-black h-[50px]">
                                <td className="p-1">&nbsp;</td>
                                <td className="p-1"></td><td className="p-1"></td><td className="p-1"></td>
                                <td className="p-1"></td><td className="p-1"></td><td className="p-1"></td>
                                <td className="p-1"></td><td className="p-1"></td><td className="p-1"></td>
                                <td className="p-1"></td><td className="p-1"></td><td className="p-1"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer / Signatures */}
            <div className="mt-8 grid grid-cols-12 gap-4">
                <div className="col-span-4 text-left space-y-8">
                    <div>
                        <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p>Disiapkan Oleh :</p>
                        <p className="font-bold">Fungsi Operasional TI</p>
                    </div>
                    <div className="mt-12">
                        <p className="underline font-bold">( {incidents[0]?.pic || '.........................'} )</p>
                        {/* We might want a specific user here, but using PIC or blank is safe */}
                        <p>NIP : .........................</p>
                    </div>
                </div>

                <div className="col-span-8">
                    <div className="text-center mb-4">
                        <p className="font-bold underline">Mengetahui :</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 text-center">
                        <div>
                            <p className="mb-16">AVP Inovasi & Transformasi Digital</p>
                            <p className="font-bold underline">( Ivan Dinata )</p>
                            <p className="text-left ml-4">NIP :</p>
                        </div>
                        <div>
                            <p className="mb-16">VP Inovasi & Transformasi Digital</p>
                            <p className="font-bold underline">( Ahmad Sabig Eko Saputra )</p>
                            <p className="text-left ml-4">NIP :</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-8 text-[9px] space-y-1">
                <p className="font-bold underline">Kategori Insiden:</p>
                <p><span className="font-bold">Mendesak/ Emergency</span> = Top Priority (P0).</p>
                <p><span className="font-bold">Tinggi/ High</span> = High Priority (P1)</p>
                <p><span className="font-bold">Sedang/ Normal</span> = Medium Priority (P2)</p>
                <p><span className="font-bold">Rendah/ Low</span> = Low Priority (P3)</p>
            </div>
        </div>
    )
}
