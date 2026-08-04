import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

// Pantalla que se muestra cuando el usuario logueado existe en tbd_persona
// pero tiene id_estado = 2 (Inactivo). Le impide usar la app.
export default function CuentaInactiva() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,55%,7%)] p-4">
      <div className="max-w-md w-full rounded-2xl border border-amber-500/30 bg-[hsl(218,42%,12%)]/80 backdrop-blur-xl p-10 text-center shadow-2xl shadow-[hsl(38,80%,22%)]/30">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30">
            <ShieldAlert className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Cuenta inactiva
        </h1>
        <p className="text-sm text-[hsl(212,18%,73%)] mb-6">
          Tu cuenta está marcada como inactiva en el sistema. No puedes acceder a
          ninguna sección hasta que el administrador la reactive.
        </p>
        <p className="text-xs text-[hsl(212,14%,58%)] mb-8">
          Si crees que esto es un error, contacta al administrador de la academia.
        </p>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full gap-2 border-amber-500/30 hover:bg-amber-500/10"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
