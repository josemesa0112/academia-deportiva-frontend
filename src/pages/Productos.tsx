import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import api from "@/lib/api";

export default function Productos() {
  const [opciones, setOpciones] = useState({
    tiposProducto: [],
    variantesProducto: [],
  });

  useEffect(() => {
    const cargarOpciones = async () => {
      const [tipos, variantes] = await Promise.all([
        api.get("/api/catalogos/tipos-producto"),
        api.get("/api/catalogos/variantes-producto"),
      ]);
      setOpciones({
        tiposProducto: tipos.map((t: any) => ({ value: String(t.id), label: t.nombre })),
        variantesProducto: variantes.map((v: any) => ({ value: String(v.id), label: v.nombre })),
      });
    };
    cargarOpciones();
  }, []);

  const tableFields: FieldDef[] = [
    { key: "nombre_producto", label: "Producto" },
    { key: "tipo_producto", label: "Tipo" },
    { key: "variante_producto", label: "Variante" },
    { key: "precio_producto", label: "Precio", render: (v) => v ? `$${parseInt(v).toLocaleString()}` : "—" },
  ];

  const formFields: FieldDef[] = [
    { key: "nombre_producto", label: "Nombre producto", placeholder: "Ej: Balón Mikasa" },
    { key: "id_tipo_producto", label: "Tipo producto", type: "select", options: opciones.tiposProducto },
    { key: "id_variante_producto", label: "Variante", type: "select", options: opciones.variantesProducto },
    { key: "precio_producto", label: "Precio", type: "number", placeholder: "50000" },
  ];

  return (
    <CrudPage
      title="Productos"
      endpoint="/api/productos"
      fields={formFields}
      tableFields={tableFields}
      formFields={formFields}
      searchFields={["nombre_producto"]}
      searchPlaceholder="Buscar producto por nombre..."
      sortOptions={[
        { key: "nombre_producto", label: "Nombre (A-Z)", type: "string" },
        { key: "precio_producto", label: "Precio (menor a mayor)", type: "number" },
      ]}
    />
  );
}