import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import api from "@/lib/api";

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
    { key: "estado", label: "Estado" },
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
    />
  );
}
