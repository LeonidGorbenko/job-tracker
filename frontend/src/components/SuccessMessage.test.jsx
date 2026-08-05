import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  SUCCESS_MESSAGE_DISPLAY_DURATION_MS,
  SUCCESS_MESSAGE_EXIT_DURATION_MS,
  startSuccessMessageDismissTimer,
} from '../utils/successMessageTimer.js'
import SuccessMessage from './SuccessMessage.jsx'

afterEach(() => {
  vi.useRealTimers()
})

describe('SuccessMessage', () => {
  it('renders an accessible status message', () => {
    const markup = renderToStaticMarkup(
      <SuccessMessage message="Application created successfully." />,
    )

    expect(markup).toContain('role="status"')
    expect(markup).toContain('aria-live="polite"')
    expect(markup).toContain('Application created successfully.')
    expect(markup).toContain('aria-hidden="true"')
  })

  it('keeps the notification visible in the rendered markup initially', () => {
    const markup = renderToStaticMarkup(
      <SuccessMessage message="Changes saved successfully." />,
    )

    expect(markup).toContain('Changes saved successfully.')
    expect(markup).toContain('opacity-100')
  })

  it('renders a dismiss button when dismissal is available', () => {
    const markup = renderToStaticMarkup(
      <SuccessMessage
        message="Application deleted successfully."
        onDismiss={() => {}}
      />,
    )

    expect(markup).toContain('Dismiss')
  })

  it('keeps manual dismissal available while automatic dismissal is enabled', () => {
    const markup = renderToStaticMarkup(
      <SuccessMessage
        message="Application deleted successfully."
        onDismiss={() => {}}
      />,
    )

    expect(markup).toContain('type="button"')
    expect(markup).toContain('aria-label="Dismiss success message"')
    expect(markup).toContain('Dismiss')
  })

  it('includes restrained transition and reduced-motion classes', () => {
    const markup = renderToStaticMarkup(
      <SuccessMessage message="Application created successfully." />,
    )

    expect(markup).toContain('transition-all')
    expect(markup).toContain('motion-reduce:transition-none')
    expect(markup).toContain('motion-safe:animate-')
  })

  it('renders nothing without a message', () => {
    const markup = renderToStaticMarkup(<SuccessMessage message="" />)

    expect(markup).toBe('')
  })

  it('does not start the exit before 5000 milliseconds', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    const onExitStart = vi.fn()

    startSuccessMessageDismissTimer({
      message: 'Application created successfully.',
      onDismiss,
      onExitStart,
    })

    vi.advanceTimersByTime(SUCCESS_MESSAGE_DISPLAY_DURATION_MS - 1)

    expect(onExitStart).not.toHaveBeenCalled()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('starts the exit after 5000 milliseconds before removing the notification', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    const onExitStart = vi.fn()

    startSuccessMessageDismissTimer({
      message: 'Application created successfully.',
      onDismiss,
      onExitStart,
    })

    vi.advanceTimersByTime(SUCCESS_MESSAGE_DISPLAY_DURATION_MS)

    expect(onExitStart).toHaveBeenCalledTimes(1)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('triggers dismiss after the exit transition finishes', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    const onExitStart = vi.fn()

    startSuccessMessageDismissTimer({
      message: 'Application created successfully.',
      onDismiss,
      onExitStart,
    })

    vi.advanceTimersByTime(
      SUCCESS_MESSAGE_DISPLAY_DURATION_MS + SUCCESS_MESSAGE_EXIT_DURATION_MS,
    )

    expect(onExitStart).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('cleans up the timer when the component unmounts', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    const onExitStart = vi.fn()
    const dismissTimer = startSuccessMessageDismissTimer({
      message: 'Application created successfully.',
      onDismiss,
      onExitStart,
    })

    dismissTimer.cleanup()
    vi.advanceTimersByTime(
      SUCCESS_MESSAGE_DISPLAY_DURATION_MS + SUCCESS_MESSAGE_EXIT_DURATION_MS,
    )

    expect(onExitStart).not.toHaveBeenCalled()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does not start a timer when there is no message', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()

    const cleanup = startSuccessMessageDismissTimer({
      message: '',
      onDismiss,
    })

    vi.advanceTimersByTime(
      SUCCESS_MESSAGE_DISPLAY_DURATION_MS + SUCCESS_MESSAGE_EXIT_DURATION_MS,
    )

    expect(cleanup).toBeUndefined()
    expect(onDismiss).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('clears the previous timer and starts a new timer when the message changes', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    const onExitStart = vi.fn()

    const firstDismissTimer = startSuccessMessageDismissTimer({
      message: 'Application created successfully.',
      onDismiss,
      onExitStart,
    })

    vi.advanceTimersByTime(4000)
    firstDismissTimer.cleanup()

    startSuccessMessageDismissTimer({
      message: 'Changes saved successfully.',
      onDismiss,
      onExitStart,
    })

    vi.advanceTimersByTime(4999)
    expect(onExitStart).not.toHaveBeenCalled()
    expect(onDismiss).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onExitStart).toHaveBeenCalledTimes(1)
    expect(onDismiss).not.toHaveBeenCalled()

    vi.advanceTimersByTime(SUCCESS_MESSAGE_EXIT_DURATION_MS)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('allows manual dismissal before the automatic timer finishes', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    const onExitStart = vi.fn()

    const dismissTimer = startSuccessMessageDismissTimer({
      message: 'Application deleted successfully.',
      onDismiss,
      onExitStart,
    })

    dismissTimer.dismiss()

    expect(onExitStart).toHaveBeenCalledTimes(1)
    expect(onDismiss).not.toHaveBeenCalled()

    vi.advanceTimersByTime(SUCCESS_MESSAGE_EXIT_DURATION_MS)

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not create duplicate timers for a single displayed message', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()

    startSuccessMessageDismissTimer({
      message: 'Application deleted successfully.',
      onDismiss,
    })

    expect(vi.getTimerCount()).toBe(1)
  })

  it('does not trigger duplicate dismiss calls when manual and automatic dismiss both run', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    const onExitStart = vi.fn()

    const dismissTimer = startSuccessMessageDismissTimer({
      message: 'Application deleted successfully.',
      onDismiss,
      onExitStart,
    })

    dismissTimer.dismiss()
    dismissTimer.dismiss()

    vi.advanceTimersByTime(
      SUCCESS_MESSAGE_DISPLAY_DURATION_MS + SUCCESS_MESSAGE_EXIT_DURATION_MS,
    )

    expect(onExitStart).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
