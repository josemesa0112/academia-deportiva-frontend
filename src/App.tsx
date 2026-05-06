import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Personas from "@/pages/Personas";
import Profesores from "@/pages/Profesores";
import Deportistas from "@/pages/Deportistas";
import Proveedores from "@/pages/Proveedores";
import Productos from "@/pages/Productos";
import Compras from "@/pages/Compras";
import Canchas from "@/pages/Canchas";
import Entrenamientos from "@/pages/Entrenamientos";
import Asistencias from "@/pages/Asistencias";
import Matriculas from "@/pages/Matriculas";
import Mensualidades from "@/pages/Mensualidades";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, session }: { children: React.ReactNode, session: any }) {
  if (session === undefined) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="text-white text-sm">Cargando...</div>
    </div>
  )
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

const App = () => {
  const [session, setSession] = useState<any>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              session ? <Navigate to="/" replace /> : <Login />
            } />
            <Route element={
              <ProtectedRoute session={session}>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/personas" element={<Personas />} />
              <Route path="/profesores" element={<Profesores />} />
              <Route path="/deportistas" element={<Deportistas />} />
              <Route path="/proveedores" element={<Proveedores />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/compras" element={<Compras />} />
              <Route path="/canchas" element={<Canchas />} />
              <Route path="/entrenamientos" element={<Entrenamientos />} />
              <Route path="/asistencias" element={<Asistencias />} />
              <Route path="/matriculas" element={<Matriculas />} />
              <Route path="/mensualidades" element={<Mensualidades />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App;
