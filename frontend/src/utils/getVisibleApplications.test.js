import { describe, expect, it } from 'vitest'
import { getVisibleApplications } from './getVisibleApplications.js'

const applications = [
  {
    id: '1',
    company: 'BetaWorks',
    position: 'Junior Frontend Developer',
    location: 'Berlin',
    status: 'Applied',
    created_at: '2026-01-10T10:00:00.000Z',
    updated_at: '2026-01-12T10:00:00.000Z',
  },
  {
    id: '2',
    company: 'Alpha Labs',
    position: 'Trainee Software Developer',
    location: 'Leipzig',
    status: 'Saved',
    created_at: '2026-01-05T10:00:00.000Z',
    updated_at: '2026-01-20T10:00:00.000Z',
  },
  {
    id: '3',
    company: 'Code Garden',
    position: 'Frontend Engineer',
    location: 'Remote',
    status: 'Interview',
    created_at: '2026-01-15T10:00:00.000Z',
    updated_at: '2026-01-16T10:00:00.000Z',
  },
  {
    id: '4',
    company: 'Delta Apps',
    position: 'Junior Web Developer',
    location: '',
    status: 'Offer',
    created_at: '2026-01-01T10:00:00.000Z',
    updated_at: '2026-01-03T10:00:00.000Z',
  },
]

function getIds(result) {
  return result.map((application) => application.id)
}

function getVisible(overrides = {}) {
  return getVisibleApplications({
    applications,
    searchQuery: '',
    statusFilter: 'All',
    sortBy: 'newest',
    ...overrides,
  })
}

describe('getVisibleApplications', () => {
  it('returns all applications with default controls', () => {
    expect(getIds(getVisible())).toEqual(['3', '1', '2', '4'])
  })

  it('searches by company', () => {
    expect(getIds(getVisible({ searchQuery: 'Alpha' }))).toEqual(['2'])
  })

  it('searches by position', () => {
    expect(getIds(getVisible({ searchQuery: 'Web Developer' }))).toEqual(['4'])
  })

  it('searches by location', () => {
    expect(getIds(getVisible({ searchQuery: 'Remote' }))).toEqual(['3'])
  })

  it('searches case-insensitively', () => {
    expect(getIds(getVisible({ searchQuery: 'bErLiN' }))).toEqual(['1'])
  })

  it('filters by status', () => {
    expect(getIds(getVisible({ statusFilter: 'Interview' }))).toEqual(['3'])
  })

  it('returns an empty array when search has no matches', () => {
    expect(getVisible({ searchQuery: 'not found' })).toEqual([])
  })

  it('sorts newest first', () => {
    expect(getIds(getVisible({ sortBy: 'newest' }))).toEqual([
      '3',
      '1',
      '2',
      '4',
    ])
  })

  it('sorts oldest first', () => {
    expect(getIds(getVisible({ sortBy: 'oldest' }))).toEqual([
      '4',
      '2',
      '1',
      '3',
    ])
  })

  it('sorts by company A-Z', () => {
    expect(getIds(getVisible({ sortBy: 'company-az' }))).toEqual([
      '2',
      '1',
      '3',
      '4',
    ])
  })

  it('sorts by recently updated', () => {
    expect(getIds(getVisible({ sortBy: 'recently-updated' }))).toEqual([
      '2',
      '3',
      '1',
      '4',
    ])
  })

  it('does not mutate the source array', () => {
    const originalIds = getIds(applications)

    getVisible({ sortBy: 'company-az' })

    expect(getIds(applications)).toEqual(originalIds)
  })
})
