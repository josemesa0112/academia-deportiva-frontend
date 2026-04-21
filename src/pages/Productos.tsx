import CrudPage, { FieldDef } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";

const tableFields: FieldDef[] = [
  { key: "nombre", label: "Producto" },
  { key: "tipo", label: "Tipo" },
  { key: "variante", label: "Variante" },
  { key: "precio", label: "Precio", render: (v) => v ? `$${parseInt(v).toLocaleString()}` : "—" },
  { key: "stock", label: "Stock", render: (v) => {
    const n = parseInt(v) || 0;
    const color = n > 10 ? "default" : n > 0 ? "secondary" : "destructive";
    return <Badge variant={color}>{n} uds</Badge>;
  }},
];

const formFields: FieldDef[] = [
  { key: "nombre", label: "Nombre producto", placeholder: "Ej: Balón de fútbol" },
  { key: "tipo", label: "Tipo producto", type: "select", options: [
    { value: "Implemento deportivo", label: "Implemento deportivo" },
    { value: "Uniforme", label: "Uniforme" },
    { value: "Accesorio", label: "Accesorio" },
    { value: "Equipamiento", label: "Equipamiento" },
    { value: "Hidratación", label: "Hidratación" },
  ]},
  { key: "variante", label: "Variante", placeholder: "Ej: Talla M, Color rojo" },
  { key: "precio", label: "Precio", type: "number", placeholder: "50000" },
  { key: "stock", label: "Stock inicial", type: "number", placeholder: "20" },
];

export default function Productos() {
  return <CrudPage title="Productos" storageKey="academia_productos" fields={formFields} tableFields={tableFields} formFields={formFields} />;
}
