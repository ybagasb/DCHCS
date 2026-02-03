import { connectDB } from '@/lib/mongodb'
import { Link as LinkModel } from '@/models/Link'
import Link from 'next/link'
import LinkCard from './components/LinkCard'
import ThemeToggle from './components/ThemeToggle'
import SearchAndSort from './components/SearchAndSort'

export const dynamic = 'force-dynamic'

export default async function HomePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await connectDB()

  const searchParams = await props.searchParams
  const q = typeof searchParams.q === 'string' ? searchParams.q : ''
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'latest'

  let sortQuery: any = { createdAt: -1 }
  if (sort === 'oldest') sortQuery = { createdAt: 1 }
  if (sort === 'asc') sortQuery = { title: 1 }
  if (sort === 'desc') sortQuery = { title: -1 }

  const query: any = {}
  if (q) {
    query.title = { $regex: q, $options: 'i' }
  }

  const links = await LinkModel.find(query).sort(sortQuery)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-white/20 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              <img
                src="http://10.10.55.60/sites/default/files/LOGO%20ABIPRAYA%20%281%29_1.png"
                alt="Logo Brantas Abipraya"
                className="w-6 h-6 object-contain"
              />
            </div>
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              DCHCS
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <a
              href="/api/download/testfile.org-5GB.dat"
              download
              className="px-3 py-2 md:px-5 md:py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 group"
              title="Download 5GB test file for speed monitoring"
            >
              <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="md:hidden">Speed Test</span>
              <span className="hidden md:inline">Internal Speed Test (5GB)</span>
            </a>
            <Link
              href="/login"
              className="px-3 py-2 md:px-5 md:py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs md:text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-lg transition-all active:scale-95"
            >
              <span className="md:hidden">Login</span>
              <span className="hidden md:inline">Dashboard Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 pb-20 pt-10">
        <SearchAndSort />

        {links.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No links found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {links.map((link: any) => (
              <LinkCard
                key={link._id}
                title={link.title}
                url={link.url}
                icon={link.icon}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
