import { connectDB } from '@/lib/mongodb'
import { Link as LinkModel } from '@/models/Link'
import Link from 'next/link'
import LinkCard from './components/LinkCard'

export default async function HomePage() {
  await connectDB()
  const links = await LinkModel.find().sort({ createdAt: -1 })

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              DashboardLink
            </h1>
          </div>

          <Link
            href="/login"
            className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95"
          >
            Dashboard Login
          </Link>
        </div>
      </header>

      {/* Hero Section
      <section className="pt-20 pb-12 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            Access Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Digital World</span>
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            A curated collection of essential tools and resources, organized for your daily productivity.
          </p>
        </div>
      </section> */}

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
