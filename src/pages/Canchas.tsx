import CrudPage, { FieldDef } from "@/components/CrudPage";

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
  { key: "estado", label: "Estado", type: "select", options: [
    { value: "Disponible", label: "Disponible" },
    { value: "En mantenimiento", label: "En mantenimiento" },
    { value: "Ocupada", label: "Ocupada" },
  ]},
];

export default function Canchas() {
  return <CrudPage title="Canchas" storageKey="academia_canchas" fields={formFields} tableFields={tableFields} formFields={formFields} />;
}
