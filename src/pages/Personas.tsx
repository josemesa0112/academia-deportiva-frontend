import CrudPage from "@/components/CrudPage";
export default function Personas() {
  return <CrudPage title="Personas" storageKey="academia_personas" fields={[
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "documento", label: "Documento" },
    { key: "telefono", label: "Teléfono" },
    { key: "email", label: "Email", type: "email" },
  ]} />;
}
