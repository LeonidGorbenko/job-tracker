export class ApiError extends Error {
  constructor(message, { errors = null, path = null, status = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.errors = errors
    this.path = path
    this.status = status
  }
}

async function readResponseBody(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function logApiError({ error, message, path, status }) {
  if (!import.meta.env.DEV) {
    return
  }

  console.error(message, {
    path,
    status,
    error: getErrorMessage(error),
  })
}

async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  }

  let body = options.body

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
  }

  let response

  try {
    response = await fetch(path, {
      ...options,
      headers,
      body,
    })
  } catch (error) {
    logApiError({
      error,
      message: 'Could not reach the API.',
      path,
      status: null,
    })

    throw new ApiError(
      'Could not connect to the API. Check that the backend is reachable.',
      {
        path,
        status: null,
      },
    )
  }

  const data = await readResponseBody(response)

  if (!response.ok) {
    const apiError = new ApiError(data?.message || 'Request failed', {
      errors: data?.errors || null,
      path,
      status: response.status,
    })

    logApiError({
      error: apiError,
      message: 'API request failed.',
      path,
      status: response.status,
    })

    throw apiError
  }

  return data
}

export async function getApplications() {
  return request('/api/applications')
}

export async function getApplicationById(id) {
  try {
    return await request('/api/applications/' + id)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function createApplication(input) {
  return request('/api/applications', {
    method: 'POST',
    body: input,
  })
}

export async function updateApplication(id, input) {
  try {
    return await request('/api/applications/' + id, {
      method: 'PATCH',
      body: input,
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function deleteApplication(id) {
  try {
    await request('/api/applications/' + id, {
      method: 'DELETE',
    })

    return true
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return false
    }

    throw error
  }
}
