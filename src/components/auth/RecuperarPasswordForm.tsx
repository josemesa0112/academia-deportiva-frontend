import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const campo =
  "h-11 border-[hsl(213,40%,28%)]/40 bg-[hsl(218,38%,16%)] text-white placeholder:text-[hsl(212,14%,45%)]";

type Paso = "documento" | "codigo";

/**
 * Restablecimiento en dos pasos: se pide el documento, el servidor envía un
 * código de verificación, y con ese código se define la nueva contraseña.
 */
export default function RecuperarPasswordForm({ onVolver }: { onVolver: () => void }) {
  const { toast } = useToast();
  const [paso, setPaso] = useState<Paso>("documento");
  const [documento, setDocumento] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const solicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento.trim()) {
      toast({ title: "Falta el documento", description: "Ingresa tu número de documento.", variant: "destructive" });
      return;
    }
    setEnviando(true);
    try {
      const res = await api.post("/api/auth/recuperar/solicitar", { documento: documento.trim() });
      setAviso(
        res?.canal === "consola"
          ? "El código se generó y quedó registrado en el servidor. Aún no hay canal de envío configurado — pídeselo al administrador."
          : res?.destino
            ? `Enviamos un código a ${res.destino}.`
            : res?.mensaje || "Si el documento está registrado, enviamos un código."
      );
      setPaso("codigo");
    } catch (err: any) {
      toast({ title: "No se pudo solicitar", description: err.message, variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  const restablecer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nueva !== confirmar) {
      toast({ title: "No coinciden", description: "Las dos contraseñas deben ser iguales.", variant: "destructive" });
      return;
    }
    setEnviando(true);
    try {
      await api.post("/api/auth/recuperar/verificar", {
        documento: documento.trim(),
        codigo: codigo.trim(),
        password_nueva: nueva,
      });
      toast({ title: "Contraseña restablecida", description: "Ya puedes iniciar sesión con tu nueva contraseña." });
      onVolver();
    } catch (err: any) {
      toast({ title: "No se pudo restablecer", description: err.message, variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={paso === "codigo" ? () => setPaso("documento") : onVolver}
        className="mb-5 inline-flex items-center gap-2 text-xs text-[hsl(212,18%,73%)] transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {paso === "codigo" ? "Cambiar el documento" : "Volver al ingreso"}
      </button>

      {paso === "documento" ? (
        <form onSubmit={solicitar} className="grid gap-4">
          <p className="text-xs leading-relaxed text-[hsl(212,18%,73%)]">
            Ingresa tu número de documento y te enviaremos un código de
            verificación para definir una contraseña nueva.
          </p>
          <div className="grid gap-2">
            <Label htmlFor="doc-rec" className="text-[hsl(212,20%,82%)]">Número de documento</Label>
            <Input
              id="doc-rec" inputMode="numeric" placeholder="1000123456"
              value={documento} onChange={(e) => setDocumento(e.target.value)} className={campo}
            />
          </div>
          <Button type="submit" disabled={enviando} className="h-12 w-full bg-[hsl(213,88%,45%)] text-white hover:bg-[hsl(213,88%,52%)]">
            {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar código
          </Button>
        </form>
      ) : (
        <form onSubmit={restablecer} className="grid gap-4">
          {aviso && (
            <div className="flex items-start gap-3 rounded-lg border border-[hsl(213,88%,52%)]/30 bg-[hsl(213,88%,52%)]/10 p-3">
              <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(213,88%,60%)]" />
              <p className="text-xs leading-relaxed text-[hsl(212,20%,82%)]">{aviso}</p>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="codigo" className="text-[hsl(212,20%,82%)]">Código de verificación</Label>
            <Input
              id="codigo" inputMode="numeric" maxLength={6} placeholder="6 dígitos"
              value={codigo} onChange={(e) => setCodigo(e.target.value)}
              className={`${campo} tracking-[0.4em]`}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nueva-rec" className="text-[hsl(212,20%,82%)]">Nueva contraseña</Label>
            <Input
              id="nueva-rec" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres"
              value={nueva} onChange={(e) => setNueva(e.target.value)} className={campo}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmar-rec" className="text-[hsl(212,20%,82%)]">Repetir contraseña</Label>
            <Input
              id="confirmar-rec" type="password" autoComplete="new-password"
              value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className={campo}
            />
          </div>
          <Button type="submit" disabled={enviando} className="h-12 w-full bg-[hsl(213,88%,45%)] text-white hover:bg-[hsl(213,88%,52%)]">
            {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Restablecer contraseña
          </Button>
        </form>
      )}
    </div>
  );
}