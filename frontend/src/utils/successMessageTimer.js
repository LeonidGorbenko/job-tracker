export const SUCCESS_MESSAGE_DISPLAY_DURATION_MS = 5000
export const SUCCESS_MESSAGE_EXIT_DURATION_MS = 180

export function startSuccessMessageDismissTimer({
  clearTimer = clearTimeout,
  displayDurationMs = SUCCESS_MESSAGE_DISPLAY_DURATION_MS,
  exitDurationMs = SUCCESS_MESSAGE_EXIT_DURATION_MS,
  message,
  onDismiss,
  onExitStart,
  setTimer = setTimeout,
}) {
  if (!message || !message.trim() || !onDismiss) {
    return undefined
  }

  let hasStartedDismiss = false
  let exitTimerId

  function dismiss() {
    if (hasStartedDismiss) {
      return
    }

    hasStartedDismiss = true
    clearTimer(displayTimerId)
    onExitStart?.()
    exitTimerId = setTimer(onDismiss, exitDurationMs)
  }

  const displayTimerId = setTimer(dismiss, displayDurationMs)

  function cleanup() {
    clearTimer(displayTimerId)

    if (exitTimerId !== undefined) {
      clearTimer(exitTimerId)
    }
  }

  return {
    cleanup,
    dismiss,
  }
}
