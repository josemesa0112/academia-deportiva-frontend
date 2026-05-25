import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ArrowLeft, Mail, Phone, IdCard, CalendarDays, Ruler, Scale,
  Activity, Percent, TrendingUp, DollarSign, ClipboardList,
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const formatFecha = (val: any) => {
  if (!val) return "—";
  const s = String(val);
  return s.includes("T") ? s.split("T")[0] : s;
};

const formatFechaCorta = (val: any) => {
  if (!val) return "";
  const d = new Date(val);
  return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
};

const iniciales = (nombre = "", apellido = "") =>
  ((nombre[0] || "") + (apellido[0] || "")).toUpperCase() || "?";

const formatMoneda = (v: any) =>
  v ? `$${parseInt(v).toLocaleString()}` : "—";

const antiguedadEnMeses = (fechaInicio: string) => {
  if (!fechaInicio) return 0;
  const inicio = new Date(fechaInicio);
  const ahora = new Date();
  return (ahora.getFullYear() - inicio.getFullYear()) * 12 + (ahora.getMonth() - inicio.getMonth());
};

const formatAntiguedad = (meses: number) => {
  if (meses < 1) return "Menos de 1 mes";
  if (meses < 12) return `${meses} ${meses === 1 ? "mes" : "meses"}`;
  const años = Math.floor(meses / 12);
  const m = meses % 12;
  if (m === 0) return `${años} ${años === 1 ? "año" : "años"}`;
  return `${años} ${años === 1 ? "año" : "años"} ${m} ${m === 1 ? "mes" : "meses"}`;
};

