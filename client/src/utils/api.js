const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Get the Firebase token and make an authenticated request
export const apiRequest = async (endpoint, options = {}) => {
  // Get current user token from Firebase
  const { auth } = await import('../firebase/firebase.config')
  const token    = await auth.currentUser?.getIdToken()

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

// Convenience methods
export const api = {
  get:    (endpoint)         => apiRequest(endpoint),
  post:   (endpoint, body)   => apiRequest(endpoint, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (endpoint, body)   => apiRequest(endpoint, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (endpoint)         => apiRequest(endpoint, { method: 'DELETE' }),
}