import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import api from "@/lib/api";

export default function Personas() {
  const [opciones, setOpciones] = useState({
    roles: [],
    generos: [],
    tiposDocumento: [],
    estados: [],
  });

  useEffect(() => {
    const cargarOpciones = async () => {
      const [roles, generos, tiposDocumento, estados] = await Promise.all([
        api.get("/api/catalogos/roles"),
        api.get("/api/catalogos/generos"),
        api.get("/api/catalogos/tipos-documento"),
        api.get("/api/catalogos/estados"),
      ]);
      setOpciones({
        roles: roles.map((r: any) => ({ value: String(r.id), label: r.nombre_rol })),
        generos: generos.map((g: any) => ({ value: String(g.id), label: g.nombre_genero })),
        tiposDocumento: tiposDocumento.map((t: any) => ({ value: String(t.id), label: t.nombre })),
        estados: estados.map((e: any) => ({ value: String(e.id), label: e.nombre })),
      });
    };
    cargarOpciones();
  }, []);

  const tableFields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "numero_documento", label: "Documento" },
    { key: "correo", label: "Correo" },
    { key: "numero_telefono", label: "Teléfono" },
    { key: "tipo_documento", label: "Tipo Doc" },
    { key: "nombre_rol", label: "Rol" },
    { key: "estado", label: "Estado" },
  ];

  const formFields: FieldDef[] = [
    { key: "nombre", label: "Nombre", placeholder: "Ej: Carlos" },
    { key: "apellido", label: "Apellido", placeholder: "Ej: Ramírez" },
    { key: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date" },
    { key: "correo", label: "Correo", type: "email", placeholder: "correo@ejemplo.com" },
    { key: "numero_telefono", label: "Teléfono", placeholder: "300 123 4567" },
    { key: "numero_documento", label: "Número documento", placeholder: "1234567890" },
    { key: "id_genero", label: "Género", type: "select", options: opciones.generos },
    { key: "id_tipo_documento", label: "Tipo documento", type: "select", options: opciones.tiposDocumento },
    { key: "id_rol", label: "Rol", type: "select", options: opciones.roles },
    { key: "id_estado", label: "Estado", type: "select", options: opciones.estados },
  ];

  return (
    <CrudPage
      title="Personas"
      endpoint="/api/personas"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
    />
  );
}
