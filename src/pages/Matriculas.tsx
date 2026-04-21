import CrudPage, { FieldDef } from "@/components/CrudPage";

const tableFields: FieldDef[] = [
  { key: "deportista", label: "Deportista" },
  { key: "categoria", label: "Categoría" },
  { key: "fechaInicio", label: "Fecha inicio" },
  { key: "valor", label: "Valor", render: (v) => v ? `$${parseInt(v).toLocaleString()}` : "—" },
  { key: "estado", label: "Estado" },
];

const formFields: FieldDef[] = [
  { key: "deportista", label: "Deportista", type: "select", options: [
    { value: "Santiago Muñoz", label: "Santiago Muñoz" },
    { value: "Valentina Torres", label: "Valentina Torres" },
    { value: "Diego Herrera", label: "Diego Herrera" },
    { value: "Camila Ríos", label: "Camila Ríos" },
    { value: "Mateo Salazar", label: "Mateo Salazar" },
  ]},
  { key: "categoria", label: "Categoría", type: "select", options: [
    { value: "Sub-7", label: "Sub-7" },
    { value: "Sub-9", label: "Sub-9" },
    { value: "Sub-11", label: "Sub-11" },
    { value: "Sub-13", label: "Sub-13" },
    { value: "Sub-15", label: "Sub-15" },
    { value: "Sub-17", label: "Sub-17" },
    { value: "Sub-20", label: "Sub-20" },
    { value: "Mayores", label: "Mayores" },
  ]},
  { key: "fechaInicio", label: "Fecha inicio", type: "date" },
  { key: "valor", label: "Valor", type: "number", placeholder: "150000" },
  { key: "estado", label: "Estado", type: "select", options: [
    { value: "Activa", label: "Activa" },
    { value: "Inactiva", label: "Inactiva" },
    { value: "Suspendida", label: "Suspendida" },
  ]},
];

export default function Matriculas() {
  return <CrudPage title="Matrículas" storageKey="academia_matriculas" fields={formFields} tableFields={tableFields} formFields={formFields} />;
}
