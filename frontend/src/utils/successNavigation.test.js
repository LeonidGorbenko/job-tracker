import { describe, expect, it } from 'vitest'
import {
  getCreateSuccessNavigation,
  getDeleteSuccessNavigation,
  getEditSuccessNavigation,
  getNextVisibleSuccessMessage,
  getSuccessMessageFromState,
  removeSuccessMessageFromState,
  successMessages,
} from './successNavigation.js'

describe('successNavigation', () => {
  it('passes the create success message to the application details destination', () => {
    expect(getCreateSuccessNavigation({ id: 'application-1' })).toEqual({
      to: '/applications/application-1',
      options: {
        state: {
          successMessage: successMessages.applicationCreated,
        },
      },
    })
  })

  it('passes the edit success message to the application details destination', () => {
    expect(getEditSuccessNavigation({ id: 'application-2' })).toEqual({
      to: '/applications/application-2',
      options: {
        state: {
          successMessage: successMessages.changesSaved,
        },
      },
    })
  })

  it('passes the delete success message to the applications list', () => {
    expect(getDeleteSuccessNavigation(true)).toEqual({
      to: '/applications',
      options: {
        state: {
          successMessage: successMessages.applicationDeleted,
        },
      },
    })
  })

  it('does not create success navigation for failed mutation results', () => {
    expect(getCreateSuccessNavigation(null)).toBeNull()
    expect(getEditSuccessNavigation(null)).toBeNull()
    expect(getDeleteSuccessNavigation(false)).toBeNull()
  })

  it('reads a received success message from navigation state', () => {
    expect(
      getSuccessMessageFromState({
        successMessage: successMessages.applicationCreated,
      }),
    ).toBe(successMessages.applicationCreated)
  })

  it('uses a new navigation-state message as the visible message', () => {
    expect(
      getNextVisibleSuccessMessage(null, {
        successMessage: successMessages.applicationDeleted,
      }),
    ).toBe(successMessages.applicationDeleted)
  })

  it('keeps the local message after navigation state is consumed', () => {
    expect(
      getNextVisibleSuccessMessage(
        successMessages.applicationCreated,
        null,
      ),
    ).toBe(successMessages.applicationCreated)
  })

  it('keeps the visible message when the consumed navigation state is cleared', () => {
    const navigationState = {
      successMessage: successMessages.applicationDeleted,
    }

    const visibleMessage = getNextVisibleSuccessMessage(null, navigationState)
    const consumedState = removeSuccessMessageFromState(navigationState)

    expect(consumedState).toBeNull()
    expect(getNextVisibleSuccessMessage(visibleMessage, consumedState)).toBe(
      successMessages.applicationDeleted,
    )
  })

  it('ignores missing or invalid success messages', () => {
    expect(getSuccessMessageFromState(null)).toBeNull()
    expect(getSuccessMessageFromState({})).toBeNull()
    expect(getSuccessMessageFromState({ successMessage: '   ' })).toBeNull()
    expect(getSuccessMessageFromState({ successMessage: 123 })).toBeNull()
  })

  it('clears a consumed success message from navigation state', () => {
    expect(
      removeSuccessMessageFromState({
        successMessage: successMessages.applicationDeleted,
      }),
    ).toBeNull()
  })

  it('preserves unrelated navigation state when clearing a success message', () => {
    expect(
      removeSuccessMessageFromState({
        from: '/applications/new',
        successMessage: successMessages.applicationCreated,
      }),
    ).toEqual({
      from: '/applications/new',
    })
  })
})
