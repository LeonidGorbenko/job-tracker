import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <section
      className="mt-8 flex min-h-80 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
      aria-labelledby="not-found-heading"
    >
      <div className="max-w-md">
        <span
          className="mx-auto block h-1 w-10 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Page not found
        </p>
        <h1
          id="not-found-heading"
          className="mt-1 text-3xl font-semibold tracking-tight text-slate-950"
        >
          This page does not exist
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The address may be incorrect, or the page may have been moved.
          Return to the dashboard to continue tracking applications.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
