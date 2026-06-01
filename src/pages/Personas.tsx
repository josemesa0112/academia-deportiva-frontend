import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

// ID del rol Proveedor — usado para decidir si se permite marcar como empresa.
const ROL_PROVEEDOR = "4";

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

  // Helpers de visibilidad: usados por showIf en cada campo
  const esEmpresa = (form: Record<string, string>) =>
    form.id_rol === ROL_PROVEEDOR && form.es_empresa === "true";

  const tableFields: FieldDef[] = [
    {
      key: "tipo",
      label: "Tipo",
      render: (_v, row: any) =>
        row.es_empresa ? (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Empresa</Badge>
        ) : (
          <Badge variant="outline">Persona</Badge>
        ),
    },
    { key: "nombre", label: "Nombre / Razón social" },
    { key: "apellido", label: "Apellido", render: (v) => v || "—" },
    { key: "numero_documento", label: "Documento" },
    { key: "correo", label: "Correo" },
    { key: "numero_telefono", label: "Teléfono", render: (v) => v || "—" },
    { key: "tipo_documento", label: "Tipo doc" },
    { key: "nombre_rol", label: "Rol" },
    { key: "estado", label: "Estado" },
  ];

  const formFields: FieldDef[] = [
    { key: "id_rol", label: "Rol", type: "select", options: opciones.roles },
    // El toggle "Es empresa" solo aparece cuando el rol seleccionado es Proveedor
    {
      key: "es_empresa",
      label: "Es empresa (persona jurídica)",
      type: "switch",
      showIf: (form) => form.id_rol === ROL_PROVEEDOR,
    },
    {
      key: "nombre",
      label: "Nombre / Razón social",
      placeholder: "Ej: Carlos · o · Distribuidora El Pase S.A.S.",
    },
    {
      key: "apellido",
      label: "Apellido",
      placeholder: "Ej: Ramírez",
      showIf: (form) => !esEmpresa(form),
    },
    {
      key: "fecha_nacimiento",
      label: "Fecha de nacimiento",
      type: "date",
      showIf: (form) => !esEmpresa(form),
    },
    { key: "correo", label: "Correo", type: "email", placeholder: "correo@ejemplo.com" },
    { key: "numero_telefono", label: "Teléfono", placeholder: "300 123 4567" },
    {
      key: "id_genero",
      label: "Género",
      type: "select",
      options: opciones.generos,
      showIf: (form) => !esEmpresa(form),
    },
    { key: "id_tipo_documento", label: "Tipo documento", type: "select", options: opciones.tiposDocumento },
    { key: "numero_documento", label: "Número documento / NIT", placeholder: "1234567890" },
    { key: "id_estado", label: "Estado", type: "select", options: opciones.estados },
  ];

  return (
    <CrudPage
      title="Personas"
      endpoint="/api/personas"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
      searchFields={["nombre", "apellido", "numero_documento"]}
      searchPlaceholder="Buscar por nombre o número de documento..."
      sortOptions={[
        { key: "nombre", label: "Nombre (A-Z)", type: "string" },
        { key: "apellido", label: "Apellido (A-Z)", type: "string" },
        { key: "nombre_rol", label: "Rol (A-Z)", type: "string" },
        { key: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date" },
      ]}
    />
  );
}
