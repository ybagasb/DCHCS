'use client'

import { LinkType } from './DashboardClient'

export default function LinkList({
  links,
  onEdit,
  onDelete,
}: {
  links: LinkType[]
  onEdit: (link: LinkType) => void
  onDelete: () => void
}) {
  const remove = async (id: string) => {
    if (!confirm('Hapus link ini?')) return

    await fetch(`/api/links/${id}`, {
      method: 'DELETE',
    })

    onDelete()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Your Links</h3>
        <span className="text-sm bg-blue-50 text-blue-700 py-1 px-3 rounded-full font-medium">
          {links.length} Links
        </span>
      </div>

      <div className="grid gap-4">
        {links.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">No links found. Create one to get started!</p>
          </div>
        ) : (
          links.map(link => (
            <div
              key={link._id}
              className="group bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-12 h-12 flex-shrink-0 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors">
                  {link.icon ? (
                    <img
                      src={link.icon}
                      alt="icon"
                      className="w-8 h-8 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <span className="text-2xl">🔗</span>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </h4>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-blue-500 truncate block hover:underline"
                  >
                    {link.url}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => onEdit(link)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-white hover:text-blue-600 hover:shadow border border-transparent hover:border-slate-200 transition-all"
                >
                  Edit
                </button>

                <button
                  onClick={() => remove(link._id)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-white hover:shadow border border-transparent hover:border-red-100 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
