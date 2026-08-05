import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import SuccessMessage from '../components/SuccessMessage.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { getApplications } from '../services/applicationsApi.js'
import {
  buildApplicationListSearch,
  getApplicationListControlsFromSearch,
} from '../utils/applicationListQuery.js'
import { formatDate } from '../utils/formatDate.js'
import {
  getVisibleApplications,
  sortOptions,
  statusFilterOptions,
} from '../utils/getVisibleApplications.js'
import {
  getNextVisibleSuccessMessage,
  getSuccessMessageFromState,
  removeSuccessMessageFromState,
} from '../utils/successNavigation.js'

function LoadingState() {
  return (
    <div
      className="flex min-h-72 items-center justify-center px-6 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div>
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <p className="mt-4 text-sm font-semibold text-slate-950">
          Loading applications...
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Preparing your application workspace.
        </p>
      </div>
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div
      className="flex min-h-72 items-center justify-center px-6 py-12 text-center"
      role="alert"
    >
      <div className="max-w-md">
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-rose-300"
          aria-hidden="true"
        />
        <h3 className="mt-4 text-base font-semibold text-slate-950">
          Could not load applications
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The application list is temporarily unavailable. Try loading it
          again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-72 items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md">
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <h3 className="mt-4 text-base font-semibold text-slate-950">
          No applications yet
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Start tracking an opportunity by adding the company, role, status,
          and any useful notes.
        </p>
        <Link
          to="/applications/new"
          className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        >
          Add application
        </Link>
      </div>
    </div>
  )
}

function FilteredEmptyState({ onReset }) {
  return (
    <div className="flex min-h-72 items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md">
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <h3 className="mt-4 text-base font-semibold text-slate-950">
          No matching applications
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          No applications match the current search or filter controls. Reset
          them to review the full list again.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        >
          Reset controls
        </button>
      </div>
    </div>
  )
}

function ApplicationControls({
  hasActiveControls,
  onReset,
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
  searchQuery,
  sortBy,
  statusFilter,
}) {
  return (
    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] lg:items-end">
        <div>
          <label
            htmlFor="application-search"
            className="block text-sm font-semibold text-slate-800"
          >
            Search applications
          </label>
          <input
            id="application-search"
            type="search"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Company, position, or location"
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 lg:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-semibold text-slate-800"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={onStatusFilterChange}
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 lg:text-sm"
          >
            {statusFilterOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="application-sort"
            className="block text-sm font-semibold text-slate-800"
          >
            Sort
          </label>
          <select
            id="application-sort"
            value={sortBy}
            onChange={onSortChange}
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 lg:text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveControls}
          className="inline-flex w-full justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white lg:w-auto"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function ApplicationList({ applications }) {
  return (
    <>
      <div
        className="hidden grid-cols-[1.1fr_1.5fr_0.8fr_0.8fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase md:grid"
        aria-hidden="true"
      >
        <span>Company</span>
        <span>Position</span>
        <span>Status</span>
        <span>Updated</span>
      </div>

      <ul className="divide-y divide-slate-200">
        {applications.map((application) => (
          <li
            key={application.id}
            className="grid gap-4 px-6 py-5 md:grid-cols-[1.1fr_1.5fr_0.8fr_0.8fr] md:items-center"
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
              <p className="mt-1 text-sm text-slate-500">
                {application.applied_at
                  ? 'Applied ' + formatDate(application.applied_at)
                  : 'Not applied yet'}
              </p>
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
    </>
  )
}

function ApplicationsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [successMessage, setSuccessMessage] = useState(() =>
    getSuccessMessageFromState(location.state),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const { searchQuery, sortBy, statusFilter } =
    getApplicationListControlsFromSearch(location.search)

  const visibleApplications = getVisibleApplications({
    applications,
    searchQuery,
    sortBy,
    statusFilter,
  })

  const hasActiveControls =
    searchQuery.trim() !== '' ||
    statusFilter !== 'All' ||
    sortBy !== 'newest'

  function updateListControls(nextControls, options = {}) {
    const nextSearch = buildApplicationListSearch(location.search, {
      searchQuery,
      sortBy,
      statusFilter,
      ...nextControls,
    })

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch,
        hash: location.hash,
      },
      {
        replace: Boolean(options.replace),
      },
    )
  }

  useEffect(() => {
    const message = getSuccessMessageFromState(location.state)

    if (!message) {
      return
    }

    // The message is one-time history state. Copy it into local UI state
    // before replacing that history state so the banner remains visible.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuccessMessage((currentMessage) =>
      getNextVisibleSuccessMessage(currentMessage, location.state),
    )

    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      {
        replace: true,
        state: removeSuccessMessageFromState(location.state),
      },
    )
  }, [
    location.hash,
    location.pathname,
    location.search,
    location.state,
    navigate,
  ])

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
          setError('Could not load applications.')
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

  function handleResetControls() {
    updateListControls({
      searchQuery: '',
      statusFilter: 'All',
      sortBy: 'newest',
    })
  }

  let listSummary =
    'Showing ' +
    String(visibleApplications.length) +
    ' of ' +
    String(applications.length) +
    ' applications'

  if (isLoading) {
    listSummary = 'Loading'
  } else if (error) {
    listSummary = 'Unavailable'
  }

  return (
    <>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            Applications
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review every opportunity from one clear, structured list.
          </p>
        </div>

        <Link
          to="/applications/new"
          className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 sm:w-fit"
        >
          New application
        </Link>
      </header>

      <SuccessMessage
        key={successMessage || 'empty-success-message'}
        message={successMessage}
        onDismiss={() => setSuccessMessage(null)}
      />

      <section
        className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        aria-labelledby="application-list-heading"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="application-list-heading"
              className="text-base font-semibold text-slate-950"
            >
              Application list
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your tracked opportunities, organized for quick review.
            </p>
          </div>

          <span
            className="w-fit shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
            aria-live="polite"
          >
            {listSummary}
          </span>
        </div>

        {isLoading && <LoadingState />}

        {!isLoading && error && <ErrorState onRetry={handleRetry} />}

        {!isLoading && !error && applications.length > 0 && (
          <ApplicationControls
            hasActiveControls={hasActiveControls}
            onReset={handleResetControls}
            onSearchChange={(event) =>
              updateListControls(
                { searchQuery: event.target.value },
                { replace: true },
              )
            }
            onSortChange={(event) =>
              updateListControls({ sortBy: event.target.value })
            }
            onStatusFilterChange={(event) =>
              updateListControls({ statusFilter: event.target.value })
            }
            searchQuery={searchQuery}
            sortBy={sortBy}
            statusFilter={statusFilter}
          />
        )}

        {!isLoading && !error && applications.length === 0 && <EmptyState />}

        {!isLoading &&
          !error &&
          applications.length > 0 &&
          visibleApplications.length === 0 && (
            <FilteredEmptyState onReset={handleResetControls} />
          )}

        {!isLoading && !error && visibleApplications.length > 0 && (
          <ApplicationList applications={visibleApplications} />
        )}
      </section>
    </>
  )
}

export default ApplicationsPage
