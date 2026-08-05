export const applicationStatuses = [
  'Saved',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
]

export const applicationFieldLimits = {
  company: 120,
  position: 120,
  location: 120,
  job_url: 500,
  notes: 5000,
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(value + 'T00:00:00.000Z')

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function validateRequiredText(values, field, label, errors) {
  const value = values[field]

  if (typeof value !== 'string' || !value.trim()) {
    errors[field] = label + ' is required'
    return
  }

  if (value.trim().length > applicationFieldLimits[field]) {
    errors[field] =
      label + ' must be ' + String(applicationFieldLimits[field]) + ' characters or fewer'
  }
}

function validateOptionalText(values, field, label, errors) {
  const value = values[field]

  if (typeof value !== 'string') {
    errors[field] = label + ' must be text'
    return
  }

  if (value.trim().length > applicationFieldLimits[field]) {
    errors[field] =
      label + ' must be ' + String(applicationFieldLimits[field]) + ' characters or fewer'
  }
}

export function validateApplication(values) {
  const nextErrors = {}

  validateRequiredText(values, 'company', 'Company', nextErrors)
  validateRequiredText(values, 'position', 'Position', nextErrors)
  validateOptionalText(values, 'location', 'Location', nextErrors)
  validateOptionalText(values, 'notes', 'Notes', nextErrors)

  if (!values.status) {
    nextErrors.status = 'Status is required'
  } else if (!applicationStatuses.includes(values.status)) {
    nextErrors.status = 'Choose a valid status'
  }

  if (typeof values.job_url !== 'string') {
    nextErrors.job_url = 'Job URL must be text'
  } else if (values.job_url.trim().length > applicationFieldLimits.job_url) {
    nextErrors.job_url =
      'Job URL must be ' + String(applicationFieldLimits.job_url) + ' characters or fewer'
  } else if (values.job_url.trim() && !isValidHttpUrl(values.job_url.trim())) {
    nextErrors.job_url = 'Job URL must be a valid HTTP or HTTPS URL'
  }

  if (typeof values.applied_at !== 'string') {
    nextErrors.applied_at = 'Applied date must be text'
  } else if (values.applied_at && !isValidDateOnly(values.applied_at)) {
    nextErrors.applied_at = 'Applied date must use YYYY-MM-DD'
  }

  return nextErrors
}
