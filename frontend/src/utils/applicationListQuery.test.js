import { describe, expect, it } from 'vitest'
import {
  buildApplicationListSearch,
  defaultApplicationListControls,
  getApplicationListControlsFromSearch,
} from './applicationListQuery.js'

describe('applicationListQuery', () => {
  it('returns default controls without query parameters', () => {
    expect(getApplicationListControlsFromSearch('')).toEqual(
      defaultApplicationListControls,
    )
  })

  it('reads valid URL parameters', () => {
    expect(
      getApplicationListControlsFromSearch(
        '?search=react&status=Applied&sort=recently-updated',
      ),
    ).toEqual({
      searchQuery: 'react',
      statusFilter: 'Applied',
      sortBy: 'recently-updated',
    })
  })

  it('falls back safely for invalid status and sort values', () => {
    expect(
      getApplicationListControlsFromSearch(
        '?search=react&status=Archived&sort=rating',
      ),
    ).toEqual({
      searchQuery: 'react',
      statusFilter: 'All',
      sortBy: 'newest',
    })
  })

  it('serializes non-default controls', () => {
    expect(
      buildApplicationListSearch('', {
        searchQuery: 'react',
        statusFilter: 'Interview',
        sortBy: 'company-az',
      }),
    ).toBe('?search=react&status=Interview&sort=company-az')
  })

  it('omits empty and default values', () => {
    expect(
      buildApplicationListSearch('?search=react&status=Applied&sort=oldest', {
        searchQuery: '',
        statusFilter: 'All',
        sortBy: 'newest',
      }),
    ).toBe('')
  })

  it('removes whitespace-only search values', () => {
    expect(
      buildApplicationListSearch('', {
        searchQuery: '   ',
        statusFilter: 'All',
        sortBy: 'newest',
      }),
    ).toBe('')
  })

  it('preserves unrelated query parameters while updating list controls', () => {
    expect(
      buildApplicationListSearch('?view=compact&page=2', {
        searchQuery: 'frontend',
        statusFilter: 'Offer',
        sortBy: 'recently-updated',
      }),
    ).toBe('?view=compact&page=2&search=frontend&status=Offer&sort=recently-updated')
  })

  it('preserves unrelated query parameters when resetting controls', () => {
    expect(
      buildApplicationListSearch(
        '?view=compact&search=react&status=Applied&sort=oldest',
        {
          searchQuery: '',
          statusFilter: 'All',
          sortBy: 'newest',
        },
      ),
    ).toBe('?view=compact')
  })

  it('round-trips a shared URL after refresh-style re-reading', () => {
    const search = buildApplicationListSearch('', {
      searchQuery: 'Berlin frontend',
      statusFilter: 'Saved',
      sortBy: 'oldest',
    })

    expect(getApplicationListControlsFromSearch(search)).toEqual({
      searchQuery: 'Berlin frontend',
      statusFilter: 'Saved',
      sortBy: 'oldest',
    })
  })

  it('uses the newest URL values when the browser location changes', () => {
    const firstControls = getApplicationListControlsFromSearch(
      '?search=react&status=Applied&sort=oldest',
    )
    const nextControls = getApplicationListControlsFromSearch(
      '?search=node&status=Rejected&sort=company-az',
    )

    expect(firstControls).toEqual({
      searchQuery: 'react',
      statusFilter: 'Applied',
      sortBy: 'oldest',
    })
    expect(nextControls).toEqual({
      searchQuery: 'node',
      statusFilter: 'Rejected',
      sortBy: 'company-az',
    })
  })
})
