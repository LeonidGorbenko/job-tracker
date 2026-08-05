import {
  sortOptions,
  statusFilterOptions,
} from './getVisibleApplications.js'

export const applicationListQueryParams = {
  search: 'search',
  status: 'status',
  sort: 'sort',
}

export const defaultApplicationListControls = {
  searchQuery: '',
  statusFilter: 'All',
  sortBy: 'newest',
}

const validStatusFilters = new Set(statusFilterOptions)
const validSortValues = new Set(sortOptions.map((option) => option.value))

function getSearchParams(search) {
  return new URLSearchParams(search)
}

function getValidStatusFilter(value) {
  if (validStatusFilters.has(value)) {
    return value
  }

  return defaultApplicationListControls.statusFilter
}

function getValidSortBy(value) {
  if (validSortValues.has(value)) {
    return value
  }

  return defaultApplicationListControls.sortBy
}

export function getApplicationListControlsFromSearch(search) {
  const params = getSearchParams(search)

  return {
    searchQuery: params.get(applicationListQueryParams.search) || '',
    statusFilter: getValidStatusFilter(
      params.get(applicationListQueryParams.status),
    ),
    sortBy: getValidSortBy(params.get(applicationListQueryParams.sort)),
  }
}

export function buildApplicationListSearch(currentSearch, controls) {
  const params = getSearchParams(currentSearch)
  const searchQuery = controls.searchQuery || ''
  const statusFilter = getValidStatusFilter(controls.statusFilter)
  const sortBy = getValidSortBy(controls.sortBy)

  if (searchQuery.trim()) {
    params.set(applicationListQueryParams.search, searchQuery)
  } else {
    params.delete(applicationListQueryParams.search)
  }

  if (statusFilter === defaultApplicationListControls.statusFilter) {
    params.delete(applicationListQueryParams.status)
  } else {
    params.set(applicationListQueryParams.status, statusFilter)
  }

  if (sortBy === defaultApplicationListControls.sortBy) {
    params.delete(applicationListQueryParams.sort)
  } else {
    params.set(applicationListQueryParams.sort, sortBy)
  }

  const nextSearch = params.toString()

  return nextSearch ? '?' + nextSearch : ''
}
