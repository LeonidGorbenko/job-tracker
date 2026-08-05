export const statusFilterOptions = [
  'All',
  'Saved',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
]

export const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'company-az', label: 'Company A-Z' },
  { value: 'recently-updated', label: 'Recently updated' },
]

function matchesSearch(application, normalizedQuery) {
  if (!normalizedQuery) {
    return true
  }

  const searchableFields = [
    application.company,
    application.position,
    application.location,
  ]

  return searchableFields.some((field) =>
    (field || '').toLowerCase().includes(normalizedQuery),
  )
}

function compareDatesDescending(leftDate, rightDate) {
  return new Date(rightDate).getTime() - new Date(leftDate).getTime()
}

function compareDatesAscending(leftDate, rightDate) {
  return new Date(leftDate).getTime() - new Date(rightDate).getTime()
}

export function getVisibleApplications({
  applications,
  searchQuery,
  sortBy,
  statusFilter,
}) {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  const searchedApplications = applications.filter((application) =>
    matchesSearch(application, normalizedQuery),
  )

  const filteredApplications =
    statusFilter === 'All'
      ? searchedApplications
      : searchedApplications.filter(
          (application) => application.status === statusFilter,
        )

  const sortedApplications = [...filteredApplications]

  if (sortBy === 'oldest') {
    sortedApplications.sort((left, right) =>
      compareDatesAscending(left.created_at, right.created_at),
    )
  } else if (sortBy === 'company-az') {
    sortedApplications.sort((left, right) =>
      left.company.localeCompare(right.company),
    )
  } else if (sortBy === 'recently-updated') {
    sortedApplications.sort((left, right) =>
      compareDatesDescending(left.updated_at, right.updated_at),
    )
  } else {
    sortedApplications.sort((left, right) =>
      compareDatesDescending(left.created_at, right.created_at),
    )
  }

  return sortedApplications
}
