import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import api from "@/lib/api";

const meses = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const años = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

export default function Mensualidades() {
  const [opciones, setOpciones] = useState({
    deportistas: [],
    estados: [],
  });

  useEffect(() => {
    const cargarOpciones = async () => {
      const [deportistas, estados] = await Promise.all([
        api.get("/api/deportistas"),
        api.get("/api/catalogos/estados"),
      ]);
      setOpciones({
        deportistas: deportistas.map((d: any) => ({
          value: String(d.id),
          label: `${d.nombre} ${d.apellido}`
        })),
        estados: estados.map((e: any) => ({ value: String(e.id), label: e.nombre })),
      });
    };
    cargarOpciones();
  }, []);

  const tableFields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "numero_documento", label: "Documento" },
    { key: "mes", label: "Mes", render: (v) => meses.find(m => m.value === String(v))?.label || v },
    { key: "año", label: "Año" },
    { key: "valor", label: "Valor", render: (v) => v ? `$${parseInt(v).toLocaleString()}` : "—" },
    { key: "estado", label: "Estado" },
  ];

  const formFields: FieldDef[] = [
    { key: "id_deportista", label: "Deportista", type: "select", options: opciones.deportistas },
    { key: "mes", label: "Mes", type: "select", options: meses },
    { key: "año", label: "Año", type: "select", options: años },
    { key: "valor", label: "Valor", type: "number", placeholder: "150000" },
    { key: "id_estado", label: "Estado", type: "select", options: opciones.estados },
  ];

  return (
    <CrudPage
      title="Mensualidades"
      endpoint="/api/mensualidades"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
      searchFields={["nombre", "apellido", "numero_documento"]}
      searchPlaceholder="Buscar por nombre o número de documento..."
      sortOptions={[
        { key: "nombre", label: "Nombre (A-Z)", type: "string" },
        { key: "año", label: "Año", type: "number" },
        { key: "mes", label: "Mes", type: "number" },
      ]}
      groupBy="categoria"
      groupEmptyLabel="Sin categoría"
    />
  );
}
