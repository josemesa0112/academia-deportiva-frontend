import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import api from "@/lib/api";

export default function Canchas() {
  const [opciones, setOpciones] = useState({ estados: [] });

  useEffect(() => {
    const cargarOpciones = async () => {
      const estados = await api.get("/api/catalogos/estados");
      setOpciones({
        estados: estados.map((e: any) => ({ value: String(e.id), label: e.nombre })),
      });
    };
    cargarOpciones();
  }, []);

  const tableFields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "barrio", label: "Barrio" },
    { key: "direccion", label: "Dirección" },
    { key: "estado", label: "Estado" },
  ];

  const formFields: FieldDef[] = [
    { key: "nombre", label: "Nombre", placeholder: "Ej: Cancha El Campín" },
    { key: "barrio", label: "Barrio", placeholder: "Ej: Centro" },
    { key: "direccion", label: "Dirección", placeholder: "Cra 10 # 20-30" },
    { key: "id_estado", label: "Estado", type: "select", options: opciones.estados },
  ];

  return (
    <CrudPage
      title="Canchas"
      endpoint="/api/canchas"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
    />
  );
}