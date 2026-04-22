import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import api from "@/lib/api";

export default function Profesores() {
  const [opciones, setOpciones] = useState({
    personas: [],
    estados: [],
  });

  useEffect(() => {
    const cargarOpciones = async () => {
      const [personas, estados] = await Promise.all([
        api.get("/api/personas"),
        api.get("/api/catalogos/estados"),
      ]);
      setOpciones({
        personas: personas
          .filter((p: any) => p.id_rol === 2)
          .map((p: any) => ({ value: String(p.id), label: `${p.nombre} ${p.apellido}` })),
        estados: estados.map((e: any) => ({ value: String(e.id), label: e.nombre })),
      });
    };
    cargarOpciones();
  }, []);

  const tableFields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "numero_documento", label: "Documento" },
    { key: "numero_telefono", label: "Teléfono" },
    { key: "salario", label: "Salario" },
    { key: "estado", label: "Estado" },
  ];

  const formFields: FieldDef[] = [
    { key: "id_persona", label: "Persona", type: "select", options: opciones.personas },
    { key: "salario", label: "Salario", type: "number", placeholder: "1500000" },
    { key: "id_estado", label: "Estado", type: "select", options: opciones.estados },
  ];

  return (
    <CrudPage
      title="Profesores"
      endpoint="/api/profesores"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
    />
  );
}
