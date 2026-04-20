import CrudPage from "@/components/CrudPage";
export default function Matriculas() {
  return <CrudPage title="Matrículas" storageKey="academia_matriculas" fields={[
    { key: "deportista", label: "Deportista" },
    { key: "deporte", label: "Deporte" },
    { key: "fecha", label: "Fecha de Matrícula", type: "date" },
    { key: "monto", label: "Monto", type: "number" },
    { key: "estado", label: "Estado", placeholder: "Activa / Inactiva" },
  ]} />;
}
