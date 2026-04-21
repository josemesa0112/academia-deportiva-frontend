import CrudPage, { FieldDef } from "@/components/CrudPage";
import { Check, X } from "lucide-react";

const tableFields: FieldDef[] = [
  { key: "entrenamiento", label: "Entrenamiento" },
  { key: "fecha", label: "Fecha" },
  { key: "deportista", label: "Deportista" },
  { key: "asistio", label: "Asistió", render: (v) => v === "Presente" 
    ? <span className="flex items-center gap-1 text-green-600"><Check className="h-4 w-4" /> Presente</span> 
    : <span className="flex items-center gap-1 text-red-500"><X className="h-4 w-4" /> Ausente</span> 
  },
];

const formFields: FieldDef[] = [
  { key: "entrenamiento", label: "Entrenamiento", type: "select", options: [
    { value: "Sub-13 - Lunes 8:00 AM", label: "Sub-13 - Lunes 8:00 AM" },
    { value: "Sub-15 - Martes 3:00 PM", label: "Sub-15 - Martes 3:00 PM" },
    { value: "Sub-17 - Miércoles 4:00 PM", label: "Sub-17 - Miércoles 4:00 PM" },
    { value: "Mayores - Viernes 6:00 PM", label: "Mayores - Viernes 6:00 PM" },
  ]},
  { key: "fecha", label: "Fecha", type: "date" },
  { key: "deportista", label: "Deportista", type: "select", options: [
    { value: "Santiago Muñoz", label: "Santiago Muñoz" },
    { value: "Valentina Torres", label: "Valentina Torres" },
    { value: "Diego Herrera", label: "Diego Herrera" },
    { value: "Camila Ríos", label: "Camila Ríos" },
    { value: "Mateo Salazar", label: "Mateo Salazar" },
  ]},
  { key: "asistio", label: "Estado asistencia", type: "select", options: [
    { value: "Presente", label: "Presente" },
    { value: "Ausente", label: "Ausente" },
  ]},
];

export default function Asistencias() {
  return <CrudPage title="Asistencias" storageKey="academia_asistencias" fields={formFields} tableFields={tableFields} formFields={formFields} />;
}
