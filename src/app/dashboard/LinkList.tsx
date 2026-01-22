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
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Your Links</h3>
        <span className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-1 px-3 rounded-full font-medium">
          {links.length} Links
        </span>
      </div>

      <div className="grid gap-4">
        {links.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">No links found. Create one to get started!</p>
          </div>
        ) : (
          links.map(link => (
            <div
              key={link._id}
              className="group bg-white dark:bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/50 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 max-w-full"
            >
              <div className="flex-1 flex items-center gap-1 sm:gap-4 min-w-0 w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  {link.icon ? (
                    <img
                      src={link.icon}
                      alt="icon"
                      className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl">🔗</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {link.title}
                  </h4>
                  <div className="w-full">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 truncate block hover:underline"
                        title={link.url}
                      >
                        {link.url.length > 50 ? `${link.url.substring(0, 50)}...` : link.url}
                      </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                <button
                  onClick={() => onEdit(link)}
                  className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1.5 text-center text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-600 hover:text-blue-600 dark:hover:text-blue-300 hover:shadow border border-transparent hover:border-slate-200 dark:hover:border-slate-500 transition-all"
                >
                  Edit
                </button>

                <button
                  onClick={() => remove(link._id)}
                  className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1.5 text-center text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-white dark:hover:bg-red-900/30 hover:shadow border border-transparent hover:border-red-100 dark:hover:border-red-800 transition-all"
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
