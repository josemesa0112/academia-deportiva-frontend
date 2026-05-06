import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function Login() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://academia-deportiva-frontend-b8dj.vercel.app'
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-10 w-full max-w-md text-center">
        <div className="text-4xl mb-4">🏟️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Academia Deportiva</h1>
        <p className="text-sm text-gray-400 mb-8">Inicia sesión para continuar</p>
        <Button
          onClick={handleGoogleLogin}
          className="w-full gap-3 bg-white text-black hover:bg-gray-100 font-medium"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
          Continuar con Google
        </Button>
      </div>
    </div>
  )
}