const statusClasses = {
  Saved: 'border-slate-200 bg-slate-100 text-slate-700',
  Applied: 'border-blue-200 bg-blue-50 text-blue-700',
  Interview: 'border-amber-200 bg-amber-50 text-amber-800',
  Offer: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Rejected: 'border-rose-200 bg-rose-50 text-rose-700',
}

function StatusBadge({ status }) {
  return (
    <span
      className={[
        'inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold',
        statusClasses[status],
      ].join(' ')}
    >
      {status}
    </span>
  )
}

export default StatusBadge
