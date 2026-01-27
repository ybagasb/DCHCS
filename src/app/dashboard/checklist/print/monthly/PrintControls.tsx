'use client'

import Link from 'next/link'

export default function PrintControls() {
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
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
            `}} />
            <div className="mb-4 no-print flex gap-4">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                >
                    Print Report
                </button>
                <Link
                    href="/dashboard/checklist/report"
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300 transition text-center"
                >
                    Back
                </Link>
            </div>
        </>
    )
}
