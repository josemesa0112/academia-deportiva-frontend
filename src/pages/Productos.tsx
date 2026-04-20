import CrudPage from "@/components/CrudPage";
export default function Productos() {
  return <CrudPage title="Productos" storageKey="academia_productos" fields={[
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "precio", label: "Precio", type: "number" },
    { key: "stock", label: "Stock", type: "number" },
    { key: "proveedor", label: "Proveedor" },
  ]} />;
}
