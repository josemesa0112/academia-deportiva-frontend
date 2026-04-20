import CrudPage from "@/components/CrudPage";
export default function Profesores() {
  return <CrudPage title="Profesores" storageKey="academia_profesores" fields={[
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "especialidad", label: "Especialidad" },
    { key: "telefono", label: "Teléfono" },
    { key: "email", label: "Email", type: "email" },
  ]} />;
}
