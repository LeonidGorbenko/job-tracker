import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import ApplicationForm from '../components/ApplicationForm.jsx'
import { createApplication } from '../services/applicationsApi.js'
import { validateApplication } from '../utils/validateApplication.js'

const initialFormValues = {
  company: '',
  position: '',
  location: '',
  status: 'Saved',
  job_url: '',
  applied_at: '',
  notes: '',
}

function NewApplicationPage() {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState(initialFormValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

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
      const createdApplication = await createApplication(formValues)

      navigate('/applications/' + createdApplication.id)
    } catch (error) {
      if (error?.errors) {
        setErrors(error.errors)
        setSubmitError(error.errors.request || null)
      } else {
        setSubmitError('Could not save the application. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Link
        to="/applications"
        className="inline-flex items-center text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 outline-none hover:text-slate-950 hover:decoration-slate-700 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
      >
        Back to applications
      </Link>

      <header className="mt-6">
        <p className="text-sm font-semibold text-slate-500">Create</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          New application
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Add one opportunity with the core information needed for tracking.
        </p>
      </header>

      <section
        className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm"
        aria-labelledby="new-application-form-heading"
      >
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <h2
            id="new-application-form-heading"
            className="text-base font-semibold text-slate-950"
          >
            Application information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Required fields are marked with an asterisk.
          </p>
        </div>

        <ApplicationForm
          cancelTo="/applications"
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitError={submitError}
          submitLabel="Save application"
          submittingLabel="Saving application..."
          values={formValues}
        />
      </section>
    </>
  )
}

export default NewApplicationPage
