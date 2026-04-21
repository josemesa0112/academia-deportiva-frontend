import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Dumbbell, MapPin, Calendar, CreditCard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

function count(key: string) {
  try { return JSON.parse(localStorage.getItem(key) || "[]").length; } catch { return 0; }
}

const stats = [
  { label: "Total Personas", key: "academia_personas", icon: Users },
  { label: "Profesores Activos", key: "academia_profesores", icon: GraduationCap },
  { label: "Deportistas Inscritos", key: "academia_deportistas", icon: Dumbbell },
  { label: "Entrenamientos Hoy", key: "academia_entrenamientos", icon: Calendar },
  { label: "Mensualidades Pendientes", key: "academia_mensualidades", icon: CreditCard },
  { label: "Canchas Registradas", key: "academia_canchas", icon: MapPin },
];

const ingresosData = [
  { mes: "Ene", ingresos: 2400000 },
  { mes: "Feb", ingresos: 2800000 },
  { mes: "Mar", ingresos: 3100000 },
  { mes: "Abr", ingresos: 2900000 },
  { mes: "May", ingresos: 3400000 },
  { mes: "Jun", ingresos: 3200000 },
];

const asistenciaData = [
  { dia: "Lun", asistencia: 28 },
  { dia: "Mar", asistencia: 32 },
  { dia: "Mié", asistencia: 25 },
  { dia: "Jue", asistencia: 30 },
  { dia: "Vie", asistencia: 35 },
  { dia: "Sáb", asistencia: 40 },
];

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map(s => (
          <Card key={s.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{count(s.key)}</div>
              <p className="text-xs text-muted-foreground mt-1">registros totales</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ingresosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 10% 88%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Ingresos"]} />
                <Bar dataKey="ingresos" fill="hsl(152, 60%, 28%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Asistencia Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={asistenciaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 10% 88%)" />
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [v, "Deportistas"]} />
                <Line type="monotone" dataKey="asistencia" stroke="hsl(152, 60%, 28%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
