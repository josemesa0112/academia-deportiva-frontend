import CrudPage from "@/components/CrudPage";
export default function Proveedores() {
  return <CrudPage title="Proveedores" storageKey="academia_proveedores" fields={[
    { key: "empresa", label: "Empresa" },
    { key: "contacto", label: "Contacto" },
    { key: "telefono", label: "Teléfono" },
    { key: "email", label: "Email", type: "email" },
    { key: "direccion", label: "Dirección" },
  ]} />;
}
