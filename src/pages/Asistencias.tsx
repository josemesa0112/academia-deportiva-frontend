import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import { Check, X } from "lucide-react";
import api from "@/lib/api";

export default function Asistencias() {
  const [opciones, setOpciones] = useState({
    entrenamientos: [],
    deportistas: [],
    estados: [],
  });

  useEffect(() => {
    const cargarOpciones = async () => {
      const [entrenamientos, deportistas, estados] = await Promise.all([
        api.get("/api/entrenamientos"),
        api.get("/api/deportistas"),
        api.get("/api/catalogos/estados"),
      ]);
      setOpciones({
        entrenamientos: entrenamientos.map((e: any) => ({
          value: String(e.id),
          label: `${e.categoria} - ${e.fecha?.split("T")[0]} ${e.hora_inicio}`
        })),
        deportistas: deportistas.map((d: any) => ({
          value: String(d.id),
          label: `${d.nombre} ${d.apellido}`
        })),
        estados: estados.map((e: any) => ({ value: String(e.id), label: e.nombre })),
      });
    };
    cargarOpciones();
  }, []);

  const tableFields: FieldDef[] = [
    { key: "nombre", label: "Deportista" },
    { key: "apellido", label: "Apellido" },
    { key: "fecha", label: "Fecha", render: (v) => v?.split("T")[0] || "—" },
    { key: "hora_inicio", label: "Hora inicio" },
    { key: "cancha", label: "Cancha" },
    { key: "estado", label: "Asistencia", render: (v) => v === "Activo"
      ? <span className="flex items-center gap-1 text-green-600"><Check className="h-4 w-4" /> Presente</span>
      : <span className="flex items-center gap-1 text-red-500"><X className="h-4 w-4" /> Ausente</span>
    },
  ];

  const formFields: FieldDef[] = [
    { key: "id_entrenamiento", label: "Entrenamiento", type: "select", options: opciones.entrenamientos },
    { key: "id_deportista", label: "Deportista", type: "select", options: opciones.deportistas },
    { key: "id_estado", label: "Asistencia", type: "select", options: opciones.estados },
  ];

  return (
    <CrudPage
      title="Asistencias"
      endpoint="/api/asistencias"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
    />
  );
}
