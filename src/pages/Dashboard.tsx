import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Dumbbell, MapPin, Calendar, CreditCard } from "lucide-react";
import api from "@/lib/api";

type Stat = {
  label: string;
  endpoint: string;
  icon: typeof Users;
  filter?: (items: any[]) => number;
};

const hoy = () => new Date().toISOString().slice(0, 10);

const stats: Stat[] = [
  { label: "Total Personas", endpoint: "/api/personas", icon: Users },
  { label: "Total Profesores", endpoint: "/api/profesores", icon: GraduationCap },
  { label: "Total Deportistas", endpoint: "/api/deportistas", icon: Dumbbell },
  {
    label: "Entrenamientos Hoy",
    endpoint: "/api/entrenamientos",
    icon: Calendar,
    filter: (items) => items.filter((e: any) => String(e.fecha).slice(0, 10) === hoy()).length,
  },
  {
    label: "Mensualidades Pendientes",
    endpoint: "/api/mensualidades",
    icon: CreditCard,
    filter: (items) => items.filter((m: any) => !m.fecha_pago).length,
  },
  { label: "Canchas Registradas", endpoint: "/api/canchas", icon: MapPin },
];

export default function Dashboard() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const resultados = await Promise.all(
          stats.map(async (s) => {
            const data = await api.get(s.endpoint);
            const items = Array.isArray(data) ? data : [];
            return [s.endpoint, s.filter ? s.filter(items) : items.length] as const;
          })
        );
        if (!cancelado) setCounts(Object.fromEntries(resultados));
      } catch (e: any) {
        if (!cancelado) setError(e?.message || "Error cargando datos");
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const valor = counts[s.endpoint];
          return (
            <Card key={s.endpoint}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{valor ?? "…"}</div>
                <p className="text-xs text-muted-foreground mt-1">registros totales</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
