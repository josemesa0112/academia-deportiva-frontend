import CrudPage from "@/components/CrudPage";
export default function Canchas() {
  return <CrudPage title="Canchas" storageKey="academia_canchas" fields={[
    { key: "nombre", label: "Nombre" },
    { key: "deporte", label: "Deporte" },
    { key: "capacidad", label: "Capacidad", type: "number" },
    { key: "ubicacion", label: "Ubicación" },
    { key: "estado", label: "Estado", placeholder: "Disponible / En mantenimiento" },
  ]} />;
}
