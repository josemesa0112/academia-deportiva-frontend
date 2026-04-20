import CrudPage from "@/components/CrudPage";
export default function Entrenamientos() {
  return <CrudPage title="Entrenamientos" storageKey="academia_entrenamientos" fields={[
    { key: "deporte", label: "Deporte" },
    { key: "profesor", label: "Profesor" },
    { key: "cancha", label: "Cancha" },
    { key: "horario", label: "Horario" },
    { key: "fecha", label: "Fecha", type: "date" },
  ]} />;
}
