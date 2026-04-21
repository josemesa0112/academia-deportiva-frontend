import CrudPage, { FieldDef } from "@/components/CrudPage";

const canchas = [
  { value: "Cancha El Campín", label: "Cancha El Campín" },
  { value: "Cancha Norte", label: "Cancha Norte" },
  { value: "Cancha Sur", label: "Cancha Sur" },
  { value: "Cancha Sintética 1", label: "Cancha Sintética 1" },
];

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

const profesores = [
  { value: "Carlos Ramírez", label: "Carlos Ramírez" },
  { value: "Andrés López", label: "Andrés López" },
  { value: "María García", label: "María García" },
];

const tableFields: FieldDef[] = [
  { key: "fecha", label: "Fecha" },
  { key: "horaInicio", label: "Hora inicio" },
  { key: "horaFin", label: "Hora fin" },
  { key: "cancha", label: "Cancha" },
  { key: "categoria", label: "Categoría" },
  { key: "profesores", label: "Profesores" },
];

const formFields: FieldDef[] = [
  { key: "cancha", label: "Cancha", type: "select", options: canchas },
  { key: "categoria", label: "Categoría", type: "select", options: categorias },
  { key: "fecha", label: "Fecha", type: "date" },
  { key: "horaInicio", label: "Hora inicio", type: "time" },
  { key: "horaFin", label: "Hora fin", type: "time" },
  { key: "profesores", label: "Profesores asignados", type: "multiselect", options: profesores },
];

export default function Entrenamientos() {
  return <CrudPage title="Entrenamientos" storageKey="academia_entrenamientos" fields={formFields} tableFields={tableFields} formFields={formFields} />;
}