export default function PerfilDeportista() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [deportista, setDeportista] = useState<any | null>(null);
  const [matriculas, setMatriculas] = useState<any[]>([]);
  const [mensualidades, setMensualidades] = useState<any[]>([]);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [mediciones, setMediciones] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    (async () => {
      try {
        setLoading(true);
        const [dep, mat, men, asi, med] = await Promise.all([
          api.get(`/api/deportistas/${id}`),
          api.get(`/api/matriculas/deportista/${id}`).catch(() => []),
          api.get(`/api/mensualidades/deportista/${id}`).catch(() => []),
          api.get(`/api/asistencias/deportista/${id}`).catch(() => []),
          api.get(`/api/deportistas/${id}/mediciones`).catch(() => []),
        ]);
        if (cancelado) return;
        setDeportista(dep);
        setMatriculas(Array.isArray(mat) ? mat : []);
        setMensualidades(Array.isArray(men) ? men : []);
        setAsistencias(Array.isArray(asi) ? asi : []);
        setMediciones(Array.isArray(med) ? med : []);
      } catch (err: any) {
        toast({ title: "Error", description: err?.message || "No se pudo cargar el perfil", variant: "destructive" });
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => { cancelado = true; };
  }, [id, toast]);

  const kpis = useMemo(() => {
    const totalAsist = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === "Activo").length;
    const porcentajeAsistencia = totalAsist > 0 ? Math.round((presentes / totalAsist) * 100) : 0;

    const mensualidadesPendientes = mensualidades.filter(m => m.estado !== "Activo").length;
    const totalPagado = mensualidades
      .filter(m => m.estado === "Activo")
      .reduce((sum, m) => sum + Number(m.valor || 0), 0);

    const matriculaMasAntigua = matriculas
      .map(m => m.fecha_inicio)
      .filter(Boolean)
      .sort()[0];
    const meses = matriculaMasAntigua ? antiguedadEnMeses(matriculaMasAntigua) : 0;

    return {
      porcentajeAsistencia,
      mensualidadesPendientes,
      totalPagado,
      antiguedadTexto: formatAntiguedad(meses),
      totalAsistencias: totalAsist,
      presentes,
    };
  }, [asistencias, mensualidades, matriculas]);

  const datosGrafica = useMemo(() => {
    return mediciones
      .filter(m => m.peso !== null || m.imc !== null)
      .map(m => ({
        fecha: formatFechaCorta(m.fecha),
        peso: m.peso !== null ? Number(m.peso) : null,
        imc: m.imc !== null ? Number(m.imc) : null,
      }));
  }, [mediciones]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Cargando perfil...
      </div>
    );
  }

  if (!deportista) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-muted-foreground">No se encontró el deportista.</p>
        <Button variant="outline" onClick={() => navigate("/deportistas")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  const posiciones: { id: number; nombre: string }[] = Array.isArray(deportista.posiciones)
    ? deportista.posiciones
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/deportistas")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver a deportistas
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
            {iniciales(deportista.nombre, deportista.apellido)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{deportista.nombre} {deportista.apellido}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
              {deportista.numero_documento && (
                <span className="inline-flex items-center gap-1"><IdCard className="h-3 w-3" />{deportista.numero_documento}</span>
              )}
              {deportista.correo && (
                <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{deportista.correo}</span>
              )}
              {deportista.numero_telefono && (
                <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{deportista.numero_telefono}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {deportista.categoria && <Badge variant="default">{deportista.categoria}</Badge>}
              {deportista.clasificacion && <Badge variant="secondary">{deportista.clasificacion}</Badge>}
              {deportista.estado && (
                <Badge variant={deportista.estado === "Activo" ? "default" : "outline"} className={deportista.estado === "Activo" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}>
                  {deportista.estado}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            {deportista.imc_actual && (
              <div className="text-center">
                <div className="text-2xl font-bold">{Number(deportista.imc_actual).toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">IMC actual</div>
              </div>
            )}
            {deportista.valor_mensualidad && (
              <div className="text-center">
                <div className="text-2xl font-bold">{formatMoneda(deportista.valor_mensualidad)}</div>
                <div className="text-xs text-muted-foreground">Mensualidad</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="fisico">Físico</TabsTrigger>
          <TabsTrigger value="matriculas">Matrículas</TabsTrigger>
          <TabsTrigger value="mensualidades">Mensualidades</TabsTrigger>
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
        </TabsList>

        {/* RESUMEN */}
        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={Percent} label="% Asistencia" value={`${kpis.porcentajeAsistencia}%`} sub={`${kpis.presentes}/${kpis.totalAsistencias} sesiones`} />
            <KpiCard icon={ClipboardList} label="Mensualidades pendientes" value={String(kpis.mensualidadesPendientes)} />
            <KpiCard icon={CalendarDays} label="Antigüedad" value={kpis.antiguedadTexto} />
            <KpiCard icon={DollarSign} label="Total pagado" value={formatMoneda(kpis.totalPagado)} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Posiciones</CardTitle>
            </CardHeader>
            <CardContent>
              {posiciones.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tiene posiciones asignadas.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {posiciones.map(p => (
                    <Badge key={p.id} variant="outline" className="text-sm">{p.nombre}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos personales</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <Dato label="Nombre completo" value={`${deportista.nombre || ""} ${deportista.apellido || ""}`} />
              <Dato label="Documento" value={deportista.numero_documento} />
              <Dato label="Correo" value={deportista.correo} />
              <Dato label="Teléfono" value={deportista.numero_telefono} />
              <Dato label="Fecha de nacimiento" value={formatFecha(deportista.fecha_nacimiento)} />
              <Dato label="Estado" value={deportista.estado} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* FÍSICO */}
        <TabsContent value="fisico" className="space-y-4">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={Scale} label="Peso actual" value={deportista.peso_actual ? `${deportista.peso_actual} kg` : "—"} />
            <KpiCard icon={Ruler} label="Estatura actual" value={deportista.estatura_actual ? `${deportista.estatura_actual} m` : "—"} />
            <KpiCard icon={Activity} label="IMC actual" value={deportista.imc_actual ? Number(deportista.imc_actual).toFixed(1) : "—"} />
            <KpiCard icon={TrendingUp} label="% Grasa corporal" value={deportista.porcentaje_grasa_actual ? `${deportista.porcentaje_grasa_actual}%` : "—"} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolución de Peso e IMC</CardTitle>
            </CardHeader>
            <CardContent>
              {datosGrafica.length < 2 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Se necesitan al menos 2 mediciones para mostrar la evolución.
                  Las nuevas mediciones se registran automáticamente al editar los datos físicos del deportista.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={datosGrafica}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 10% 88%)" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: "kg", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} label={{ value: "IMC", angle: 90, position: "insideRight", style: { fontSize: 11 } }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="peso" name="Peso (kg)" stroke="hsl(152, 60%, 28%)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="imc" name="IMC" stroke="hsl(25, 80%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de mediciones</CardTitle>
            </CardHeader>
            <CardContent>
              {mediciones.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Aún no hay mediciones registradas.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Peso (kg)</TableHead>
                      <TableHead>Estatura (m)</TableHead>
                      <TableHead>IMC</TableHead>
                      <TableHead>% Grasa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...mediciones].reverse().map((m, i) => (
                      <TableRow key={m.id || i}>
                        <TableCell>{formatFecha(m.fecha)}</TableCell>
                        <TableCell>{m.peso ?? "—"}</TableCell>
                        <TableCell>{m.estatura ?? "—"}</TableCell>
                        <TableCell>{m.imc ? Number(m.imc).toFixed(1) : "—"}</TableCell>
                        <TableCell>{m.porcentaje_grasa ? `${m.porcentaje_grasa}%` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MATRÍCULAS */}
        <TabsContent value="matriculas">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de matrículas ({matriculas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {matriculas.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Sin matrículas registradas.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha inicio</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matriculas.map((m, i) => (
                      <TableRow key={m.id || i}>
                        <TableCell>{formatFecha(m.fecha_inicio)}</TableCell>
                        <TableCell>{m.categoria || "—"}</TableCell>
                        <TableCell>{formatMoneda(m.valor)}</TableCell>
                        <TableCell>
                          <Badge variant={m.estado === "Activo" ? "default" : "outline"} className={m.estado === "Activo" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}>
                            {m.estado || "—"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MENSUALIDADES */}
        <TabsContent value="mensualidades">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de mensualidades ({mensualidades.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {mensualidades.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Sin mensualidades registradas.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mes</TableHead>
                      <TableHead>Año</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mensualidades.map((m, i) => (
                      <TableRow key={m.id || i}>
                        <TableCell>{meses[Number(m.mes) - 1] || m.mes}</TableCell>
                        <TableCell>{m.año}</TableCell>
                        <TableCell>{formatMoneda(m.valor)}</TableCell>
                        <TableCell>
                          <Badge variant={m.estado === "Activo" ? "default" : "outline"} className={m.estado === "Activo" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}>
                            {m.estado === "Activo" ? "Pagada" : (m.estado || "Pendiente")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASISTENCIAS */}
        <TabsContent value="asistencias">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de asistencias ({asistencias.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {asistencias.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Sin asistencias registradas.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Cancha</TableHead>
                      <TableHead>Asistencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asistencias.map((a, i) => (
                      <TableRow key={a.id || i}>
                        <TableCell>{formatFecha(a.fecha)}</TableCell>
                        <TableCell>{a.hora_inicio || "—"}{a.hora_fin ? ` - ${a.hora_fin}` : ""}</TableCell>
                        <TableCell>{a.cancha || "—"}</TableCell>
                        <TableCell>
                          <Badge className={a.estado === "Activo" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>
                            {a.estado === "Activo" ? "Presente" : "Ausente"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function Dato({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value || "—"}</span>
    </div>
  );
}
