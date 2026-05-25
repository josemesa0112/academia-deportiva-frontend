import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeDollarSign } from "lucide-react";
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

  const tableFields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "numero_documento", label: "Documento" },
    { key: "fecha_inicio", label: "Fecha inicio", render: (v) => v?.split("T")[0] || "—" },
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
    { key: "id_categoria", label: "Categoría", type: "select", options: opciones.categorias },
    { key: "fecha_inicio", label: "Fecha inicio", type: "date" },
    { key: "valor", label: "Valor", type: "number", placeholder: "150000" },
    { key: "id_estado", label: "Estado del registro", type: "select", options: opciones.estados },
  ];

  return (
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
