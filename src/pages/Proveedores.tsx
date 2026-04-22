import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import api from "@/lib/api";

export default function Proveedores() {
  const [opciones, setOpciones] = useState({
    personas: [],
    productos: [],
    estados: [],
  });

  useEffect(() => {
    const cargarOpciones = async () => {
      const [personas, productos, estados] = await Promise.all([
        api.get("/api/personas"),
        api.get("/api/productos"),
        api.get("/api/catalogos/estados"),
      ]);
      setOpciones({
        personas: personas.map((p: any) => ({ value: String(p.id), label: `${p.nombre} ${p.apellido}` })),
        productos: productos.map((p: any) => ({ value: String(p.id), label: p.nombre_producto })),
        estados: estados.map((e: any) => ({ value: String(e.id), label: e.nombre })),
      });
    };
    cargarOpciones();
  }, []);

  const tableFields: FieldDef[] = [
    { key: "nombre", label: "Nombre" },
    { key: "numero_documento", label: "Documento" },
    { key: "numero_telefono", label: "Teléfono" },
    { key: "nombre_producto", label: "Producto" },
    { key: "estado", label: "Estado" },
  ];

  const formFields: FieldDef[] = [
    { key: "id_persona", label: "Persona", type: "select", options: opciones.personas },
    { key: "id_producto", label: "Producto", type: "select", options: opciones.productos },
    { key: "id_estado", label: "Estado", type: "select", options: opciones.estados },
  ];

  return (
    <CrudPage
      title="Proveedores"
      endpoint="/api/proveedores"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
    />
  );
}
