import CrudPage from "@/components/CrudPage";
export default function Deportistas() {
  return <CrudPage title="Deportistas" storageKey="academia_deportistas" fields={[
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "edad", label: "Edad", type: "number" },
    { key: "deporte", label: "Deporte" },
    { key: "categoria", label: "Categoría" },
  ]} />;
}
