export function getDashboardSummary(applications) {
  const total = applications.length
  const applied = applications.filter(
    (application) => application.status === 'Applied',
  ).length
  const interviews = applications.filter(
    (application) => application.status === 'Interview',
  ).length
  const offers = applications.filter(
    (application) => application.status === 'Offer',
  ).length

  const recentApplications = [...applications]
    .sort(
      (left, right) =>
        new Date(right.updated_at).getTime() -
        new Date(left.updated_at).getTime(),
    )
    .slice(0, 5)

  return {
    stats: {
      total,
      applied,
      interviews,
      offers,
    },
    recentApplications,
  }
}
