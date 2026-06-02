import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'

export interface UserRol {
  id: number
  nombre: string
  apellido: string
  correo: string
  id_rol: number
  nombre_rol: string
  // Si el usuario es Profesor (id_rol === 2), trae sus categorías asignadas.
  // Para otros roles es null o undefined.
  profesor_categorias?: { id: number; nombre: string }[] | null
  // Si el usuario es Deportista (id_rol === 3), trae su id de deportista,
  // categoría asignada y nombre de categoría. Usado para filtros y redirect
  // de "Mi Perfil".
  deportista_info?: { id: number; id_categoria: number; categoria: string } | null
}

export function useRol() {
  const [userRol, setUserRol] = useState<UserRol | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const obtenerRol = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.email) { setLoading(false); return }

        const persona = await api.get(`/api/personas/correo/${session.user.email}`)
        setUserRol(persona)
      } catch {
        setUserRol(null)
      } finally {
        setLoading(false)
      }
    }
    obtenerRol()
  }, [])

  const esAdmin = () => userRol?.id_rol === 1
  const esProfesor = () => userRol?.id_rol === 2
  const esDeportista = () => userRol?.id_rol === 3
  const esProveedor = () => userRol?.id_rol === 4

  return { userRol, loading, esAdmin, esProfesor, esDeportista, esProveedor }
}