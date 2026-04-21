import CrudPage, { FieldDef } from "@/components/CrudPage";

const tableFields: FieldDef[] = [
  { key: "persona", label: "Nombre proveedor" },
  { key: "documento", label: "Documento" },
  { key: "telefono", label: "Teléfono" },
  { key: "estado", label: "Estado" },
];

const formFields: FieldDef[] = [
  { key: "persona", label: "Seleccionar persona", type: "select", options: [
    { value: "Distribuciones ABC", label: "Distribuciones ABC" },
    { value: "Deportes del Sur", label: "Deportes del Sur" },
    { value: "Textiles Pro", label: "Textiles Pro" },
    { value: "Implementos JR", label: "Implementos JR" },
  ]},
  { key: "documento", label: "Documento", placeholder: "NIT o CC" },
  { key: "telefono", label: "Teléfono", placeholder: "300 123 4567" },
  { key: "estado", label: "Estado", type: "select", options: [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
  ]},
];

export default function Proveedores() {
  return <CrudPage title="Proveedores" storageKey="academia_proveedores" fields={formFields} tableFields={tableFields} formFields={formFields} />;
}
