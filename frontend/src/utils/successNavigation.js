export const successMessages = {
  applicationCreated: 'Application created successfully.',
  changesSaved: 'Changes saved successfully.',
  applicationDeleted: 'Application deleted successfully.',
}

function buildSuccessNavigation(to, message) {
  return {
    to,
    options: {
      state: {
        successMessage: message,
      },
    },
  }
}

function hasApplicationId(application) {
  return Boolean(application && typeof application.id === 'string' && application.id)
}

function isPlainStateObject(state) {
  return Boolean(state) && typeof state === 'object' && !Array.isArray(state)
}

export function getCreateSuccessNavigation(createdApplication) {
  if (!hasApplicationId(createdApplication)) {
    return null
  }

  return buildSuccessNavigation(
    '/applications/' + createdApplication.id,
    successMessages.applicationCreated,
  )
}

export function getEditSuccessNavigation(updatedApplication) {
  if (!hasApplicationId(updatedApplication)) {
    return null
  }

  return buildSuccessNavigation(
    '/applications/' + updatedApplication.id,
    successMessages.changesSaved,
  )
}

export function getDeleteSuccessNavigation(wasDeleted) {
  if (!wasDeleted) {
    return null
  }

  return buildSuccessNavigation(
    '/applications',
    successMessages.applicationDeleted,
  )
}

export function getSuccessMessageFromState(state) {
  if (!isPlainStateObject(state) || typeof state.successMessage !== 'string') {
    return null
  }

  const message = state.successMessage.trim()

  return message || null
}

export function getNextVisibleSuccessMessage(currentMessage, state) {
  return getSuccessMessageFromState(state) || currentMessage || null
}

export function removeSuccessMessageFromState(state) {
  if (!isPlainStateObject(state)) {
    return null
  }

  const nextState = { ...state }
  delete nextState.successMessage

  return Object.keys(nextState).length > 0 ? nextState : null
}
