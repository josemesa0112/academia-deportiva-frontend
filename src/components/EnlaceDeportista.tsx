import { Link } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * Acceso directo al perfil de un deportista desde cualquier listado.
 *
 * Si el registro no trae id_deportista (por ejemplo una fila huérfana),
 * degrada a texto plano en vez de generar un enlace roto.
 */
export default function EnlaceDeportista({
  id,
  children,
  className = "",
}: {
  id: number | string | null | undefined;
  children: ReactNode;
  className?: string;
}) {
  const idValido = id !== null && id !== undefined && String(id).trim() !== "";
  if (!idValido) return <>{children}</>;

  return (
    <Link
      to={`/deportistas/${id}`}
      title="Ver perfil del deportista"
      className={[
        // Subrayado punteado permanente: indica que es clicable sin llenar
        // la tabla de color. Al pasar el mouse pasa al amarillo de marca.
        "underline decoration-dotted decoration-muted-foreground/40 underline-offset-4",
        "transition-colors hover:text-title hover:decoration-title",
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}