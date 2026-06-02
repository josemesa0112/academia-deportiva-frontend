import { Navigate } from "react-router-dom";
import { useRol } from "@/hooks/useRol";

// Atajo para que el deportista logueado vea su propio perfil sin tener
// que conocer su id. Solo redirige a /deportistas/:idPropio.
export default function MiPerfil() {
  const { userRol, loading } = useRol();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (userRol?.id_rol !== 3 || !userRol.deportista_info?.id) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 text-sm text-amber-700 dark:text-amber-500">
        Esta sección es solo para deportistas activos. Si crees que ves este
        mensaje por error, contacta al administrador para que verifique tu
        cuenta.
      </div>
    );
  }

  return <Navigate to={`/deportistas/${userRol.deportista_info.id}`} replace />;
}
