import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { after, before, describe, it } from 'node:test'

process.env.NODE_ENV = 'test'

if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    'TEST_DATABASE_URL is required for backend API tests. Configure it with a dedicated disposable PostgreSQL test database, for example: TEST_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/job_tracker_test. Tests must not run against DATABASE_URL.',
  )
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL

const { default: app } = await import('../src/app.js')
const { closePool, query } = await import('../src/db.js')

const testRunId = 'api-test-' + randomUUID()
const createdApplicationIds = new Set()

let server
let baseUrl
let databaseReady = false

function buildTestId(label) {
  const id = testRunId + '-' + label + '-' + randomUUID()
  createdApplicationIds.add(id)
  return id
}

function buildApplication(overrides = {}) {
  return {
    company: 'API Test Company',
    position: 'Junior Frontend Developer',
    location: 'Berlin',
    status: 'Applied',
    job_url: 'https://example.com/jobs/frontend',
    applied_at: '2026-02-10',
    notes: 'Created by automated API test.',
    ...overrides,
  }
}

async function request(path, options = {}) {
  const response = await fetch(baseUrl + path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    body:
      options.body && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body,
  })

  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  return {
    body,
    response,
  }
}

async function insertApplication(id, overrides = {}) {
  const application = buildApplication(overrides)

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
    RETURNING id`,
    [
      id,
      application.company,
      application.position,
      application.location,
      application.status,
      application.job_url,
      application.notes,
      application.applied_at,
    ],
  )

  return result.rows[0]
}

async function deleteTestApplications() {
  const ids = [...createdApplicationIds]

  if (ids.length > 0) {
    await query('DELETE FROM applications WHERE id = ANY($1)', [ids])
  }

  await query('DELETE FROM applications WHERE id LIKE $1', [testRunId + '%'])
  createdApplicationIds.clear()
}

async function ensureApplicationsTableExists() {
  const schemaSql = await readFile(
    new URL('../sql/001_create_applications.sql', import.meta.url),
    'utf8',
  )

  try {
    await query(schemaSql)
  } catch (error) {
    if (error?.code !== '42501') {
      throw error
    }

    await query('SELECT 1 FROM applications LIMIT 0')
  }
}

before(async () => {
  await ensureApplicationsTableExists()
  databaseReady = true
  await deleteTestApplications()

  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))

  const address = server.address()
  baseUrl = 'http://127.0.0.1:' + String(address.port)
})

after(async () => {
  if (databaseReady) {
    await deleteTestApplications()
  }

  await new Promise((resolve, reject) => {
    if (!server) {
      resolve()
      return
    }

    server.close((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
  await closePool()
})

describe('Applications API', () => {
  it('returns API health information', async () => {
    const { body, response } = await request('/api/health')

    assert.equal(response.status, 200)
    assert.equal(body.status, 'ok')
    assert.equal(body.service, 'job-tracker-api')
    assert.equal(typeof body.timestamp, 'string')
  })

  it('supports successful create, read, update, list, and delete operations', async () => {
    const createResult = await request('/api/applications', {
      method: 'POST',
      body: buildApplication({
        company: '  API Test Create GmbH  ',
        position: '  Trainee Software Developer  ',
        location: '',
        notes: '',
        applied_at: null,
      }),
    })

    assert.equal(createResult.response.status, 201)
    assert.equal(createResult.body.company, 'API Test Create GmbH')
    assert.equal(createResult.body.position, 'Trainee Software Developer')
    assert.equal(createResult.body.location, null)
    assert.equal(createResult.body.notes, null)
    assert.equal(createResult.body.applied_at, null)
    assert.equal(typeof createResult.body.id, 'string')

    createdApplicationIds.add(createResult.body.id)

    const readResult = await request(
      '/api/applications/' + createResult.body.id,
    )

    assert.equal(readResult.response.status, 200)
    assert.equal(readResult.body.id, createResult.body.id)

    const updateResult = await request(
      '/api/applications/' + createResult.body.id,
      {
        method: 'PATCH',
        body: {
          status: 'Interview',
          location: 'Remote',
          applied_at: '2026-03-01',
        },
      },
    )

    assert.equal(updateResult.response.status, 200)
    assert.equal(updateResult.body.status, 'Interview')
    assert.equal(updateResult.body.location, 'Remote')
    assert.equal(updateResult.body.applied_at, '2026-03-01')

    const listResult = await request('/api/applications')

    assert.equal(listResult.response.status, 200)
    assert.ok(Array.isArray(listResult.body))
    assert.ok(
      listResult.body.some(
        (application) => application.id === createResult.body.id,
      ),
    )

    const deleteResult = await request(
      '/api/applications/' + createResult.body.id,
      {
        method: 'DELETE',
      },
    )

    assert.equal(deleteResult.response.status, 204)
    assert.equal(deleteResult.body, null)

    const readAfterDeleteResult = await request(
      '/api/applications/' + createResult.body.id,
    )

    assert.equal(readAfterDeleteResult.response.status, 404)
    assert.equal(readAfterDeleteResult.body.message, 'Application not found')

    createdApplicationIds.delete(createResult.body.id)
  })

  it('returns validation errors for invalid create input', async () => {
    const { body, response } = await request('/api/applications', {
      method: 'POST',
      body: {
        company: '',
        position: '',
        status: 'Archived',
        job_url: 'not-a-url',
        applied_at: '2026-02-31',
        unexpected: 'not allowed',
      },
    })

    assert.equal(response.status, 400)
    assert.equal(body.message, 'Validation failed')
    assert.equal(body.errors.company, 'Company is required')
    assert.equal(body.errors.position, 'Position is required')
    assert.match(body.errors.status, /Status must be one of:/)
    assert.equal(body.errors.job_url, 'Job URL must be a valid HTTP or HTTPS URL')
    assert.equal(body.errors.applied_at, 'Applied date must use YYYY-MM-DD')
    assert.equal(body.errors.unexpected, 'This field is not allowed')
  })

  it('returns validation errors for invalid update input', async () => {
    const id = buildTestId('invalid-update')
    await insertApplication(id)

    const emptyUpdateResult = await request('/api/applications/' + id, {
      method: 'PATCH',
      body: {},
    })

    assert.equal(emptyUpdateResult.response.status, 400)
    assert.equal(
      emptyUpdateResult.body.errors.request,
      'Provide at least one field to update',
    )

    const invalidUpdateResult = await request('/api/applications/' + id, {
      method: 'PATCH',
      body: {
        company: 'x'.repeat(121),
        notes: 123,
      },
    })

    assert.equal(invalidUpdateResult.response.status, 400)
    assert.equal(
      invalidUpdateResult.body.errors.company,
      'Company must be 120 characters or fewer',
    )
    assert.equal(invalidUpdateResult.body.errors.notes, 'Notes must be text')
  })

  it('returns not-found responses for missing applications', async () => {
    const missingId = buildTestId('missing')
    createdApplicationIds.delete(missingId)

    const readResult = await request('/api/applications/' + missingId)

    assert.equal(readResult.response.status, 404)
    assert.equal(readResult.body.message, 'Application not found')

    const updateResult = await request('/api/applications/' + missingId, {
      method: 'PATCH',
      body: {
        status: 'Rejected',
      },
    })

    assert.equal(updateResult.response.status, 404)
    assert.equal(updateResult.body.message, 'Application not found')

    const deleteResult = await request('/api/applications/' + missingId, {
      method: 'DELETE',
    })

    assert.equal(deleteResult.response.status, 404)
    assert.equal(deleteResult.body.message, 'Application not found')
  })

  it('returns a validation error when the request body is not an object', async () => {
    const { body, response } = await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify(['not', 'an', 'object']),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    assert.equal(response.status, 400)
    assert.equal(body.message, 'Validation failed')
    assert.equal(body.errors.request, 'Request body must be a JSON object')
  })
})
