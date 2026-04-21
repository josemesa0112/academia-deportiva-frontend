import CrudPage, { FieldDef } from "@/components/CrudPage";

const tableFields: FieldDef[] = [
  { key: "nombreCompleto", label: "Nombre completo", render: (_v, row) => `${row.nombre || ""} ${row.apellido || ""}`.trim() || "—" },
  { key: "numDocumento", label: "Documento" },
  { key: "tipoDocumento", label: "Tipo documento" },
  { key: "telefono", label: "Teléfono" },
  { key: "correo", label: "Correo" },
  { key: "rol", label: "Rol" },
  { key: "estado", label: "Estado" },
];

const formFields: FieldDef[] = [
  { key: "nombre", label: "Nombre", placeholder: "Ej: Carlos" },
  { key: "apellido", label: "Apellido", placeholder: "Ej: Ramírez" },
  { key: "fechaNacimiento", label: "Fecha de nacimiento", type: "date" },
  { key: "correo", label: "Correo", type: "email", placeholder: "correo@ejemplo.com" },
  { key: "telefono", label: "Teléfono", placeholder: "300 123 4567" },
  { key: "genero", label: "Género", type: "select", options: [
    { value: "Masculino", label: "Masculino" },
    { value: "Femenino", label: "Femenino" },
    { value: "Otro", label: "Otro" },
  ]},
  { key: "tipoDocumento", label: "Tipo documento", type: "select", options: [
    { value: "CC", label: "Cédula de Ciudadanía" },
    { value: "TI", label: "Tarjeta de Identidad" },
    { value: "CE", label: "Cédula de Extranjería" },
    { value: "Pasaporte", label: "Pasaporte" },
  ]},
  { key: "numDocumento", label: "Número documento", placeholder: "1234567890" },
  { key: "rol", label: "Rol", type: "select", options: [
    { value: "Deportista", label: "Deportista" },
    { value: "Profesor", label: "Profesor" },
    { value: "Proveedor", label: "Proveedor" },
    { value: "Administrativo", label: "Administrativo" },
    { value: "Acudiente", label: "Acudiente" },
  ]},
  { key: "estado", label: "Estado", type: "select", options: [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
  ]},
];

export default function Personas() {
  return <CrudPage title="Personas" storageKey="academia_personas" fields={formFields} tableFields={tableFields} formFields={formFields} />;
}
