import CrudPage from "@/components/CrudPage";
export default function Compras() {
  return <CrudPage title="Compras" storageKey="academia_compras" fields={[
    { key: "producto", label: "Producto" },
    { key: "proveedor", label: "Proveedor" },
    { key: "cantidad", label: "Cantidad", type: "number" },
    { key: "total", label: "Total", type: "number" },
    { key: "fecha", label: "Fecha", type: "date" },
  ]} />;
}
