import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingDown } from "lucide-react";
import { useRol } from "@/hooks/useRol";
import api from "@/lib/api";

const formatMoneda = (v: any) =>
  v === null || v === undefined || v === "" ? "—" : `$${Number(v).toLocaleString("es-CO")}`;

const formatFecha = (val: any) => {
  if (!val) return "—";
  const d = new Date(val);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
};

const mesActual = () => {
  const hoy = new Date();
  return { mes: hoy.getMonth() + 1, año: hoy.getFullYear() };
};

export default function Gastos() {
  const { userRol, loading } = useRol();
  const [tipos, setTipos] = useState<{ value: string; label: string }[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    api.get("/api/catalogos/tipos-gasto")
      .then((res: any[]) => setTipos(res.map(t => ({ value: String(t.id), label: t.nombre }))))
      .catch(() => setTipos([]));
  }, []);

  // Se consulta aparte solo para el resumen de encabezado; CrudPage mantiene
  // su propia copia para la tabla.
  const cargarResumen = () => {
    api.get("/api/gastos").then(setData).catch(() => setData([]));
  };
  useEffect(cargarResumen, []);

  const resumen = useMemo(() => {
    const { mes, año } = mesActual();
    const delMes = data.filter(g => {
      if (!g.fecha) return false;
      const d = new Date(g.fecha);
      return d.getUTCMonth() + 1 === mes && d.getUTCFullYear() === año;
    });
    const total = delMes.reduce((s, g) => s + Number(g.valor || 0), 0);
    const porTipo = new Map<string, number>();
    for (const g of delMes) {
      const t = g.tipo_gasto || "Sin tipo";
      porTipo.set(t, (porTipo.get(t) || 0) + Number(g.valor || 0));
    }
    return {
      total,
      cantidad: delMes.length,
      porTipo: Array.from(porTipo.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [data]);

  // Solo el Administrador maneja los egresos; el backend también lo exige.
  if (!loading && userRol && userRol.id_rol !== 1) {
    return <Navigate to="/dashboard" replace />;
  }

  const tableFields: FieldDef[] = [
    { key: "fecha", label: "Fecha", render: (v) => formatFecha(v) },
    { key: "concepto", label: "Concepto" },
    {
      key: "tipo_gasto",
      label: "Tipo",
      render: (v) => <Badge variant="outline">{v || "—"}</Badge>,
    },
    { key: "valor", label: "Valor", render: (v) => formatMoneda(v) },
    { key: "descripcion", label: "Detalle", render: (v) => v || "—" },
  ];

  const formFields: FieldDef[] = [
    { key: "concepto", label: "Concepto", placeholder: "Ej: Arriendo cancha marzo" },
    { key: "id_tipo_gasto", label: "Tipo de gasto", type: "select", options: tipos },
    { key: "valor", label: "Valor", type: "number", placeholder: "500000" },
    { key: "fecha", label: "Fecha", type: "date" },
    { key: "descripcion", label: "Detalle (opcional)", placeholder: "Observaciones", optional: true },
  ];

  return (
    <>
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Gastos registrados este mes
              </p>
              <p className="text-2xl font-bold">{formatMoneda(resumen.total)}</p>
              <p className="text-xs text-muted-foreground">
                {resumen.cantidad} {resumen.cantidad === 1 ? "registro" : "registros"}
                {" · no incluye las compras a proveedores"}
              </p>
            </div>
          </div>

          {resumen.porTipo.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {resumen.porTipo.slice(0, 5).map(([tipo, total]) => (
                <div key={tipo} className="rounded-lg border bg-muted/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{tipo}</p>
                  <p className="text-sm font-semibold">{formatMoneda(total)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CrudPage
        title="Gastos"
        endpoint="/api/gastos"
        fields={formFields}
        formFields={formFields}
        tableFields={tableFields}
        searchFields={["concepto", "tipo_gasto", "descripcion"]}
        searchPlaceholder="Buscar por concepto, tipo o detalle..."
        sortOptions={[
          { key: "fecha", label: "Fecha (más antigua)", type: "date" },
          { key: "valor", label: "Valor (menor a mayor)", type: "number" },
          { key: "concepto", label: "Concepto (A-Z)", type: "string" },
        ]}
        groupBy="tipo_gasto"
        groupEmptyLabel="Sin tipo"
        headerActions={() => (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" />
            Las compras a proveedores se registran en Compras
          </div>
        )}
      />
    </>
  );
}