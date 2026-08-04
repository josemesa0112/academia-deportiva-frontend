import { Button } from "@/components/ui/button";
import { UserX, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

// Se muestra cuando alguien inicia sesión con un correo que no corresponde a
// ninguna persona registrada en el club. Bloquea el acceso por completo.
export default function CuentaNoRegistrada({ correo }: { correo?: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,55%,7%)] p-4">
      <div className="max-w-md w-full rounded-2xl border border-destructive/30 bg-[hsl(218,42%,12%)]/80 backdrop-blur-xl p-10 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/20 border border-destructive/30">
            <UserX className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Correo no registrado
        </h1>
        <p className="text-sm text-[hsl(212,18%,73%)] mb-2">
          Este correo no está registrado en la plataforma.
        </p>
        {correo && (
          <p className="mb-6 break-words rounded-md bg-white/5 px-3 py-2 font-mono text-xs text-[hsl(212,18%,75%)]">
            {correo}
          </p>
        )}
        <p className="text-xs text-[hsl(212,14%,58%)] mb-8">
          Solo pueden ingresar las personas registradas por la academia. Si
          crees que es un error, pide al administrador que verifique tu correo.
        </p>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full gap-2 border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
}