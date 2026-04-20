import CrudPage from "@/components/CrudPage";
export default function Asistencias() {
  return <CrudPage title="Asistencias" storageKey="academia_asistencias" fields={[
    { key: "deportista", label: "Deportista" },
    { key: "entrenamiento", label: "Entrenamiento" },
    { key: "fecha", label: "Fecha", type: "date" },
    { key: "estado", label: "Estado", placeholder: "Presente / Ausente / Tardanza" },
  ]} />;
}
