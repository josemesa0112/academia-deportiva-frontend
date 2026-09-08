import { useState, useEffect } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import EnlaceDeportista from "@/components/EnlaceDeportista";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { BadgeDollarSign, Undo2, CalendarPlus, CheckCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const formatFechaPago = (val: any) => {
  if (!val) return "";
  const d = new Date(val);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export default function Matriculas() {
  const { toast } = useToast();
  const [opciones, setOpciones] = useState({
    deportistas: [],
    categorias: [],
    estados: [],
  });

  useEffect(() => {
    const cargarOpciones = async () => {
      const [deportistas, categorias, estados] = await Promise.all([
        api.get("/api/deportistas"),
        api.get("/api/catalogos/categorias"),
        api.get("/api/catalogos/estados"),
      ]);
      setOpciones({
        deportistas: deportistas.map((d: any) => ({
          value: String(d.id),
          label: `${d.nombre} ${d.apellido}`
        })),
        categorias: categorias.map((c: any) => ({ value: String(c.id), label: c.nombre })),
        estados: estados.map((e: any) => ({ value: String(e.id), label: e.nombre })),
      });
    };
    cargarOpciones();
  }, []);

  const handlePagar = async (id: string, refresh: () => void) => {
    try {
      await api.post(`/api/matriculas/${id}/pagar`, {});
      toast({ title: "Pago registrado", description: "La matrícula fue marcada como pagada." });
      refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "No se pudo registrar el pago", variant: "destructive" });
    }
  };

  const handleRevertir = async (id: string, refresh: () => void) => {
    try {
      await api.post(`/api/matriculas/${id}/revertir-pago`, {});
      toast({ title: "Pago revertido", description: "La matrícula vuelve a estado pendiente." });
      refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "No se pudo revertir el pago", variant: "destructive" });
    }
  };

  // Acción masiva pendiente de confirmar. Marcar la matrícula de decenas de
  // deportistas nunca debe ocurrir con un solo clic.
  const [confirmacion, setConfirmacion] = useState<
    { visibles: Record<string, any>[]; refresh: () => void; filtrado: boolean } | null
  >(null);
  const [aplicando, setAplicando] = useState(false);

  const añoEnCurso = new Date().getFullYear();

  const aplicarTodasPagadas = async () => {
    if (!confirmacion) return;
    setAplicando(true);
    try {
      const res: any = await api.post("/api/matriculas/marcar-anio", {
        año: añoEnCurso,
        pagada: true,
        // Si hay un filtro activo, la acción se limita a lo que se ve.
        ...(confirmacion.filtrado
          ? { ids_deportistas: confirmacion.visibles.map(r => r.id_deportista) }
          : {}),
      });
      toast({ title: "Matrículas actualizadas", description: res?.message });
      confirmacion.refresh();
      setConfirmacion(null);
    } catch (err: any) {
      toast({
        title: "No se pudo aplicar",
        description: err?.message || "Intenta de nuevo",
        variant: "destructive",
      });
    } finally {
      setAplicando(false);
    }
  };

  const handleGenerarAño = async (refresh: () => void) => {
    try {
      const res: any = await api.post("/api/matriculas/generar-anio", {});
      toast({
        title: res?.creadas > 0 ? "Matrículas generadas" : "Sin cambios",
        description: res?.message || "Operación completada",
      });
      refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "No se pudo generar el año", variant: "destructive" });
    }
  };

  const tableFields: FieldDef[] = [
    // Nombre y apellido llevan al perfil del deportista.
    {
      key: "nombre",
      label: "Nombre",
      render: (v, row) => <EnlaceDeportista id={row.id_deportista}>{v || "—"}</EnlaceDeportista>,
    },
    {
      key: "apellido",
      label: "Apellido",
      render: (v, row) => <EnlaceDeportista id={row.id_deportista}>{v || "—"}</EnlaceDeportista>,
    },
    { key: "numero_documento", label: "Documento" },
    { key: "fecha_inicio", label: "Fecha inicio", render: (v) => v?.split("T")[0] || "—" },
    { key: "valor", label: "Valor", render: (v) => v ? `$${parseInt(v).toLocaleString()}` : "—" },
    {
      key: "fecha_pago",
      label: "Pago",
      render: (v) =>
        v ? (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
            Pagada · {formatFechaPago(v)}
          </Badge>
        ) : (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">
            Pendiente
          </Badge>
        ),
    },
  ];

  const formFields: FieldDef[] = [
    { key: "id_deportista", label: "Deportista", type: "select", options: opciones.deportistas },
    { key: "id_categoria", label: "Categoría", type: "select", options: opciones.categorias },
    { key: "fecha_inicio", label: "Fecha inicio", type: "date" },
    { key: "valor", label: "Valor", type: "number", placeholder: "150000" },
    { key: "id_estado", label: "Estado del registro", type: "select", options: opciones.estados },
  ];

  return (
    <>
    <CrudPage
      title="Matrículas"
      endpoint="/api/matriculas"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
      searchFields={["nombre", "apellido", "numero_documento"]}
      searchPlaceholder="Buscar por nombre o número de documento..."
      sortOptions={[
        { key: "nombre", label: "Nombre (A-Z)", type: "string" },
        { key: "fecha_inicio", label: "Fecha de inicio", type: "date" },
        { key: "fecha_pago", label: "Estado de pago", type: "date" },
      ]}
      groupBy="categoria"
      chipFilter={{ field: "categoria", emptyLabel: "Sin categoría", orderField: "id_categoria" }}
      headerActions={(refresh, { visibles, filtrado }) => (
        <>
          <Button
            variant="outline"
            className="gap-2 border-green-600/30 text-green-400 hover:bg-green-500/10 hover:text-green-400"
            onClick={() => setConfirmacion({ visibles, refresh, filtrado })}
          >
            <CheckCheck className="h-4 w-4" /> Todos pagaron
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleGenerarAño(refresh)}>
            <CalendarPlus className="h-4 w-4" /> Generar matrículas
          </Button>
        </>
      )}
      rowActions={(row, refresh) =>
        !row.fecha_pago ? (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-green-400 hover:text-green-400 hover:bg-green-500/10"
            onClick={() => handlePagar(String(row.id), refresh)}
          >
            <BadgeDollarSign className="h-4 w-4" /> Pagar
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-amber-400 hover:text-amber-400 hover:bg-amber-500/10"
            onClick={() => handleRevertir(String(row.id), refresh)}
          >
            <Undo2 className="h-4 w-4" /> Revertir
          </Button>
        )
      }
    />

    <AlertDialog open={confirmacion !== null} onOpenChange={o => !o && setConfirmacion(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Marcar todas las matrículas como pagadas?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm">
              <p>
                Se registrará el pago de la matrícula <strong>{añoEnCurso}</strong>
                {confirmacion?.filtrado
                  ? <> a los <strong>{confirmacion.visibles.length}</strong> que tienes filtrados en pantalla.</>
                  : <> a <strong>todos los deportistas activos</strong>. Los que aún no tengan matrícula de este año se crearán en el momento.</>}
              </p>
              {confirmacion?.filtrado && (
                <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-400">
                  Al haber un filtro activo, solo se afecta a esos {confirmacion.visibles.length} registros.
                </p>
              )}
              <p className="text-muted-foreground">
                Las que ya estaban pagadas conservan su fecha original.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={aplicando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); aplicarTodasPagadas(); }}
            disabled={aplicando}
          >
            {aplicando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sí, marcar todas
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
