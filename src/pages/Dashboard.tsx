import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, GraduationCap, Dumbbell, CalendarDays,
  Wallet, AlertCircle, ShoppingCart, TrendingUp, TrendingDown,
  Cake, Activity, ArrowRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "@/lib/api";
import { useRol } from "@/hooks/useRol";

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const formatMoneda = (v: number) => {
  if (v == null) return "$0";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v.toLocaleString()}`;
};

const formatMonedaFull = (v: number) => v == null ? "$0" : `$${v.toLocaleString()}`;

const iniciales = (nombre = "", apellido = "") =>
  ((nombre[0] || "") + (apellido[0] || "")).toUpperCase() || "?";

const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
};

// Paleta para la dona de categorías
const COLORES_CATEGORIA = [
  "hsl(152, 60%, 35%)",
  "hsl(152, 60%, 45%)",
  "hsl(152, 60%, 55%)",
  "hsl(152, 50%, 65%)",
  "hsl(152, 40%, 75%)",
];

interface Resumen {
  periodo: { mes: number; año: number };
  financiero: {
    recaudo_mes: number;
    recaudo_mensualidades: number;
    recaudo_matriculas: number;
    pendiente: number;
    cantidad_pendientes: number;
    pendiente_matriculas: number;
    cantidad_pendientes_matriculas: number;
    gastos: number;
    cantidad_compras: number;
    recaudo_mes_anterior: number;
    cambio_porcentual: number | null;
  };
  conteos: {
    deportistas: number;
    profesores: number;
    proveedores: number;
    porcentaje_asistencia: number | null;
  };
  recaudacion_historica: Array<{ periodo: string; mes: number; año: number; total: number }>;
  deportistas_por_categoria: Array<{ id: number; categoria: string; total: number }>;
  cumpleanos_del_mes: Array<{
    id: number; nombre: string; apellido: string;
    fecha_nacimiento: string; dia: number; edad_actual: number;
    nombre_rol: string; categoria: string | null;
  }>;
  proximos_entrenamientos: Array<{
    id: number; fecha: string; hora_inicio: string; hora_fin: string;
    cancha: string; categoria: string;
  }>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { userRol } = useRol();
  const [data, setData] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await api.get("/api/dashboard/resumen");
        if (!cancelado) setData(res);
      } catch (e: any) {
        if (!cancelado) setError(e?.message || "No se pudo cargar el dashboard");
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  const periodoLabel = data
    ? `${meses[data.periodo.mes - 1]} ${data.periodo.año}`
    : "";

  // Gráfica histórica formateada
  const datosHistoricos = useMemo(() => {
    if (!data) return [];
    return data.recaudacion_historica.map(d => ({
      label: `${meses[d.mes - 1].slice(0, 3)} ${String(d.año).slice(2)}`,
      total: Number(d.total),
    }));
  }, [data]);

  // Donut: deportistas por categoría
  const datosCategoria = useMemo(() => {
    if (!data) return [];
    return data.deportistas_por_categoria
      .filter(c => c.total > 0)
      .map(c => ({ name: c.categoria, value: Number(c.total) }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Cargando dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-sm text-destructive">
        {error || "Sin datos"}
      </div>
    );
  }

  const cambio = data.financiero.cambio_porcentual;
  const subio = cambio !== null && cambio >= 0;
  const hoyDia = new Date().getDate();
  // El bloque financiero solo lo ve el Administrador (rol 1).
  // Los demás roles solo ven la parte operativa y las listas.
  const esAdmin = userRol?.id_rol === 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold">
            {saludo()}{userRol ? `, ${userRol.nombre}` : ""}
          </h2>
          <p className="text-sm text-muted-foreground">
            Resumen del periodo · <span className="font-medium text-foreground">{periodoLabel}</span>
          </p>
        </div>
      </div>

      {/* Bloque financiero — 5 KPIs grandes (solo Admin) */}
      {esAdmin && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <KpiFinanciero
            icon={Wallet}
            label="Recaudo del mes"
            value={formatMonedaFull(data.financiero.recaudo_mes)}
            sub={`Mensualidades ${formatMoneda(data.financiero.recaudo_mensualidades)} · Matrículas ${formatMoneda(data.financiero.recaudo_matriculas)}`}
            color="green"
          />
          <KpiFinanciero
            icon={AlertCircle}
            label="Mensualidades pendientes"
            value={formatMonedaFull(data.financiero.pendiente)}
            sub={`${data.financiero.cantidad_pendientes} mensualidad${data.financiero.cantidad_pendientes === 1 ? "" : "es"} del mes sin pago`}
            color="amber"
          />
          <KpiFinanciero
            icon={AlertCircle}
            label="Matrículas pendientes"
            value={formatMonedaFull(data.financiero.pendiente_matriculas)}
            sub={`${data.financiero.cantidad_pendientes_matriculas} matrícula${data.financiero.cantidad_pendientes_matriculas === 1 ? "" : "s"} acumulada${data.financiero.cantidad_pendientes_matriculas === 1 ? "" : "s"} sin pago`}
            color="amber"
          />
          <KpiFinanciero
            icon={ShoppingCart}
            label="Gastos del mes"
            value={formatMonedaFull(data.financiero.gastos)}
            sub={`${data.financiero.cantidad_compras} compra${data.financiero.cantidad_compras === 1 ? "" : "s"} a proveedores`}
            color="red"
          />
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Variación vs mes anterior
              </CardTitle>
              {cambio === null ? null : subio ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cambio === null ? "—" : `${subio ? "+" : ""}${cambio.toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mes anterior: {formatMoneda(data.financiero.recaudo_mes_anterior)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bloque KPIs operativos — 4 chicos. Solo Admin puede navegar
          desde estas tarjetas; para otros roles son solo informativas. */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiCompact icon={Dumbbell} label="Deportistas" value={data.conteos.deportistas} onClick={esAdmin ? () => navigate("/deportistas") : undefined} />
        <KpiCompact icon={GraduationCap} label="Profesores" value={data.conteos.profesores} onClick={esAdmin ? () => navigate("/profesores") : undefined} />
        <KpiCompact icon={Users} label="Proveedores" value={data.conteos.proveedores} onClick={esAdmin ? () => navigate("/proveedores") : undefined} />
        <KpiCompact
          icon={Activity}
          label="Asistencia 4 semanas"
          value={data.conteos.porcentaje_asistencia === null ? "—" : `${data.conteos.porcentaje_asistencia}%`}
        />
      </div>

      {/* Gráficas */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Recaudación histórica — solo Admin */}
        {esAdmin && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Recaudación últimos 6 meses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={datosHistoricos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 10% 88%)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatMoneda(v)} />
                  <Tooltip formatter={(v: number) => [formatMonedaFull(v), "Recaudo"]} />
                  <Bar dataKey="total" fill="hsl(152, 60%, 28%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Donut de categorías: ocupa todo el ancho si no hay gráfica histórica */}
        <Card className={esAdmin ? "" : "lg:col-span-3"}>
          <CardHeader>
            <CardTitle className="text-base">Deportistas por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {datosCategoria.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin deportistas activos.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={datosCategoria}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {datosCategoria.map((_, i) => (
                      <Cell key={i} fill={COLORES_CATEGORIA[i % COLORES_CATEGORIA.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} deportistas`, ""]} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(v) => <span className="text-xs">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cumpleaños + Próximos entrenamientos */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Cake className="h-4 w-4 text-pink-500" />
              Cumpleaños de {meses[data.periodo.mes - 1]}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {data.cumpleanos_del_mes.length} {data.cumpleanos_del_mes.length === 1 ? "persona" : "personas"}
            </Badge>
          </CardHeader>
          <CardContent>
            {data.cumpleanos_del_mes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Nadie cumple años este mes.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {data.cumpleanos_del_mes.map(p => {
                  const esHoy = p.dia === hoyDia;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 rounded-md p-2 ${esHoy ? "bg-pink-500/10 border border-pink-500/30" : "hover:bg-muted/50"}`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {iniciales(p.nombre, p.apellido)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {p.nombre} {p.apellido}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.nombre_rol}{p.categoria ? ` · ${p.categoria}` : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {esHoy ? (
                          <Badge className="bg-pink-500 text-white">¡Hoy!</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Día {p.dia}</span>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.edad_actual + 1} años
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Próximos entrenamientos
            </CardTitle>
            {esAdmin && (
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/entrenamientos")}>
                Ver todos <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {data.proximos_entrenamientos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No hay entrenamientos programados en la próxima semana.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {data.proximos_entrenamientos.map(e => {
                  const fecha = new Date(e.fecha);
                  const esHoy = fecha.toDateString() === new Date().toDateString();
                  return (
                    <div key={e.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50">
                      <div className={`flex flex-col items-center justify-center rounded-md w-12 h-12 shrink-0 ${esHoy ? "bg-blue-500 text-white" : "bg-muted text-foreground"}`}>
                        <span className="text-[10px] uppercase font-medium leading-none">{diasSemana[fecha.getDay()]}</span>
                        <span className="text-base font-bold leading-tight mt-0.5">{fecha.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {e.categoria || "Sin categoría"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {e.hora_inicio?.slice(0, 5)} – {e.hora_fin?.slice(0, 5)} · {e.cancha || "Sin cancha"}
                        </p>
                      </div>
                      {esHoy && <Badge className="bg-blue-500 text-white text-xs">Hoy</Badge>}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiFinanciero({
  icon: Icon, label, value, sub, color,
}: {
  icon: any; label: string; value: string; sub: string;
  color: "green" | "amber" | "red";
}) {
  const colorMap = {
    green: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
    red:   { bg: "bg-red-500/10",   text: "text-red-500",   border: "border-red-500/20" },
  };
  const c = colorMap[color];
  return (
    <Card className={`overflow-hidden ${c.border}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </CardTitle>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${c.bg}`}>
          <Icon className={`h-4 w-4 ${c.text}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function KpiCompact({
  icon: Icon, label, value, onClick,
}: {
  icon: any; label: string; value: number | string; onClick?: () => void;
}) {
  const Wrapper: any = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { onClick, type: "button" } : {})}
      className={`rounded-lg border bg-card p-3 flex items-center gap-3 text-left ${onClick ? "hover:bg-muted/30 transition-colors cursor-pointer" : ""}`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold leading-tight">{value}</p>
      </div>
    </Wrapper>
  );
}
