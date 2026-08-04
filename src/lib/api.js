import { supabase } from '@/lib/supabase'

// En local, definir VITE_API_URL en .env.local (ej. http://localhost:3000).
// Sin esa variable se usa el backend desplegado en Render — así Vercel no
// necesita configuración extra.
const API_URL = import.meta.env.VITE_API_URL || 'https://academia-deportiva-api-24zm.onrender.com'

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

// Conserva el status HTTP en el error para poder distinguir "no existe" (404)
// de una caída de red o del servidor.
const httpError = async (res) => {
  const err = new Error(await parseError(res))
  err.status = res.status
  return err
}

// El backend exige `Authorization: Bearer <access_token>` en todo lo que no
// sea público. getSession() lee de almacenamiento local y refresca el token
// si está por vencer, así que es barato llamarlo en cada petición.
const cabeceras = async (extra = {}) => {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    ...extra,
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  }
}

const enviar = async (metodo, endpoint, data) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: metodo,
    headers: await cabeceras({ 'Content-Type': 'application/json' }),
    body: data !== undefined ? JSON.stringify(data) : undefined,
  })
  if (!res.ok) throw await httpError(res)
  return res.json()
}

const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: await cabeceras() })
    if (!res.ok) throw await httpError(res)
    return res.json()
  },

  post: (endpoint, data) => enviar('POST', endpoint, data ?? {}),

  put: (endpoint, data) => enviar('PUT', endpoint, data ?? {}),

  delete: (endpoint) => enviar('DELETE', endpoint),
}

export default api