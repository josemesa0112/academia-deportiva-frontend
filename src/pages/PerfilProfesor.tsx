import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, Mail, Phone, IdCard, CalendarDays, GraduationCap,
  Users, Wallet, ClipboardList,
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const formatFecha = (val: any) => {
  if (!val) return "—";
  const s = String(val);
  return s.includes("T") ? s.split("T")[0] : s;
};

const formatMoneda = (v: any) =>
  v ? `$${parseInt(String(v)).toLocaleString()}` : "—";

const iniciales = (nombre = "", apellido = "") =>
  ((nombre[0] || "") + (apellido[0] || "")).toUpperCase() || "?";

export default function PerfilProfesor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profesor, setProfesor] = useState<any | null>(null);
  const [entrenamientos, setEntrenamientos] = useState<any[]>([]);
  const [deportistas, setDeportistas] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    (async () => {
      try {
        setLoading(true);
        const [pr, ents, deps] = await Promise.all([
          api.get(`/api/profesores/${id}`),
          api.get("/api/entrenamientos").catch(() => []),
          api.get("/api/deportistas").catch(() => []),
        ]);
        if (cancelado) return;
        setProfesor(pr);
        setEntrenamientos(Array.isArray(ents) ? ents : []);
        setDeportistas(Array.isArray(deps) ? deps : []);
      } catch (err: any) {
        toast({ title: "Error", description: err?.message || "No se pudo cargar el perfil", variant: "destructive" });
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => { cancelado = true; };
  }, [id, toast]);

  // IDs de las categorías del profesor (para filtrar entrenamientos y deportistas)
  const idsCategorias = useMemo(() => {
    if (!profesor?.categorias) return new Set<number>();
    return new Set(profesor.categorias.map((c: any) => Number(c.id)));
  }, [profesor]);

  // Próximos entrenamientos: solo categorías del profesor + fecha desde hoy
  const proximosEntrenamientos = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return entrenamientos
      .filter(e => idsCategorias.has(Number(e.id_categoria)))
      .filter(e => {
        if (!e.fecha) return false;
        const fechaEnt = new Date(String(e.fecha).split("T")[0]);
        return fechaEnt >= hoy;
      })
      .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))
      .slice(0, 10);
  }, [entrenamientos, idsCategorias]);

  // Deportistas en las categorías del profesor (activos)
  const deportistasDelProfesor = useMemo(() => {
    return deportistas.filter(d =>
      idsCategorias.has(Number(d.id_categoria)) && d.id_estado === 1
    );
  }, [deportistas, idsCategorias]);

  // Conteo de deportistas por cada categoría del profesor
  const deportistasPorCategoria = useMemo(() => {
    const map = new Map<number, number>();
    deportistasDelProfesor.forEach(d => {
      const k = Number(d.id_categoria);
      map.set(k, (map.get(k) || 0) + 1);
    });
    return map;
  }, [deportistasDelProfesor]);

  // KPIs
  const totalEntrenamientosFuturos = proximosEntrenamientos.length;
  const totalDeportistas = deportistasDelProfesor.length;
  const totalCategorias = profesor?.categorias?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        Cargando perfil...
      </div>
    );
  }

  if (!profesor) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-muted-foreground">No se encontró el profesor.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
            {iniciales(profesor.nombre, profesor.apellido)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profesor.nombre} {profesor.apellido}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
              {profesor.numero_documento && (
                <span className="inline-flex items-center gap-1"><IdCard className="h-3 w-3" />{profesor.numero_documento}</span>
              )}
              {profesor.correo && (
                <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{profesor.correo}</span>
              )}
              {profesor.numero_telefono && (
                <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{profesor.numero_telefono}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary">Profesor</Badge>
              {profesor.categorias?.map((c: any) => (
                <Badge key={c.id} variant="default">{c.nombre}</Badge>
              ))}
              {profesor.estado && (
                <Badge
                  variant={profesor.estado === "Activo" ? "default" : "outline"}
                  className={profesor.estado === "Activo" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                >
                  {profesor.estado}
                </Badge>
              )}
            </div>
          </div>
          {profesor.salario && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Salario</div>
              <div className="text-2xl font-bold">{formatMoneda(profesor.salario)}</div>
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <KpiCard icon={GraduationCap} label="Categorías a cargo" value={String(totalCategorias)} />
        <KpiCard icon={Users} label="Deportistas a cargo" value={String(totalDeportistas)} />
        <KpiCard icon={ClipboardList} label="Entrenamientos próximos" value={String(totalEntrenamientosFuturos)} />
      </div>

      {/* Datos personales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos personales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <Dato label="Nombre completo" value={`${profesor.nombre || ""} ${profesor.apellido || ""}`} />
          <Dato label="Documento" value={profesor.numero_documento} />
          <Dato label="Correo" value={profesor.correo} />
          <Dato label="Teléfono" value={profesor.numero_telefono} />
          <Dato label="Fecha de nacimiento" value={formatFecha(profesor.fecha_nacimiento)} />
          <Dato label="Estado" value={profesor.estado} />
        </CardContent>
      </Card>

      {/* Información laboral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Información laboral
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <Dato label="Salario mensual" value={formatMoneda(profesor.salario)} />
          <Dato label="Estado en la academia" value={profesor.estado} />
        </CardContent>
      </Card>

      {/* Categorías a cargo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Categorías a cargo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!profesor.categorias?.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aún no tienes categorías asignadas. Contacta al administrador.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {profesor.categorias.map((c: any) => (
                <div key={c.id} className="rounded-md border bg-muted/30 p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {deportistasPorCategoria.get(c.id) || 0} deportistas activos
                    </p>
                  </div>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximos entrenamientos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Próximos entrenamientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proximosEntrenamientos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay entrenamientos programados próximamente en tus categorías.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Cancha</TableHead>
                  <TableHead>Horario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proximosEntrenamientos.map(e => {
                  const fecha = new Date(String(e.fecha).split("T")[0]);
                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <span className="font-medium">{diasSemana[fecha.getDay()]} {fecha.getDate()}/{fecha.getMonth() + 1}</span>
                      </TableCell>
                      <TableCell>{e.categoria || "—"}</TableCell>
                      <TableCell>{e.cancha || "—"}</TableCell>
                      <TableCell>{e.hora_inicio?.slice(0, 5) || "—"} – {e.hora_fin?.slice(0, 5) || "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
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
