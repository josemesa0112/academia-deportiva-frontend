const API_URL = 'https://academia-deportiva-api-24zm.onrender.com'

// Intenta leer el mensaje de error del cuerpo de la respuesta, con fallback al status.
const parseError = async (res) => {
  try {
    const body = await res.json()
    if (body?.errors?.length > 0) {
      return body.errors.map((e) => e.mensaje || e.msg || JSON.stringify(e)).join('\n')
    }
    return body?.error || `Error ${res.status}`
  } catch {
    return `Error ${res.status}`
  }
}

const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`)
    if (!res.ok) throw new Error(await parseError(res))
    return res.json()
  },

  post: async (endpoint, data) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const error = await res.json()
      // Si tiene array de errores de validación
      if (error.errors && error.errors.length > 0) {
        throw new Error(error.errors.map((e) => e.mensaje).join('\n'))
      }
      throw new Error(error.error || `Error ${res.status}`)
    }
    return res.json()
  },

  put: async (endpoint, data) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const error = await res.json()
      if (error.errors && error.errors.length > 0) {
        throw new Error(error.errors.map((e) => e.mensaje).join('\n'))
      }
      throw new Error(error.error || `Error ${res.status}`)
    }
    return res.json()
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error(await parseError(res))
    return res.json()
  }
}

export default api