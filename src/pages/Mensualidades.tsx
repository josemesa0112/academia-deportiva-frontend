import CrudPage, { FieldDef } from "@/components/CrudPage";
import { Check, X } from "lucide-react";

const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const tableFields: FieldDef[] = [
  { key: "deportista", label: "Deportista" },
  { key: "mes", label: "Mes" },
  { key: "anio", label: "Año" },
  { key: "valor", label: "Valor", render: (v) => v ? `$${parseInt(v).toLocaleString()}` : "—" },
  { key: "pagado", label: "Pagado", render: (v) => v === "true"
    ? <span className="flex items-center gap-1 text-green-600"><Check className="h-4 w-4" /> Sí</span>
    : <span className="flex items-center gap-1 text-red-500"><X className="h-4 w-4" /> No</span>
  },
  { key: "fechaPago", label: "Fecha pago" },
];

const formFields: FieldDef[] = [
  { key: "deportista", label: "Deportista", type: "select", options: [
    { value: "Santiago Muñoz", label: "Santiago Muñoz" },
    { value: "Valentina Torres", label: "Valentina Torres" },
    { value: "Diego Herrera", label: "Diego Herrera" },
    { value: "Camila Ríos", label: "Camila Ríos" },
    { value: "Mateo Salazar", label: "Mateo Salazar" },
  ]},
  { key: "mes", label: "Mes", type: "select", options: meses.map(m => ({ value: m, label: m })) },
  { key: "anio", label: "Año", type: "select", options: [
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
  ]},
  { key: "valor", label: "Valor", type: "number", placeholder: "150000" },
  { key: "pagado", label: "Pagado", type: "switch" },
  { key: "fechaPago", label: "Fecha pago", type: "date" },
];

export default function Mensualidades() {
  return <CrudPage title="Mensualidades" storageKey="academia_mensualidades" fields={formFields} tableFields={tableFields} formFields={formFields} />;
}
