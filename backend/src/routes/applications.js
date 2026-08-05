import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

const applicationStatuses = [
  'Saved',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
]

const editableFields = [
  'company',
  'position',
  'location',
  'status',
  'job_url',
  'applied_at',
  'notes',
]

const fieldLimits = {
  company: 120,
  position: 120,
  location: 120,
  job_url: 500,
  notes: 5000,
}

const applicationColumns = `
  id,
  company,
  position,
  location,
  status,
  job_url,
  notes,
  applied_at::text AS applied_at,
  created_at,
  updated_at
`

function hasField(input, field) {
  return Object.prototype.hasOwnProperty.call(input, field)
}

function isObjectBody(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeOptionalText(value) {
  if (value === null) {
    return null
  }

  const trimmedValue = value.trim()

  return trimmedValue || null
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

function validateUnknownFields(input, errors) {
  for (const field of Object.keys(input)) {
    if (!editableFields.includes(field)) {
      errors[field] = 'This field is not allowed'
    }
  }
}

function validateRequiredText(input, field, label, errors, values) {
  const value = input[field]

  if (typeof value !== 'string' || !value.trim()) {
    errors[field] = label + ' is required'
    return
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length > fieldLimits[field]) {
    errors[field] =
      label + ' must be ' + String(fieldLimits[field]) + ' characters or fewer'
    return
  }

  values[field] = trimmedValue
}

function validateOptionalText(input, field, label, errors, values) {
  if (!hasField(input, field)) {
    return
  }

  const value = input[field]

  if (value === null) {
    values[field] = null
    return
  }

  if (typeof value !== 'string') {
    errors[field] = label + ' must be text'
    return
  }

  const normalizedValue = normalizeOptionalText(value)

  if (normalizedValue && normalizedValue.length > fieldLimits[field]) {
    errors[field] =
      label + ' must be ' + String(fieldLimits[field]) + ' characters or fewer'
    return
  }

  values[field] = normalizedValue
}

function validateStatus(input, errors, values) {
  const value = input.status

  if (typeof value !== 'string' || !value.trim()) {
    errors.status = 'Status is required'
    return
  }

  const trimmedValue = value.trim()

  if (!applicationStatuses.includes(trimmedValue)) {
    errors.status =
      'Status must be one of: ' + applicationStatuses.join(', ')
    return
  }

  values.status = trimmedValue
}

function validateJobUrl(input, errors, values) {
  if (!hasField(input, 'job_url')) {
    return
  }

  const value = input.job_url

  if (value === null) {
    values.job_url = null
    return
  }

  if (typeof value !== 'string') {
    errors.job_url = 'Job URL must be text'
    return
  }

  const normalizedValue = normalizeOptionalText(value)

  if (normalizedValue && normalizedValue.length > fieldLimits.job_url) {
    errors.job_url =
      'Job URL must be ' + String(fieldLimits.job_url) + ' characters or fewer'
    return
  }

  if (normalizedValue && !isValidHttpUrl(normalizedValue)) {
    errors.job_url = 'Job URL must be a valid HTTP or HTTPS URL'
    return
  }

  values.job_url = normalizedValue
}

function validateAppliedAt(input, errors, values) {
  if (!hasField(input, 'applied_at')) {
    return
  }

  const value = input.applied_at

  if (value === null || value === '') {
    values.applied_at = null
    return
  }

  if (typeof value !== 'string' || !isValidDateOnly(value)) {
    errors.applied_at = 'Applied date must use YYYY-MM-DD'
    return
  }

  values.applied_at = value
}

function validateApplicationInput(input, { isCreate }) {
  const errors = {}
  const values = {}

  if (!isObjectBody(input)) {
    return {
      errors: {
        request: 'Request body must be a JSON object',
      },
      values,
    }
  }

  validateUnknownFields(input, errors)

  if (isCreate || hasField(input, 'company')) {
    validateRequiredText(input, 'company', 'Company', errors, values)
  }

  if (isCreate || hasField(input, 'position')) {
    validateRequiredText(input, 'position', 'Position', errors, values)
  }

  if (isCreate || hasField(input, 'status')) {
    validateStatus(input, errors, values)
  }

  validateOptionalText(input, 'location', 'Location', errors, values)
  validateOptionalText(input, 'notes', 'Notes', errors, values)
  validateJobUrl(input, errors, values)
  validateAppliedAt(input, errors, values)

  if (
    !isCreate &&
    Object.keys(errors).length === 0 &&
    Object.keys(values).length === 0
  ) {
    errors.request = 'Provide at least one field to update'
  }

  return { errors, values }
}

function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0
}

function sendValidationError(response, errors) {
  response.status(400).json({
    message: 'Validation failed',
    errors,
  })
}

router.get('/', async (request, response, next) => {
  void request

  try {
    const result = await query(
      `SELECT ${applicationColumns}
       FROM applications
       ORDER BY created_at DESC`,
    )

    response.status(200).json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (request, response, next) => {
  try {
    const result = await query(
      `SELECT ${applicationColumns}
       FROM applications
       WHERE id = $1`,
      [request.params.id],
    )

    if (result.rowCount === 0) {
      response.status(404).json({
        message: 'Application not found',
      })
      return
    }

    response.status(200).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.post('/', async (request, response, next) => {
  const { errors, values } = validateApplicationInput(request.body, {
    isCreate: true,
  })

  if (hasValidationErrors(errors)) {
    sendValidationError(response, errors)
    return
  }

  try {
    const result = await query(
      `INSERT INTO applications (
        id,
        company,
        position,
        location,
        status,
        job_url,
        notes,
        applied_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING ${applicationColumns}`,
      [
        randomUUID(),
        values.company,
        values.position,
        values.location || null,
        values.status,
        values.job_url || null,
        values.notes || null,
        values.applied_at || null,
      ],
    )

    response.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', async (request, response, next) => {
  const { errors, values } = validateApplicationInput(request.body, {
    isCreate: false,
  })

  if (hasValidationErrors(errors)) {
    sendValidationError(response, errors)
    return
  }

  const entries = Object.entries(values)
  const setClauses = entries.map(
    ([field], index) => field + ' = $' + String(index + 1),
  )
  const params = entries.map((entry) => entry[1])
  params.push(request.params.id)

  try {
    const result = await query(
      `UPDATE applications
       SET ${setClauses.join(', ')},
           updated_at = NOW()
       WHERE id = $${params.length}
       RETURNING ${applicationColumns}`,
      params,
    )

    if (result.rowCount === 0) {
      response.status(404).json({
        message: 'Application not found',
      })
      return
    }

    response.status(200).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (request, response, next) => {
  try {
    const result = await query('DELETE FROM applications WHERE id = $1', [
      request.params.id,
    ])

    if (result.rowCount === 0) {
      response.status(404).json({
        message: 'Application not found',
      })
      return
    }

    response.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default router
