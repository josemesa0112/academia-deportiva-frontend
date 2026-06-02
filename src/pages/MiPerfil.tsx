import { Navigate } from "react-router-dom";
import { useRol } from "@/hooks/useRol";

// Atajo para que el usuario logueado vea su propio perfil sin tener que
// conocer su id. Redirige según el rol:
//   - Profesor (rol 2)  → /profesores/:id
//   - Deportista (rol 3) → /deportistas/:id
//   - Otros roles → mensaje informativo.
export default function MiPerfil() {
  const { userRol, loading } = useRol();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (userRol?.id_rol === 2 && userRol.profesor_info?.id) {
    return <Navigate to={`/profesores/${userRol.profesor_info.id}`} replace />;
  }

  if (userRol?.id_rol === 3 && userRol.deportista_info?.id) {
    return <Navigate to={`/deportistas/${userRol.deportista_info.id}`} replace />;
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 text-sm text-amber-700 dark:text-amber-500">
      Esta sección es para profesores y deportistas activos. Si crees que ves
      este mensaje por error, contacta al administrador para que verifique tu
      cuenta.
    </div>
  );
}
