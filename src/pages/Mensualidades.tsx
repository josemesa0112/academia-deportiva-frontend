import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import GrillaMensualidades from "@/components/GrillaMensualidades";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, LayoutGrid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BadgeDollarSign, CalendarPlus, Undo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRol } from "@/hooks/useRol";
import { exportToExcel } from "@/lib/exportExcel"; // La función que creaste en el paso 1
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
  const { userRol } = useRol();

  // Defensa: un deportista que llegue por URL directa a /mensualidades se
  // redirige a su perfil, donde tiene su propio historial de pagos.
  if (userRol?.id_rol === 3) {
    return <Navigate to="/mi-perfil" replace />;
  }

  const [opciones, setOpciones] = useState({
    deportistas: [],
    estados: [],
  });

  // Título dinámico: refleja el mes y año del periodo que se muestra.
  const ahora = new Date();
  const mesActualLabel = meses[ahora.getMonth()].label;
  const añoActual = ahora.getFullYear();
  const tituloPagina = `Mensualidades · ${mesActualLabel} ${añoActual}`;

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

  const handleRevertir = async (id: string, refresh: () => void) => {
    try {
      await api.post(`/api/mensualidades/${id}/revertir-pago`, {});
      toast({ title: "Pago revertido", description: "La mensualidad vuelve a estado pendiente." });
      refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "No se pudo revertir el pago", variant: "destructive" });
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

  // Mes y año no se muestran como columnas porque toda la tabla refleja
  // un único periodo (el del título). El historial completo de cada
  // deportista vive en su perfil.
  const tableFields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "numero_documento", label: "Documento" },
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
    { key: "mes", label: "Mes", type: "select", options: meses },
    { key: "año", label: "Año", type: "select", options: años },
    { key: "valor", label: "Valor", type: "number", placeholder: "150000" },
    { key: "id_estado", label: "Estado del registro", type: "select", options: opciones.estados },
  ];

  const handleExportarMensualidades = async () => {
  try {
    // A. Pedir los datos al endpoint correspondiente
    const mensualidades = await api.get("/api/mensualidades"); 

    // B. Mapear los campos de la API a nombres bonitos para la tabla de Excel
    const datosFormateados = mensualidades.map((m: any) => ({
      "Nombre": m.nombre || "—",
      "Apellido": m.apellido || "—",
      "Documento": m.numero_documento || "—",
      "Valor": m.valor ? `$${parseInt(m.valor).toLocaleString()}` : "—",
      "Pago": m.fecha_pago 
        ? `Pagada · ${formatFechaPago(m.fecha_pago)}` 
        : "Pendiente",
    }));

    // C. Disparar la descarga
    exportToExcel({
      data: datosFormateados,
      fileName: "Reporte_Mensualidades",
      sheetName: "Mensualidades"
    });
  } catch (error) {
    console.error("Error al exportar:", error);
  }
};

  const vistaLista = (
    <CrudPage
      title={tituloPagina}
      endpoint="/api/mensualidades"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
      searchFields={["nombre", "apellido", "numero_documento"]}
      searchPlaceholder="Buscar por nombre o número de documento..."
      sortOptions={[
        { key: "nombre", label: "Nombre (A-Z)", type: "string" },
        { key: "fecha_pago", label: "Estado de pago", type: "date" },
      ]}
      groupBy="categoria"
      groupEmptyLabel="Sin categoría"
      headerActions={(refresh) => (
        <>
          {/* Botón de Exportar a Excel */}
          <Button
            variant="outline"
            className="gap-2 border-green-600/30 text-green-400 hover:bg-green-500/10 hover:text-green-400"
            onClick={handleExportarMensualidades}
          >
            <Download className="h-4 w-4" /> Exportar Excel
          </Button>
          {/* Botón existente de Generar mes */}
          <Button variant="outline" className="gap-2" onClick={() => handleGenerarMes(refresh)}>
            <CalendarPlus className="h-4 w-4" /> Generar mes
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
  );

  return (
    <Tabs defaultValue="grilla" className="w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-title">Mensualidades</h2>
        <TabsList>
          <TabsTrigger value="grilla" className="gap-2">
            <LayoutGrid className="h-4 w-4" /> Grilla anual
          </TabsTrigger>
          <TabsTrigger value="lista" className="gap-2">
            <List className="h-4 w-4" /> Mes actual
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="grilla">
        <GrillaMensualidades />
      </TabsContent>

      {/* La vista de lista conserva crear, editar, exportar y generar mes. */}
      <TabsContent value="lista">{vistaLista}</TabsContent>
    </Tabs>
  );
}
