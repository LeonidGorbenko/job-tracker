import { Link } from 'react-router'
import {
  applicationFieldLimits,
  applicationStatuses,
} from '../utils/validateApplication.js'

function TextField({
  error,
  id,
  label,
  maxLength,
  name,
  onChange,
  required = false,
  type = 'text',
  value,
}) {
  const errorId = id + '-error'

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-800"
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 lg:text-sm"
      />
      {error && (
        <p id={errorId} className="mt-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  )
}

function ApplicationForm({
  cancelTo,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  submitError,
  submitLabel,
  submittingLabel,
  values,
}) {
  return (
    <form
      className="px-4 py-5 sm:px-6 sm:py-6"
      onSubmit={onSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      {submitError && (
        <div
          className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <fieldset disabled={isSubmitting} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            id="company"
            name="company"
            label="Company"
            value={values.company}
            onChange={onChange}
            error={errors.company}
            maxLength={applicationFieldLimits.company}
            required
          />

          <TextField
            id="position"
            name="position"
            label="Position"
            value={values.position}
            onChange={onChange}
            error={errors.position}
            maxLength={applicationFieldLimits.position}
            required
          />

          <TextField
            id="location"
            name="location"
            label="Location"
            value={values.location}
            onChange={onChange}
            error={errors.location}
            maxLength={applicationFieldLimits.location}
          />

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-semibold text-slate-800"
            >
              Status <span aria-hidden="true">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={values.status}
              onChange={onChange}
              required
              aria-invalid={Boolean(errors.status)}
              aria-describedby={errors.status ? 'status-error' : undefined}
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 lg:text-sm"
            >
              {applicationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.status && (
              <p
                id="status-error"
                className="mt-2 text-sm font-medium text-rose-700"
              >
                {errors.status}
              </p>
            )}
          </div>

          <TextField
            id="job-url"
            name="job_url"
            label="Job URL"
            type="url"
            value={values.job_url}
            onChange={onChange}
            error={errors.job_url}
            maxLength={applicationFieldLimits.job_url}
          />

          <TextField
            id="applied-at"
            name="applied_at"
            label="Applied date"
            type="date"
            value={values.applied_at}
            onChange={onChange}
            error={errors.applied_at}
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-semibold text-slate-800"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="5"
            value={values.notes}
            onChange={onChange}
            maxLength={applicationFieldLimits.notes}
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 lg:text-sm"
          />
        </div>
      </fieldset>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          to={cancelTo}
          className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 sm:w-auto"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-500 sm:w-auto"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ApplicationForm
