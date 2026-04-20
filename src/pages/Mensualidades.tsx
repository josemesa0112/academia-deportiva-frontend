import CrudPage from "@/components/CrudPage";
export default function Mensualidades() {
  return <CrudPage title="Mensualidades" storageKey="academia_mensualidades" fields={[
    { key: "deportista", label: "Deportista" },
    { key: "mes", label: "Mes" },
    { key: "monto", label: "Monto", type: "number" },
    { key: "fechaPago", label: "Fecha de Pago", type: "date" },
    { key: "estado", label: "Estado", placeholder: "Pagado / Pendiente" },
  ]} />;
}
