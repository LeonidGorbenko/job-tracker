import { describe, expect, it } from 'vitest'
import {
  applicationFieldLimits,
  validateApplication,
} from './validateApplication.js'

const validApplication = {
  company: 'Example GmbH',
  position: 'Junior Frontend Developer',
  location: 'Berlin',
  status: 'Applied',
  job_url: 'https://example.com/jobs/frontend',
  applied_at: '2026-08-01',
  notes: 'Follow up next week.',
}

function validateWith(overrides) {
  return validateApplication({
    ...validApplication,
    ...overrides,
  })
}

describe('validateApplication', () => {
  it('accepts a valid application', () => {
    expect(validateApplication(validApplication)).toEqual({})
  })

  it('requires company', () => {
    expect(validateWith({ company: '   ' })).toMatchObject({
      company: 'Company is required',
    })
  })

  it('requires position', () => {
    expect(validateWith({ position: '' })).toMatchObject({
      position: 'Position is required',
    })
  })

  it('rejects an invalid status', () => {
    expect(validateWith({ status: 'Screening' })).toMatchObject({
      status: 'Choose a valid status',
    })
  })

  it('accepts empty optional fields', () => {
    expect(
      validateWith({
        location: '',
        job_url: '',
        applied_at: '',
        notes: '',
      }),
    ).toEqual({})
  })

  it('accepts a valid HTTP URL', () => {
    expect(validateWith({ job_url: 'http://example.com/job' })).toEqual({})
  })

  it('accepts a valid HTTPS URL', () => {
    expect(validateWith({ job_url: 'https://example.com/job' })).toEqual({})
  })

  it('rejects an invalid URL', () => {
    expect(validateWith({ job_url: 'ftp://example.com/job' })).toMatchObject({
      job_url: 'Job URL must be a valid HTTP or HTTPS URL',
    })
  })

  it('accepts a valid applied date', () => {
    expect(validateWith({ applied_at: '2026-02-28' })).toEqual({})
  })

  it('rejects an invalid applied date', () => {
    expect(validateWith({ applied_at: '2026-02-30' })).toMatchObject({
      applied_at: 'Applied date must use YYYY-MM-DD',
    })
  })

  it('rejects company over 120 characters', () => {
    expect(
      validateWith({
        company: 'A'.repeat(applicationFieldLimits.company + 1),
      }),
    ).toMatchObject({
      company: 'Company must be 120 characters or fewer',
    })
  })

  it('rejects position over 120 characters', () => {
    expect(
      validateWith({
        position: 'A'.repeat(applicationFieldLimits.position + 1),
      }),
    ).toMatchObject({
      position: 'Position must be 120 characters or fewer',
    })
  })

  it('rejects location over 120 characters', () => {
    expect(
      validateWith({
        location: 'A'.repeat(applicationFieldLimits.location + 1),
      }),
    ).toMatchObject({
      location: 'Location must be 120 characters or fewer',
    })
  })

  it('rejects job URL over 500 characters', () => {
    expect(
      validateWith({
        job_url: 'https://' + 'a'.repeat(applicationFieldLimits.job_url),
      }),
    ).toMatchObject({
      job_url: 'Job URL must be 500 characters or fewer',
    })
  })

  it('rejects notes over 5000 characters', () => {
    expect(
      validateWith({
        notes: 'A'.repeat(applicationFieldLimits.notes + 1),
      }),
    ).toMatchObject({
      notes: 'Notes must be 5000 characters or fewer',
    })
  })

  it('rejects optional fields that are not text', () => {
    expect(
      validateWith({
        location: 123,
        job_url: null,
        applied_at: null,
        notes: ['note'],
      }),
    ).toMatchObject({
      location: 'Location must be text',
      job_url: 'Job URL must be text',
      applied_at: 'Applied date must be text',
      notes: 'Notes must be text',
    })
  })
})
