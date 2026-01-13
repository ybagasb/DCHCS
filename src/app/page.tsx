import { connectDB } from '@/lib/mongodb'
import { Link as LinkModel } from '@/models/Link'
import Link from 'next/link'
import LinkCard from './components/LinkCard'
import ThemeToggle from './components/ThemeToggle'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  await connectDB()
  const links = await LinkModel.find().sort({ createdAt: -1 })

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-white/20 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              D
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              DashboardLink
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <ThemeToggle />
            <Link
                href="/login"
                className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-lg transition-all active:scale-95"
            >
                Dashboard Login
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 pb-20 pt-10">
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
      </section>
    </main>
  )
}
