import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import StatusBadge from '../components/StatusBadge.jsx'
import { getApplications } from '../services/applicationsApi.js'
import { formatDate } from '../utils/formatDate.js'
import { getDashboardSummary } from '../utils/getDashboardSummary.js'

const statCards = [
  { key: 'total', label: 'Total' },
  { key: 'applied', label: 'Applied' },
  { key: 'interviews', label: 'Interviews' },
  { key: 'offers', label: 'Offers' },
]

function LoadingState() {
  return (
    <section
      className="mt-8 flex min-h-72 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
      role="status"
      aria-live="polite"
      aria-labelledby="dashboard-loading-heading"
    >
      <div>
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <h2
          id="dashboard-loading-heading"
          className="mt-4 text-base font-semibold text-slate-950"
        >
          Loading dashboard...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Preparing your application overview.
        </p>
      </div>
    </section>
  )
}

function ErrorState({ onRetry }) {
  return (
    <section
      className="mt-8 flex min-h-72 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
      role="alert"
      aria-labelledby="dashboard-error-heading"
    >
      <div className="max-w-md">
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-rose-300"
          aria-hidden="true"
        />
        <h2
          id="dashboard-error-heading"
          className="mt-4 text-base font-semibold text-slate-950"
        >
          Could not load dashboard
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The dashboard data is temporarily unavailable. Try loading it again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </section>
  )
}

function DashboardStatCard({ label, value }) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-label={label + ': ' + String(value)}
    >
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  )
}

function EmptyRecentApplications() {
  return (
    <div className="flex min-h-56 items-center justify-center px-6 py-10 text-center">
      <div className="max-w-md">
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <h3 className="mt-4 text-base font-semibold text-slate-950">
          No applications yet
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add your first opportunity to start building a useful overview.
        </p>
      </div>
    </div>
  )
}

function RecentApplicationsList({ applications }) {
  return (
    <ul className="divide-y divide-slate-200">
      {applications.map((application) => (
        <li
          key={application.id}
          className="grid gap-4 px-6 py-5 md:grid-cols-[1.1fr_1.4fr_0.8fr_0.8fr] md:items-center"
        >
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-slate-950">
              {application.company}
            </p>
            <p className="mt-1 break-words text-sm text-slate-500">
              {application.location || 'Not specified'}
            </p>
          </div>

          <div className="min-w-0">
            <Link
              to={'/applications/' + application.id}
              aria-label={
                'View ' +
                application.position +
                ' at ' +
                application.company
              }
              className="break-words text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 outline-none hover:decoration-slate-700 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              {application.position}
            </Link>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase md:hidden">
              Status
            </p>
            <StatusBadge status={application.status} />
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase md:hidden">
              Updated
            </p>
            <p className="mt-1 text-sm text-slate-600 md:mt-0">
              {formatDate(application.updated_at)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function DashboardContent({ applications }) {
  const { stats, recentApplications } = getDashboardSummary(applications)

  return (
    <>
      <section
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Application statistics"
      >
        {statCards.map((stat) => (
          <DashboardStatCard
            key={stat.key}
            label={stat.label}
            value={stats[stat.key]}
          />
        ))}
      </section>

      <section
        className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        aria-labelledby="recent-applications-heading"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="recent-applications-heading"
              className="text-base font-semibold text-slate-950"
            >
              Recent applications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              The five most recently updated opportunities.
            </p>
          </div>

          <Link
            to="/applications"
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 sm:w-fit"
          >
            View all applications
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <EmptyRecentApplications />
        ) : (
          <RecentApplicationsList applications={recentApplications} />
        )}
      </section>
    </>
  )
}

function DashboardPage() {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrentRequest = true

    async function loadApplications() {
      try {
        const loadedApplications = await getApplications()

        if (isCurrentRequest) {
          setApplications(loadedApplications)
          setError(null)
        }
      } catch {
        if (isCurrentRequest) {
          setApplications([])
          setError('Could not load dashboard.')
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false)
        }
      }
    }

    loadApplications()

    return () => {
      isCurrentRequest = false
    }
  }, [reloadKey])

  function handleRetry() {
    setIsLoading(true)
    setError(null)
    setReloadKey((currentKey) => currentKey + 1)
  }

  return (
    <>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Overview</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review the current state of your job search from one compact
            overview.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/applications"
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 sm:w-fit"
          >
            View all applications
          </Link>
          <Link
            to="/applications/new"
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 sm:w-fit"
          >
            Add application
          </Link>
        </div>
      </header>

      {isLoading && <LoadingState />}

      {!isLoading && error && <ErrorState onRetry={handleRetry} />}

      {!isLoading && !error && (
        <DashboardContent applications={applications} />
      )}
    </>
  )
}

export default DashboardPage
