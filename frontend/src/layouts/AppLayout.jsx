import { NavLink, Outlet } from 'react-router'

function getNavLinkClass({ isActive }) {
  const baseClasses =
    'rounded-lg px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 lg:focus-visible:ring-slate-300 lg:focus-visible:ring-offset-slate-950'

  const activeClasses =
    'bg-slate-900 font-semibold text-white shadow-sm ring-1 ring-slate-700 lg:bg-white lg:text-slate-950 lg:ring-slate-200'

  const inactiveClasses =
    'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 lg:text-slate-300 lg:hover:bg-slate-800 lg:hover:text-white'

  return [baseClasses, isActive ? activeClasses : inactiveClasses].join(' ')
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold tracking-wide text-white lg:bg-white lg:text-slate-950"
        aria-hidden="true"
      >
        JT
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-950 lg:text-white">
          Job Tracker
        </p>
        <p className="text-xs text-slate-500 lg:text-slate-400">
          Application workspace
        </p>
      </div>
    </div>
  )
}

function Navigation() {
  return (
    <nav
      aria-label="Primary"
      className="flex flex-wrap gap-1 lg:flex-col lg:flex-nowrap"
    >
      <NavLink to="/" end className={getNavLinkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/applications" className={getNavLinkClass}>
        Applications
      </NavLink>
    </nav>
  )
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <a
        href="#main-content"
        className="sr-only fixed top-3 left-3 z-50 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-lg focus:not-sr-only focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Brand />
          <Navigation />
        </div>
      </header>

      <div className="min-h-screen lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden bg-slate-950 text-white lg:flex lg:flex-col">
          <div className="border-b border-slate-800 px-6 py-6">
            <Brand />
          </div>

          <div className="flex flex-1 flex-col justify-between px-4 py-6">
            <Navigation />
            <p className="px-3 text-xs leading-5 text-slate-500">
              A focused workspace for managing a personal job search.
            </p>
          </div>
        </aside>

        <main
          id="main-content"
          tabIndex="-1"
          className="min-w-0 px-4 py-8 outline-none sm:px-6 lg:px-10 lg:py-10"
        >
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
