import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import SuccessMessage from '../components/SuccessMessage.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import {
  deleteApplication,
  getApplicationById,
} from '../services/applicationsApi.js'
import { formatDate, formatDateTime } from '../utils/formatDate.js'
import {
  getDeleteSuccessNavigation,
  getNextVisibleSuccessMessage,
  getSuccessMessageFromState,
  removeSuccessMessageFromState,
} from '../utils/successNavigation.js'

function BackToApplicationsLink() {
  return (
    <Link
      to="/applications"
      className="inline-flex items-center text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 outline-none hover:text-slate-950 hover:decoration-slate-700 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
    >
      Back to applications
    </Link>
  )
}

function LoadingState() {
  return (
    <section
      className="mt-6 flex min-h-80 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
      aria-labelledby="details-loading-heading"
      role="status"
      aria-live="polite"
    >
      <div>
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <h1
          id="details-loading-heading"
          className="mt-4 text-base font-semibold text-slate-950"
        >
          Loading application...
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Preparing the application details.
        </p>
      </div>
    </section>
  )
}

function ErrorState({ onRetry }) {
  return (
    <section
      className="mt-6 flex min-h-80 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
      aria-labelledby="details-error-heading"
      role="alert"
    >
      <div className="max-w-md">
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-rose-300"
          aria-hidden="true"
        />
        <h1
          id="details-error-heading"
          className="mt-4 text-lg font-semibold text-slate-950"
        >
          Could not load this application
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The application details are temporarily unavailable. Try loading
          them again.
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

function NotFoundState() {
  return (
    <section
      className="mt-6 flex min-h-80 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
      aria-labelledby="application-not-found-heading"
    >
      <div className="max-w-md">
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <h1
          id="application-not-found-heading"
          className="mt-4 text-lg font-semibold text-slate-950"
        >
          Application not found
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This application does not exist or is no longer available in the
          current data.
        </p>
        <Link
          to="/applications"
          className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        >
          View all applications
        </Link>
      </div>
    </section>
  )
}

function DeleteConfirmation({
  deleteError,
  isDeleting,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      id="delete-confirmation"
      className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-4"
      role="group"
      aria-labelledby="delete-confirmation-heading"
      aria-describedby="delete-confirmation-description"
      aria-busy={isDeleting}
    >
      <h2
        id="delete-confirmation-heading"
        className="text-sm font-semibold text-rose-950"
      >
        Delete application?
      </h2>
      <p
        id="delete-confirmation-description"
        className="mt-2 text-sm leading-6 text-rose-800"
      >
        This action removes the application from the database and cannot be
        undone.
      </p>

      {deleteError && (
        <p className="mt-3 text-sm font-semibold text-rose-900" role="alert">
          {deleteError}
        </p>
      )}

      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="inline-flex w-full justify-center rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-slate-400 sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="inline-flex w-full justify-center rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-rose-800 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-rose-400 sm:w-auto"
        >
          {isDeleting ? 'Deleting...' : 'Delete application'}
        </button>
      </div>
    </div>
  )
}

function ApplicationDetails({
  application,
  deleteError,
  isDeleteConfirmOpen,
  isDeleting,
  onCancelDelete,
  onConfirmDelete,
  onOpenDeleteConfirm,
}) {
  return (
    <>
      <header className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-slate-500">
          Application details
        </p>

        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight break-words text-slate-950">
              {application.position}
            </h1>
            <p className="mt-2 text-base font-medium text-slate-600">
              {application.company}
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
            <StatusBadge status={application.status} />
            <Link
              to={'/applications/' + application.id + '/edit'}
              className="inline-flex flex-1 justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 sm:flex-none"
            >
              Edit application
            </Link>
            <button
              type="button"
              onClick={onOpenDeleteConfirm}
              aria-expanded={isDeleteConfirmOpen}
              aria-controls={
                isDeleteConfirmOpen ? 'delete-confirmation' : undefined
              }
              className="inline-flex flex-1 justify-center rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 outline-none hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 sm:flex-none"
            >
              Delete application
            </button>
          </div>
        </div>

        {application.job_url && (
          <a
            href={application.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-fit items-center text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 outline-none hover:text-slate-950 hover:decoration-slate-700 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
          >
            Open original job posting
            <span className="sr-only"> in a new tab</span>
          </a>
        )}

        {isDeleteConfirmOpen && (
          <DeleteConfirmation
            deleteError={deleteError}
            isDeleting={isDeleting}
            onCancel={onCancelDelete}
            onConfirm={onConfirmDelete}
          />
        )}
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <section
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="notes-heading"
        >
          <h2 id="notes-heading" className="text-base font-semibold">
            Notes
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {application.notes || 'No notes added.'}
          </p>
        </section>

        <section
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          aria-labelledby="application-information-heading"
        >
          <h2
            id="application-information-heading"
            className="text-base font-semibold"
          >
            Application information
          </h2>

          <dl className="mt-5 space-y-5">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Location
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {application.location || 'Not specified'}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Applied
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {application.applied_at ? (
                  <time dateTime={application.applied_at}>
                    {formatDate(application.applied_at)}
                  </time>
                ) : (
                  'Not applied yet'
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Created
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                <time dateTime={application.created_at}>
                  {formatDateTime(application.created_at)}
                </time>
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Last updated
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                <time dateTime={application.updated_at}>
                  {formatDateTime(application.updated_at)}
                </time>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  )
}

function ApplicationDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [successMessage, setSuccessMessage] = useState(() =>
    getSuccessMessageFromState(location.state),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

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

    async function loadApplication() {
      try {
        const loadedApplication = await getApplicationById(id)

        if (!isCurrentRequest) {
          return
        }

        if (!loadedApplication) {
          setApplication(null)
          setNotFound(true)
          setError(null)
          return
        }

        setApplication(loadedApplication)
        setNotFound(false)
        setError(null)
      } catch {
        if (isCurrentRequest) {
          setApplication(null)
          setNotFound(false)
          setError('Could not load this application.')
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false)
        }
      }
    }

    loadApplication()

    return () => {
      isCurrentRequest = false
    }
  }, [id, reloadKey])

  function handleRetry() {
    setIsLoading(true)
    setError(null)
    setReloadKey((currentKey) => currentKey + 1)
  }

  function handleOpenDeleteConfirm() {
    setIsDeleteConfirmOpen(true)
    setDeleteError(null)
  }

  function handleCancelDelete() {
    setIsDeleteConfirmOpen(false)
    setDeleteError(null)
  }

  async function handleConfirmDelete() {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const wasDeleted = await deleteApplication(id)
      const successNavigation = getDeleteSuccessNavigation(wasDeleted)

      if (!successNavigation) {
        setDeleteError('Could not delete this application. It was not found.')
        return
      }

      navigate(successNavigation.to, successNavigation.options)
    } catch {
      setDeleteError('Could not delete this application. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <BackToApplicationsLink />

      <SuccessMessage
        key={successMessage || 'empty-success-message'}
        message={successMessage}
        onDismiss={() => setSuccessMessage(null)}
      />

      {isLoading && <LoadingState />}

      {!isLoading && error && <ErrorState onRetry={handleRetry} />}

      {!isLoading && !error && notFound && <NotFoundState />}

      {!isLoading && !error && !notFound && application && (
        <ApplicationDetails
          application={application}
          deleteError={deleteError}
          isDeleteConfirmOpen={isDeleteConfirmOpen}
          isDeleting={isDeleting}
          onCancelDelete={handleCancelDelete}
          onConfirmDelete={handleConfirmDelete}
          onOpenDeleteConfirm={handleOpenDeleteConfirm}
        />
      )}
    </>
  )
}

export default ApplicationDetailsPage
