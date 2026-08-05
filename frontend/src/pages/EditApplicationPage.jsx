import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ApplicationForm from '../components/ApplicationForm.jsx'
import {
  getApplicationById,
  updateApplication,
} from '../services/applicationsApi.js'
import { getEditSuccessNavigation } from '../utils/successNavigation.js'
import { validateApplication } from '../utils/validateApplication.js'

const emptyFormValues = {
  company: '',
  position: '',
  location: '',
  status: 'Saved',
  job_url: '',
  applied_at: '',
  notes: '',
}

function toFormValues(application) {
  return {
    company: application.company || '',
    position: application.position || '',
    location: application.location || '',
    status: application.status || 'Saved',
    job_url: application.job_url || '',
    applied_at: application.applied_at || '',
    notes: application.notes || '',
  }
}

function BackToDetailsLink({ id }) {
  return (
    <Link
      to={'/applications/' + id}
      className="inline-flex items-center text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 outline-none hover:text-slate-950 hover:decoration-slate-700 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
    >
      Back to application details
    </Link>
  )
}

function LoadingState() {
  return (
    <section
      className="mt-6 flex min-h-80 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
      aria-labelledby="edit-loading-heading"
      role="status"
      aria-live="polite"
    >
      <div>
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <h1
          id="edit-loading-heading"
          className="mt-4 text-base font-semibold text-slate-950"
        >
          Loading application...
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Preparing the edit form.
        </p>
      </div>
    </section>
  )
}

function LoadErrorState({ onRetry }) {
  return (
    <section
      className="mt-6 flex min-h-80 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
      aria-labelledby="edit-error-heading"
      role="alert"
    >
      <div className="max-w-md">
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-rose-300"
          aria-hidden="true"
        />
        <h1
          id="edit-error-heading"
          className="mt-4 text-lg font-semibold text-slate-950"
        >
          Could not load this application
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The application cannot be edited right now. Try loading it again.
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
      aria-labelledby="edit-not-found-heading"
    >
      <div className="max-w-md">
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <h1
          id="edit-not-found-heading"
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

function EditApplicationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [formValues, setFormValues] = useState(emptyFormValues)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

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
          setFormValues(emptyFormValues)
          setNotFound(true)
          setLoadError(null)
          return
        }

        setApplication(loadedApplication)
        setFormValues(toFormValues(loadedApplication))
        setErrors({})
        setSubmitError(null)
        setNotFound(false)
        setLoadError(null)
      } catch {
        if (isCurrentRequest) {
          setApplication(null)
          setFormValues(emptyFormValues)
          setNotFound(false)
          setLoadError('Could not load this application.')
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
    setLoadError(null)
    setReloadKey((currentKey) => currentKey + 1)
  }

  function handleFieldChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateApplication(formValues)
    setErrors(validationErrors)
    setSubmitError(null)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const updatedApplication = await updateApplication(id, formValues)
      const successNavigation = getEditSuccessNavigation(updatedApplication)

      if (!successNavigation) {
        setSubmitError('Could not save this application. Please try again.')
        return
      }

      navigate(successNavigation.to, successNavigation.options)
    } catch (error) {
      if (error?.errors) {
        setErrors(error.errors)
        setSubmitError(error.errors.request || null)
      } else {
        setSubmitError('Could not save this application. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {!notFound && <BackToDetailsLink id={id} />}

      {isLoading && <LoadingState />}

      {!isLoading && loadError && <LoadErrorState onRetry={handleRetry} />}

      {!isLoading && !loadError && notFound && <NotFoundState />}

      {!isLoading && !loadError && !notFound && application && (
        <>
          <header className="mt-6">
            <p className="text-sm font-semibold text-slate-500">Edit</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight break-words text-slate-950">
              Edit application
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Update the tracked information for {application.position} at{' '}
              {application.company}.
            </p>
          </header>

          <section
            className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm"
            aria-labelledby="edit-application-form-heading"
          >
            <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
              <h2
                id="edit-application-form-heading"
                className="text-base font-semibold text-slate-950"
              >
                Application information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Required fields are marked with an asterisk.
              </p>
            </div>

            <ApplicationForm
              cancelTo={'/applications/' + id}
              errors={errors}
              isSubmitting={isSubmitting}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
              submitError={submitError}
              submitLabel="Save changes"
              submittingLabel="Saving changes..."
              values={formValues}
            />
          </section>
        </>
      )}
    </>
  )
}

export default EditApplicationPage
