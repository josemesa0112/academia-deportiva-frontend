import CrudPage, { FieldDef } from "@/components/CrudPage";

const categorias = [
  { value: "Sub-7", label: "Sub-7" },
  { value: "Sub-9", label: "Sub-9" },
  { value: "Sub-11", label: "Sub-11" },
  { value: "Sub-13", label: "Sub-13" },
  { value: "Sub-15", label: "Sub-15" },
  { value: "Sub-17", label: "Sub-17" },
  { value: "Sub-20", label: "Sub-20" },
  { value: "Mayores", label: "Mayores" },
];

const tableFields: FieldDef[] = [
  { key: "persona", label: "Nombre" },
  { key: "documento", label: "Documento" },
  { key: "telefono", label: "Teléfono" },
  { key: "salario", label: "Salario" },
  { key: "categorias", label: "Categorías asignadas" },
  { key: "estado", label: "Estado" },
];

const formFields: FieldDef[] = [
  { key: "persona", label: "Seleccionar persona", type: "select", options: [
    { value: "Carlos Ramírez", label: "Carlos Ramírez" },
    { value: "Andrés López", label: "Andrés López" },
    { value: "María García", label: "María García" },
    { value: "Juan Pérez", label: "Juan Pérez" },
  ]},
  { key: "documento", label: "Documento", placeholder: "1234567890" },
  { key: "telefono", label: "Teléfono", placeholder: "300 123 4567" },
  { key: "salario", label: "Salario", type: "number", placeholder: "1500000" },
  { key: "categorias", label: "Categorías", type: "multiselect", options: categorias },
  { key: "estado", label: "Estado", type: "select", options: [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
  ]},
];

export default function Profesores() {
  return <CrudPage title="Profesores" storageKey="academia_profesores" fields={formFields} tableFields={tableFields} formFields={formFields} />;
}
