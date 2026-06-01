import { useEffect, useState } from "react";
import CrudPage, { FieldDef } from "@/components/CrudPage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface PrecioHistorico {
  id: number;
  id_producto: number;
  precio: string | number;
  fecha: string;
}

const formatFecha = (val: any) => {
  if (!val) return "—";
  const d = new Date(val);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatFechaCorta = (val: any) => {
  if (!val) return "";
  const d = new Date(val);
  return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
};

const formatMoneda = (v: any) =>
  v ? `$${parseInt(String(v)).toLocaleString()}` : "—";

export default function Productos() {
  const { toast } = useToast();
  const [opciones, setOpciones] = useState({
    tiposProducto: [],
    variantesProducto: [],
  });

  // Modal de historial de precios
  const [historialOpen, setHistorialOpen] = useState(false);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [historialData, setHistorialData] = useState<PrecioHistorico[]>([]);
  const [productoActual, setProductoActual] = useState<any>(null);

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

  const verHistorial = async (row: any) => {
    setProductoActual(row);
    setHistorialOpen(true);
    setHistorialLoading(true);
    try {
      const data = await api.get(`/api/productos/${row.id}/precios`);
      setHistorialData(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "No se pudo cargar el historial", variant: "destructive" });
      setHistorialData([]);
    } finally {
      setHistorialLoading(false);
    }
  };

  const datosGrafica = historialData.map(h => ({
    fecha: formatFechaCorta(h.fecha),
    precio: Number(h.precio),
  }));

  const tableFields: FieldDef[] = [
    { key: "nombre_producto", label: "Producto" },
    { key: "tipo_producto", label: "Tipo" },
    { key: "variante_producto", label: "Variante" },
    { key: "precio_producto", label: "Precio actual", render: (v) => formatMoneda(v) },
  ];

  const formFields: FieldDef[] = [
    { key: "nombre_producto", label: "Nombre producto", placeholder: "Ej: Balón Mikasa" },
    { key: "id_tipo_producto", label: "Tipo producto", type: "select", options: opciones.tiposProducto },
    { key: "id_variante_producto", label: "Variante", type: "select", options: opciones.variantesProducto },
    { key: "precio_producto", label: "Precio", type: "number", placeholder: "50000" },
  ];

  return (
    <>
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
        rowActions={(row) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => verHistorial(row)}
          >
            <TrendingUp className="h-4 w-4" /> Historial
          </Button>
        )}
      />

      <Dialog open={historialOpen} onOpenChange={setHistorialOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Historial de precios
              {productoActual && <span className="font-normal text-muted-foreground"> — {productoActual.nombre_producto}</span>}
            </DialogTitle>
          </DialogHeader>

          {historialLoading ? (
            <div className="py-8 text-center text-muted-foreground">Cargando...</div>
          ) : historialData.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No hay historial registrado para este producto todavía.
            </div>
          ) : (
            <div className="space-y-4">
              {historialData.length >= 2 && (
                <div className="rounded-lg border bg-card p-3">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={datosGrafica}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 10% 88%)" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Precio"]} />
                      <Line
                        type="monotone"
                        dataKey="precio"
                        stroke="hsl(152, 60%, 28%)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Variación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...historialData].reverse().map((h, i, arr) => {
                      // arr está en orden DESC (más reciente primero) — comparamos
                      // contra el siguiente índice (que es el anterior cronológico).
                      const anterior = arr[i + 1];
                      const diff = anterior ? Number(h.precio) - Number(anterior.precio) : null;
                      return (
                        <TableRow key={h.id}>
                          <TableCell>{formatFecha(h.fecha)}</TableCell>
                          <TableCell className="font-medium">{formatMoneda(h.precio)}</TableCell>
                          <TableCell>
                            {diff === null ? (
                              <span className="text-xs text-muted-foreground">Inicial</span>
                            ) : diff === 0 ? (
                              <span className="text-xs text-muted-foreground">Sin cambio</span>
                            ) : diff > 0 ? (
                              <span className="text-xs text-green-600">▲ +${diff.toLocaleString()}</span>
                            ) : (
                              <span className="text-xs text-red-500">▼ −${Math.abs(diff).toLocaleString()}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
