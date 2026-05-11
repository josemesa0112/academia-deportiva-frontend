import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface AsistenciaItem {
  id_deportista: string;
  nombre: string;
  apellido: string;
  numero_documento: string;
  asistio: boolean;
}

export default function Asistencias() {
  const { toast } = useToast();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [entrenamientos, setEntrenamientos] = useState<any[]>([]);
  const [idEntrenamiento, setIdEntrenamiento] = useState("");
  const [deportistas, setDeportistas] = useState<AsistenciaItem[]>([]);
  const [loadingDeportistas, setLoadingDeportistas] = useState(false);

  useEffect(() => {
    fetchData()
    cargarEntrenamientos()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/asistencias")
      setData(res)
    } catch {
      toast({ title: "Error", description: "No se pudo cargar las asistencias", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const cargarEntrenamientos = async () => {
    const res = await api.get("/api/entrenamientos")
    setEntrenamientos(res)
  }

  const handleSeleccionarEntrenamiento = async (id: string) => {
    setIdEntrenamiento(id)
    setLoadingDeportistas(true)
    try {
      const entrenamiento = entrenamientos.find((e: any) => String(e.id) === id)
      if (!entrenamiento) return
      const deps = await api.get(`/api/deportistas/categoria/${entrenamiento.id_categoria}`)
      setDeportistas(deps.map((d: any) => ({
        id_deportista: String(d.id),
        nombre: d.nombre,
        apellido: d.apellido,
        numero_documento: d.numero_documento,
        asistio: false
      })))
    } catch {
      toast({ title: "Error", description: "No se pudo cargar los deportistas", variant: "destructive" })
    } finally {
      setLoadingDeportistas(false)
    }
  }

  const toggleAsistencia = (id: string) => {
    setDeportistas(prev => prev.map(d =>
      d.id_deportista === id ? { ...d, asistio: !d.asistio } : d
    ))
  }

  const handleGuardar = async () => {
    if (!idEntrenamiento || deportistas.length === 0) {
      toast({ title: "Error", description: "Selecciona un entrenamiento", variant: "destructive" })
      return
    }
    try {
      for (const d of deportistas) {
        await api.post("/api/asistencias", {
          id_deportista: d.id_deportista,
          id_entrenamiento: idEntrenamiento,
          id_estado: d.asistio ? "1" : "2"
        })
      }
      toast({ title: "Guardado", description: "Asistencias registradas correctamente" })
      fetchData()
      setOpen(false)
      setIdEntrenamiento("")
      setDeportistas([])
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  // Agrupar asistencias por entrenamiento
  const agrupadas = data.reduce((acc: any, row: any) => {
    const key = row.id_entrenamiento
    if (!acc[key]) {
      acc[key] = {
        id_entrenamiento: key,
        fecha: row.fecha,
        hora_inicio: row.hora_inicio,
        cancha: row.cancha,
        deportistas: []
      }
    }
    acc[key].deportistas.push(row)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Asistencias</h2>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Registrar asistencia
        </Button>
      </div>

      {/* Lista de entrenamientos con asistencias */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : Object.keys(agrupadas).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground rounded-lg border bg-card">
            No hay asistencias registradas. Haz clic en "Registrar asistencia" para comenzar.
          </div>
        ) : Object.values(agrupadas).map((grupo: any) => (
          <div key={grupo.id_entrenamiento} className="rounded-lg border bg-card overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">
                  {grupo.fecha?.split("T")[0] || "—"} — {grupo.hora_inicio || "—"}
                </p>
                <p className="text-xs text-muted-foreground">{grupo.cancha || "—"}</p>
              </div>
              <div className="ml-auto flex gap-2 text-xs">
                <span className="text-green-500 font-medium">
                  {grupo.deportistas.filter((d: any) => d.estado === "Activo").length} presentes
                </span>
                <span className="text-red-400 font-medium">
                  {grupo.deportistas.filter((d: any) => d.estado === "Inactivo").length} ausentes
                </span>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Asistencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grupo.deportistas.map((d: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{d.nombre || "—"}</TableCell>
                    <TableCell>{d.apellido || "—"}</TableCell>
                    <TableCell>
                      {d.estado === "Activo"
                        ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><Check className="h-3 w-3 mr-1" />Presente</Badge>
                        : <Badge variant="outline" className="text-red-400 border-red-400/20"><X className="h-3 w-3 mr-1" />Ausente</Badge>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>

      {/* Modal pase de lista */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setIdEntrenamiento(""); setDeportistas([]) } }}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Asistencia</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Entrenamiento</Label>
              <Select value={idEntrenamiento} onValueChange={handleSeleccionarEntrenamiento}>
                <SelectTrigger><SelectValue placeholder="Seleccionar entrenamiento" /></SelectTrigger>
                <SelectContent>
                  {entrenamientos.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.categoria} — {e.fecha?.split("T")[0]} {e.hora_inicio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingDeportistas && (
              <div className="text-center py-4 text-muted-foreground text-sm">Cargando deportistas...</div>
            )}

            {!loadingDeportistas && deportistas.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                <div className="p-3 bg-muted/30 border-b">
                  <p className="text-sm font-medium">Pase de lista — {deportistas.length} deportistas</p>
                  <p className="text-xs text-muted-foreground">Clic en cada deportista para marcar asistencia</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead className="text-center">Asistencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deportistas.map((d) => (
                      <TableRow
                        key={d.id_deportista}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleAsistencia(d.id_deportista)}
                      >
                        <TableCell className="font-medium">{d.nombre} {d.apellido}</TableCell>
                        <TableCell className="text-muted-foreground">{d.numero_documento}</TableCell>
                        <TableCell className="text-center">
                          {d.asistio
                            ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><Check className="h-3 w-3 mr-1" />Presente</Badge>
                            : <Badge variant="outline" className="text-red-400 border-red-400/20"><X className="h-3 w-3 mr-1" />Ausente</Badge>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-3 border-t bg-muted/30 flex gap-4 text-xs">
                  <span className="text-green-500 font-medium">{deportistas.filter(d => d.asistio).length} presentes</span>
                  <span className="text-red-400 font-medium">{deportistas.filter(d => !d.asistio).length} ausentes</span>
                </div>
              </div>
            )}

            {!loadingDeportistas && idEntrenamiento && deportistas.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No hay deportistas en esta categoría
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setIdEntrenamiento(""); setDeportistas([]) }}>Cancelar</Button>
            <Button onClick={handleGuardar} disabled={!idEntrenamiento || deportistas.length === 0}>
              Guardar asistencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
