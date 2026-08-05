import { describe, expect, it } from 'vitest'
import { getDashboardSummary } from './getDashboardSummary.js'

const applications = [
  {
    id: '1',
    status: 'Applied',
    updated_at: '2026-01-01T10:00:00.000Z',
  },
  {
    id: '2',
    status: 'Interview',
    updated_at: '2026-01-06T10:00:00.000Z',
  },
  {
    id: '3',
    status: 'Offer',
    updated_at: '2026-01-03T10:00:00.000Z',
  },
  {
    id: '4',
    status: 'Rejected',
    updated_at: '2026-01-07T10:00:00.000Z',
  },
  {
    id: '5',
    status: 'Applied',
    updated_at: '2026-01-05T10:00:00.000Z',
  },
  {
    id: '6',
    status: 'Saved',
    updated_at: '2026-01-02T10:00:00.000Z',
  },
  {
    id: '7',
    status: 'Interview',
    updated_at: '2026-01-04T10:00:00.000Z',
  },
]

function getIds(result) {
  return result.map((application) => application.id)
}

describe('getDashboardSummary', () => {
  it('summarizes an empty applications array', () => {
    expect(getDashboardSummary([])).toEqual({
      stats: {
        total: 0,
        applied: 0,
        interviews: 0,
        offers: 0,
      },
      recentApplications: [],
    })
  })

  it('counts total applications', () => {
    expect(getDashboardSummary(applications).stats.total).toBe(7)
  })

  it('counts Applied applications', () => {
    expect(getDashboardSummary(applications).stats.applied).toBe(2)
  })

  it('counts Interview applications', () => {
    expect(getDashboardSummary(applications).stats.interviews).toBe(2)
  })

  it('counts Offer applications', () => {
    expect(getDashboardSummary(applications).stats.offers).toBe(1)
  })

  it('returns recent applications sorted by updated_at descending', () => {
    const summary = getDashboardSummary(applications)

    expect(getIds(summary.recentApplications)).toEqual([
      '4',
      '2',
      '5',
      '7',
      '3',
    ])
  })

  it('returns only five recent applications', () => {
    const summary = getDashboardSummary(applications)

    expect(summary.recentApplications).toHaveLength(5)
  })

  it('does not mutate the source array', () => {
    const originalIds = getIds(applications)

    getDashboardSummary(applications)

    expect(getIds(applications)).toEqual(originalIds)
  })
})
