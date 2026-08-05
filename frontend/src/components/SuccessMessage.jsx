import { useEffect, useRef, useState } from 'react'
import { startSuccessMessageDismissTimer } from '../utils/successMessageTimer.js'

function SuccessMessage({ message, onDismiss }) {
  const normalizedMessage = typeof message === 'string' ? message.trim() : ''
  const dismissTimerRef = useRef(null)
  const [exitingMessage, setExitingMessage] = useState(null)
  const isExiting = exitingMessage === normalizedMessage

  useEffect(() => {
    const dismissTimer = startSuccessMessageDismissTimer({
      message: normalizedMessage,
      onDismiss,
      onExitStart: () => setExitingMessage(normalizedMessage),
    })

    dismissTimerRef.current = dismissTimer

    return () => {
      dismissTimer?.cleanup()
      dismissTimerRef.current = null
    }
  }, [normalizedMessage, onDismiss])

  function handleDismiss() {
    dismissTimerRef.current?.dismiss()
  }

  if (!normalizedMessage) {
    return null
  }

  return (
    <div
      className={[
        'mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950 shadow-sm transition-all duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:flex sm:items-start sm:justify-between sm:gap-4',
        'motion-safe:animate-[success-message-enter_180ms_ease-out]',
        isExiting ? '-translate-y-1 opacity-0' : 'translate-y-0 opacity-100',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-3">
        <span
          className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
          aria-hidden="true"
        >
          <svg
            className="size-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            focusable="false"
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.296a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3.25-3.25a1 1 0 1 1 1.414-1.414l2.543 2.543 6.543-6.543a1 1 0 0 1 1.414 0Z"
              clipRule="evenodd"
            />
          </svg>
        </span>

        <p className="font-semibold leading-6">{normalizedMessage}</p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss success message"
          className="mt-3 rounded-md text-sm font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 outline-none hover:text-emerald-950 hover:decoration-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50 sm:mt-0"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}

export default SuccessMessage
