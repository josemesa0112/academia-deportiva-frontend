const API_URL = 'https://academia-deportiva-api.onrender.com'

const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`)
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return res.json()
  },

  post: async (endpoint, data) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return res.json()
  },

  put: async (endpoint, data) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return res.json()
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return res.json()
  }
}

export default api