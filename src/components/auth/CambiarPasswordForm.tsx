import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const campo =
  "h-11 border-[hsl(213,40%,28%)]/40 bg-[hsl(218,38%,16%)] text-white placeholder:text-[hsl(212,14%,45%)]";

/**
 * Cambio de contraseña del usuario autenticado. Se muestra obligatoriamente
 * tras el primer ingreso, cuando la contraseña sigue siendo el documento.
 */
export default function CambiarPasswordForm({
  passwordActual,
  onListo,
}: {
  /** Contraseña con la que acaba de entrar; se precarga para no pedirla dos veces. */
  passwordActual?: string;
  onListo: () => void;
}) {
  const { toast } = useToast();
  const [actual, setActual] = useState(passwordActual ?? "");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nueva !== confirmar) {
      toast({ title: "No coinciden", description: "Las dos contraseñas nuevas deben ser iguales.", variant: "destructive" });
      return;
    }
    if (nueva.length < 6) {
      toast({ title: "Muy corta", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setEnviando(true);
    try {
      await api.post("/api/auth/cambiar-password", {
        password_actual: actual,
        password_nueva: nueva,
      });
      toast({ title: "Listo", description: "Tu contraseña quedó actualizada." });
      onListo();
    } catch (err: any) {
      toast({ title: "No se pudo cambiar", description: err.message, variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-[hsl(45,96%,58%)]/30 bg-[hsl(45,96%,58%)]/10 p-3">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(45,96%,58%)]" />
        <p className="text-xs leading-relaxed text-[hsl(212,20%,82%)]">
          Estás usando tu número de documento como contraseña. Define una propia
          para continuar.
        </p>
      </div>

      <form onSubmit={enviar} className="grid gap-4">
        {!passwordActual && (
          <div className="grid gap-2">
            <Label htmlFor="actual" className="text-[hsl(212,20%,82%)]">Contraseña actual</Label>
            <Input
              id="actual" type="password" autoComplete="current-password"
              value={actual} onChange={(e) => setActual(e.target.value)} className={campo}
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="nueva" className="text-[hsl(212,20%,82%)]">Nueva contraseña</Label>
          <Input
            id="nueva" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres"
            value={nueva} onChange={(e) => setNueva(e.target.value)} className={campo}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmar" className="text-[hsl(212,20%,82%)]">Repetir nueva contraseña</Label>
          <Input
            id="confirmar" type="password" autoComplete="new-password"
            value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className={campo}
          />
        </div>
        <Button type="submit" disabled={enviando} className="h-12 w-full bg-[hsl(213,88%,45%)] text-white hover:bg-[hsl(213,88%,52%)]">
          {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar contraseña
        </Button>
      </form>
    </div>
  );
}