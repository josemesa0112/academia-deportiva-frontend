import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeDollarSign, CalendarPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const meses = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const años = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

const formatFechaPago = (val: any) => {
  if (!val) return "";
  const d = new Date(val);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export default function Mensualidades() {
  const { toast } = useToast();
  const [opciones, setOpciones] = useState({
    deportistas: [],
    estados: [],
  });

  useEffect(() => {
    const cargarOpciones = async () => {
      const [deportistas, estados] = await Promise.all([
        api.get("/api/deportistas"),
        api.get("/api/catalogos/estados"),
      ]);
      setOpciones({
        deportistas: deportistas.map((d: any) => ({
          value: String(d.id),
          label: `${d.nombre} ${d.apellido}`
        })),
        estados: estados.map((e: any) => ({ value: String(e.id), label: e.nombre })),
      });
    };
    cargarOpciones();
  }, []);

  const handlePagar = async (id: string, refresh: () => void) => {
    try {
      await api.post(`/api/mensualidades/${id}/pagar`, {});
      toast({ title: "Pago registrado", description: "La mensualidad fue marcada como pagada." });
      refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "No se pudo registrar el pago", variant: "destructive" });
    }
  };

  const handleGenerarMes = async (refresh: () => void) => {
    try {
      const res: any = await api.post("/api/mensualidades/generar-mes", {});
      toast({
        title: res?.creadas > 0 ? "Mensualidades generadas" : "Sin cambios",
        description: res?.message || "Operación completada",
      });
      refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "No se pudo generar el mes", variant: "destructive" });
    }
  };

  const tableFields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "numero_documento", label: "Documento" },
    { key: "mes", label: "Mes", render: (v) => meses.find(m => m.value === String(v))?.label || v },
    { key: "año", label: "Año" },
    { key: "valor", label: "Valor", render: (v) => v ? `$${parseInt(v).toLocaleString()}` : "—" },
    {
      key: "fecha_pago",
      label: "Pago",
      render: (v) =>
        v ? (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
            Pagada · {formatFechaPago(v)}
          </Badge>
        ) : (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            Pendiente
          </Badge>
        ),
    },
  ];

  const formFields: FieldDef[] = [
    { key: "id_deportista", label: "Deportista", type: "select", options: opciones.deportistas },
    { key: "mes", label: "Mes", type: "select", options: meses },
    { key: "año", label: "Año", type: "select", options: años },
    { key: "valor", label: "Valor", type: "number", placeholder: "150000" },
    { key: "id_estado", label: "Estado del registro", type: "select", options: opciones.estados },
  ];

  return (
    <CrudPage
      title="Mensualidades"
      endpoint="/api/mensualidades"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
      searchFields={["nombre", "apellido", "numero_documento"]}
      searchPlaceholder="Buscar por nombre o número de documento..."
      sortOptions={[
        { key: "nombre", label: "Nombre (A-Z)", type: "string" },
        { key: "año", label: "Año", type: "number" },
        { key: "mes", label: "Mes", type: "number" },
        { key: "fecha_pago", label: "Estado de pago", type: "date" },
      ]}
      groupBy="categoria"
      groupEmptyLabel="Sin categoría"
      headerActions={(refresh) => (
        <Button variant="outline" className="gap-2" onClick={() => handleGenerarMes(refresh)}>
          <CalendarPlus className="h-4 w-4" /> Generar mes
        </Button>
      )}
      rowActions={(row, refresh) =>
        !row.fecha_pago ? (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-500/10"
            onClick={() => handlePagar(String(row.id), refresh)}
          >
            <BadgeDollarSign className="h-4 w-4" /> Pagar
          </Button>
        ) : null
      }
    />
  );
}
