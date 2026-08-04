import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useRol } from "@/hooks/useRol";
import CuentaInactiva from "@/pages/CuentaInactiva";
import CuentaNoRegistrada from "@/pages/CuentaNoRegistrada";

export default function AppLayout() {
  const { userRol, loading, estado } = useRol();
  const [correoSesion, setCorreoSesion] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCorreoSesion(session?.user?.email ?? undefined);
    });
  }, []);

  // El correo de la sesión no corresponde a ninguna persona del club: se
  // rechaza el ingreso. Un fallo de red da estado 'error', no 'no-registrado',
  // para no expulsar a nadie si el backend se cae un momento.
  if (!loading && estado === "no-registrado") {
    return <CuentaNoRegistrada correo={correoSesion} />;
  }

  // Si la persona existe en tbd_persona pero está inactiva (id_estado === 2),
  // bloqueamos toda la app y mostramos pantalla con opción de cerrar sesión.
  if (!loading && userRol && userRol.id_estado !== 1) {
    return <CuentaInactiva />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-card px-4 sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-bold text-title">Estrellas del Milenio</h1>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
