import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Dumbbell, MapPin, Calendar, CreditCard } from "lucide-react";

function count(key: string) {
  try { return JSON.parse(localStorage.getItem(key) || "[]").length; } catch { return 0; }
}

const stats = [
  { label: "Personas", key: "academia_personas", icon: Users },
  { label: "Profesores", key: "academia_profesores", icon: GraduationCap },
  { label: "Deportistas", key: "academia_deportistas", icon: Dumbbell },
  { label: "Canchas", key: "academia_canchas", icon: MapPin },
  { label: "Entrenamientos", key: "academia_entrenamientos", icon: Calendar },
  { label: "Mensualidades", key: "academia_mensualidades", icon: CreditCard },
];

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
