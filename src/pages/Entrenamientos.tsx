import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

// Función que determina el estado visual del entrenamiento según la fecha
const getEstadoEntrenamiento = (fecha: string, horaFin: string) => {
  if (!fecha) return null
  const fechaEntrenamiento = new Date(`${fecha.split("T")[0]}T${horaFin || "23:59"}`)
  const ahora = new Date()
  if (fechaEntrenamiento < ahora) {
    return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">Finalizado</Badge>
  }
  const diffMs = fechaEntrenamiento.getTime() - ahora.getTime()
  const diffHoras = diffMs / (1000 * 60 * 60)
  if (diffHoras <= 2) {
    return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">En curso</Badge>
  }
  return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Programado</Badge>
}

export default function Entrenamientos() {
  const [opciones, setOpciones] = useState({
    canchas: [],
    categorias: [],
    estados: [],
  });

  useEffect(() => {
    const cargarOpciones = async () => {
      const [canchas, categorias, estados] = await Promise.all([
        api.get("/api/canchas"),
        api.get("/api/catalogos/categorias"),
        api.get("/api/catalogos/estados"),
      ]);
      setOpciones({
        canchas: canchas.map((c: any) => ({ value: String(c.id), label: c.nombre })),
        categorias: categorias.map((c: any) => ({ value: String(c.id), label: c.nombre })),
        estados: estados.map((e: any) => ({ value: String(e.id), label: e.nombre })),
      });
    };
    cargarOpciones();
  }, []);

  const tableFields: FieldDef[] = [
    { key: "fecha", label: "Fecha", render: (v) => v?.split("T")[0] || "—" },
    { key: "hora_inicio", label: "Hora inicio" },
    { key: "hora_fin", label: "Hora fin" },
    { key: "cancha", label: "Cancha" },
    { key: "categoria", label: "Categoría" },
    {
      key: "estado_visual",
      label: "Estado",
      render: (_v, row) => getEstadoEntrenamiento(row.fecha, row.hora_fin) || <span className="text-muted-foreground">—</span>
    },
  ];

  const formFields: FieldDef[] = [
    { key: "id_cancha", label: "Cancha", type: "select", options: opciones.canchas },
    { key: "id_categoria", label: "Categoría", type: "select", options: opciones.categorias },
    { key: "fecha", label: "Fecha", type: "date" },
    { key: "hora_inicio", label: "Hora inicio", type: "time" },
    { key: "hora_fin", label: "Hora fin", type: "time" },
    { key: "id_estado", label: "Estado", type: "select", options: opciones.estados },
  ];

  return (
    <CrudPage
      title="Entrenamientos"
      endpoint="/api/entrenamientos"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
      searchFields={["categoria", "cancha"]}
      searchPlaceholder="Buscar por categoría o cancha..."
      sortOptions={[
        { key: "fecha", label: "Fecha (próximas primero)", type: "date" },
        { key: "categoria", label: "Categoría (A-Z)", type: "string" },
        { key: "cancha", label: "Cancha (A-Z)", type: "string" },
      ]}
    />
  );
}
