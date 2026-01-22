'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md"
    >
      🖨️ Print Document
    </button>
  )
}
