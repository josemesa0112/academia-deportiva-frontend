import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import api from "@/lib/api";

export default function Matriculas() {
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

  const tableFields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "categoria", label: "Categoría" },
    { key: "fecha_inicio", label: "Fecha inicio", render: (v) => v?.split("T")[0] || "—" },
    { key: "valor", label: "Valor", render: (v) => v ? `$${parseInt(v).toLocaleString()}` : "—" },
    { key: "estado", label: "Estado" },
  ];

  const formFields: FieldDef[] = [
    { key: "id_deportista", label: "Deportista", type: "select", options: opciones.deportistas },
    { key: "id_categoria", label: "Categoría", type: "select", options: opciones.categorias },
    { key: "fecha_inicio", label: "Fecha inicio", type: "date" },
    { key: "valor", label: "Valor", type: "number", placeholder: "150000" },
    { key: "id_estado", label: "Estado", type: "select", options: opciones.estados },
  ];

  return (
    <CrudPage
      title="Matrículas"
      endpoint="/api/matriculas"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
    />
  );
}
