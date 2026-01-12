'use client'

import { useState } from 'react'

type LinkCardProps = {
    title: string
    url: string
    icon?: string
}

export default function LinkCard({ title, url, icon }: LinkCardProps) {
    const [imgError, setImgError] = useState(false)

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
        >
            {/* Decorative background blob */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

            <div className="h-16 w-16 mb-4 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-blue-50 transition-colors duration-300">
                {icon && !imgError ? (
                    <img
                        src={icon}
                        className="w-10 h-10 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                        alt="icon"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">🔗</span>
                )}
            </div>

            <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 w-full">
                {title}
            </h3>

            <p className="text-xs text-slate-400 mt-2 line-clamp-1 w-full group-hover:text-slate-500">
                {tryGetHostname(url)}
            </p>

            <div className="mt-4 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                    Visit Link <span className="text-lg">→</span>
                </span>
            </div>
        </a>
    )
}

function tryGetHostname(url: string) {
    try {
        return new URL(url).hostname.replace('www.', '')
    } catch {
        return url
    }
}
