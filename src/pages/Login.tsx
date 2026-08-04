import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import CambiarPasswordForm from '@/components/auth/CambiarPasswordForm'
import RecuperarPasswordForm from '@/components/auth/RecuperarPasswordForm'
import { Star, Sparkles, ShieldCheck, ArrowLeft, IdCard, Mail, Loader2 } from 'lucide-react'
import api from '@/lib/api'

const campo =
  'h-11 border-[hsl(213,40%,28%)]/40 bg-[hsl(218,38%,16%)] text-white placeholder:text-[hsl(212,14%,45%)]'

type Vista = 'ingreso' | 'cambiar' | 'recuperar'

export default function Login({ session }: { session?: any }) {
  const { toast } = useToast()
  const [vista, setVista] = useState<Vista>('ingreso')
  const [documento, setDocumento] = useState('')
  const [password, setPassword] = useState('')
  const [entrando, setEntrando] = useState(false)

  // Con sesión activa se sale del login, salvo mientras se obliga a definir
  // la contraseña propia tras el primer ingreso.
  if (session && vista !== 'cambiar') return <Navigate to="/dashboard" replace />

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      // Vuelve a /login: al existir sesión, la app redirige sola al dashboard.
      options: { redirectTo: `${window.location.origin}/login` }
    })
  }

  const handleDocumentoLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!documento.trim() || !password) {
      toast({
        title: 'Faltan datos',
        description: 'Ingresa tu número de documento y tu contraseña.',
        variant: 'destructive',
      })
      return
    }
    setEntrando(true)
    try {
      const res = await api.post('/api/auth/login-documento', {
        documento: documento.trim(),
        password,
      })
      // El backend valida las credenciales y devuelve los tokens; aquí solo se
      // instala la sesión, la misma que usa el ingreso con Google.
      const { error } = await supabase.auth.setSession({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
      })
      if (error) throw new Error(error.message)

      if (res.debe_cambiar_password) {
        setVista('cambiar')
      } else {
        toast({ title: `Bienvenido, ${res.persona?.nombre ?? ''}`.trim() })
      }
    } catch (err: any) {
      toast({ title: 'No se pudo ingresar', description: err.message, variant: 'destructive' })
    } finally {
      setEntrando(false)
    }
  }

  const titulo =
    vista === 'cambiar' ? 'Define tu contraseña'
      : vista === 'recuperar' ? 'Recuperar acceso'
        : 'Inicia sesión para acceder a tu cuenta'

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[hsl(220,55%,7%)]">
      {/* Glows decorativos de fondo */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[hsl(213,80%,30%)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[hsl(45,96%,58%)]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[hsl(213,88%,45%)]/5 blur-3xl" />

      {/* Estrellas decorativas sutiles */}
      <Sparkles className="pointer-events-none absolute top-10 right-12 h-4 w-4 text-[hsl(45,96%,58%)]/40 animate-pulse" />
      <Star className="pointer-events-none absolute bottom-16 left-16 h-3 w-3 text-[hsl(45,96%,58%)]/30" />
      <Star className="pointer-events-none absolute top-1/4 left-1/4 h-2 w-2 text-[hsl(45,96%,58%)]/50" />
      <Sparkles className="pointer-events-none absolute bottom-1/4 right-1/4 h-3 w-3 text-[hsl(45,96%,58%)]/30 animate-pulse" />

      {/* Volver a la página de inicio — no se ofrece a mitad del cambio obligatorio */}
      {vista !== 'cambiar' && (
        <Link
          to="/"
          className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[hsl(212,18%,73%)] transition-colors hover:bg-white/5 hover:text-white sm:left-6 sm:top-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      )}

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 py-20">
        <div className="rounded-2xl border border-[hsl(213,40%,28%)]/40 bg-[hsl(218,42%,12%)]/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-[hsl(220,60%,10%)]/40">
          {/* Logo/icono con halo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[hsl(45,96%,58%)]/20 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(213,88%,45%)] to-[hsl(220,60%,14%)] border border-[hsl(45,96%,58%)]/30 shadow-lg shadow-[hsl(220,60%,14%)]/50">
                <Star className="h-10 w-10 text-white" strokeWidth={2.5} fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Marca */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide leading-tight">
              ESTRELLAS DEL <span className="text-[hsl(45,96%,58%)]">MILENIO</span>
            </h1>
            <div className="my-3 flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[hsl(45,60%,45%)]/50" />
              <span className="text-xs uppercase tracking-[0.25em] text-[hsl(45,55%,72%)]">
                Academia Deportiva
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[hsl(45,60%,45%)]/50" />
            </div>
            <p className="text-sm text-[hsl(212,18%,73%)] mt-4">{titulo}</p>
          </div>

          {vista === 'cambiar' ? (
            <CambiarPasswordForm
              passwordActual={password}
              onListo={() => { setVista('ingreso'); setPassword('') }}
            />
          ) : vista === 'recuperar' ? (
            <RecuperarPasswordForm onVolver={() => setVista('ingreso')} />
          ) : (
            <Tabs defaultValue="documento" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[hsl(218,38%,16%)]">
                <TabsTrigger value="documento" className="gap-2 text-xs sm:text-sm">
                  <IdCard className="h-3.5 w-3.5" />
                  Documento
                </TabsTrigger>
                <TabsTrigger value="correo" className="gap-2 text-xs sm:text-sm">
                  <Mail className="h-3.5 w-3.5" />
                  Correo
                </TabsTrigger>
              </TabsList>

              {/* Opción 1: número de documento + contraseña */}
              <TabsContent value="documento" className="pt-6">
                <form onSubmit={handleDocumentoLogin} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="documento" className="text-[hsl(212,20%,82%)]">
                      Número de documento
                    </Label>
                    <Input
                      id="documento"
                      name="username"
                      inputMode="numeric"
                      autoComplete="username"
                      placeholder="1000123456"
                      value={documento}
                      onChange={e => setDocumento(e.target.value)}
                      className={campo}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-[hsl(212,20%,82%)]">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={campo}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={entrando}
                    className="h-12 w-full bg-[hsl(213,88%,45%)] text-white hover:bg-[hsl(213,88%,52%)]"
                  >
                    {entrando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ingresar
                  </Button>
                </form>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVista('recuperar')}
                    className="text-xs text-[hsl(213,88%,60%)] underline-offset-4 hover:underline"
                  >
                    Olvidé mi contraseña
                  </button>
                  <p className="text-center text-xs text-[hsl(212,14%,58%)]">
                    Si es tu primer ingreso, tu contraseña es tu número de documento.
                  </p>
                </div>
              </TabsContent>

              {/* Opción 2: correo electrónico (Google OAuth via Supabase) */}
              <TabsContent value="correo" className="pt-6">
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full h-12 gap-3 bg-white text-gray-900 hover:bg-gray-50 hover:scale-[1.02] font-medium text-sm transition-all duration-200 shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </Button>
                <p className="mt-4 text-center text-xs text-[hsl(212,14%,58%)]">
                  Solo funciona con el correo registrado en el club.
                </p>
              </TabsContent>
            </Tabs>
          )}

          {/* Sello de seguridad */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[hsl(212,14%,58%)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Acceso seguro para personal autorizado</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[hsl(212,14%,45%)] mt-6">
          © {new Date().getFullYear()} Estrellas del Milenio. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}