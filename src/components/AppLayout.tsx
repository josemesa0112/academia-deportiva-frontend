import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useRol } from "@/hooks/useRol";
import CuentaInactiva from "@/pages/CuentaInactiva";

export default function AppLayout() {
  const { userRol, loading } = useRol();

  // Si la persona existe en tbd_persona pero está inactiva (id_estado === 2),
  // bloqueamos toda la app y mostramos pantalla con opción de cerrar sesión.
  // Personas inexistentes (userRol === null) no caen aquí — su acceso
  // queda limitado por el sidebar (ya solo verán "Dashboard").
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
            <h1 className="text-lg font-bold text-foreground">Estrellas del Milenio</h1>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
