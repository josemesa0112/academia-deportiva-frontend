import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, ClipboardList, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRol } from "@/hooks/useRol";
import api from "@/lib/api";

interface AsistenciaItem {
  id?: string;
  id_deportista: string;
  nombre: string;
  apellido: string;
  numero_documento: string;
  asistio: boolean;
}

export default function Asistencias() {
  const { toast } = useToast();
  const { userRol } = useRol();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [entrenamientos, setEntrenamientos] = useState<any[]>([]);
  const [idEntrenamiento, setIdEntrenamiento] = useState("");
  const [deportistas, setDeportistas] = useState<AsistenciaItem[]>([]);
  const [loadingDeportistas, setLoadingDeportistas] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

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

  // Abrir modal en modo edición cargando asistencias existentes
  const handleEditar = async (grupo: any) => {
    setModoEdicion(true)
    setIdEntrenamiento(String(grupo.id_entrenamiento))
    setLoadingDeportistas(true)
    setOpen(true)
    try {
      setDeportistas(grupo.deportistas.map((d: any) => ({
        id: String(d.id),
        id_deportista: String(d.id_deportista),
        nombre: d.nombre,
        apellido: d.apellido,
        numero_documento: d.numero_documento || "",
        asistio: d.estado === "Activo"
      })))
    } catch {
      toast({ title: "Error", description: "No se pudo cargar la asistencia", variant: "destructive" })
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
      if (modoEdicion) {
        // Actualizar registros existentes
        for (const d of deportistas) {
          if (d.id) {
            await api.put(`/api/asistencias/${d.id}`, {
              id_deportista: d.id_deportista,
              id_entrenamiento: idEntrenamiento,
              id_estado: d.asistio ? "1" : "2"
            })
          }
        }
        toast({ title: "Actualizado", description: "Asistencias actualizadas correctamente" })
      } else {
        // Crear nuevos registros
        for (const d of deportistas) {
          await api.post("/api/asistencias", {
            id_deportista: d.id_deportista,
            id_entrenamiento: idEntrenamiento,
            id_estado: d.asistio ? "1" : "2"
          })
        }
        toast({ title: "Guardado", description: "Asistencias registradas correctamente" })
      }
      fetchData()
      cerrarModal()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const cerrarModal = () => {
    setOpen(false)
    setModoEdicion(false)
    setIdEntrenamiento("")
    setDeportistas([])
  }

  // Filtro por categoría según el rol:
  //   - Admin (rol 1): ve todo.
  //   - Profesor (rol 2): solo sus categorías asignadas.
  //   - Deportista (rol 3): solo su propia categoría.
  let idsCategoriaPermitidas: Set<number> | null = null
  if (userRol?.id_rol === 2) {
    idsCategoriaPermitidas = new Set((userRol.profesor_categorias || []).map(c => Number(c.id)))
  } else if (userRol?.id_rol === 3) {
    const idCat = userRol.deportista_info?.id_categoria
    idsCategoriaPermitidas = new Set(idCat ? [Number(idCat)] : [])
  }

  const profesorSinCategorias = userRol?.id_rol === 2 && (idsCategoriaPermitidas?.size === 0)
  const deportistaSinCategoria = userRol?.id_rol === 3 && (idsCategoriaPermitidas?.size === 0)
  // Solo Admin y Profesor (con categorías) pueden registrar asistencias.
  const puedeRegistrarAsistencia =
    userRol?.id_rol === 1 || (userRol?.id_rol === 2 && !profesorSinCategorias)

  const dataFiltrada = idsCategoriaPermitidas
    ? data.filter((row: any) => {
        // Necesitamos saber la categoría del entrenamiento de cada asistencia.
        // El backend ya envía row.categoria como nombre, pero no id_categoria.
        // Lo derivamos buscando en la lista de entrenamientos cargados.
        const entrenamiento = entrenamientos.find((e: any) => Number(e.id) === Number(row.id_entrenamiento))
        return entrenamiento && idsCategoriaPermitidas.has(Number(entrenamiento.id_categoria))
      })
    : data

  // Agrupar asistencias por entrenamiento (después de filtrar por rol)
  const agrupadas = dataFiltrada.reduce((acc: any, row: any) => {
    const key = row.id_entrenamiento
    if (!acc[key]) {
      acc[key] = {
        id_entrenamiento: key,
        fecha: row.fecha,
        hora_inicio: row.hora_inicio,
        hora_fin: row.hora_fin,
        cancha: row.cancha,
        categoria: row.categoria,
        deportistas: []
      }
    }
    acc[key].deportistas.push(row)
    return acc
  }, {})

  // Entrenamientos disponibles para crear asistencia: solo los que NO
  // tienen ya un grupo de asistencias asociado (no tiene sentido duplicar),
  // y para profesor solo los de sus categorías.
  const idsConAsistencia = new Set(data.map((r: any) => Number(r.id_entrenamiento)))
  const entrenamientosDisponibles = entrenamientos.filter((e: any) => {
    if (idsConAsistencia.has(Number(e.id))) return false
    if (idsCategoriaPermitidas && !idsCategoriaPermitidas.has(Number(e.id_categoria))) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Asistencias</h2>
        {puedeRegistrarAsistencia && (
          <Button onClick={() => { setModoEdicion(false); setOpen(true) }} className="gap-2">
            <Plus className="h-4 w-4" /> Registrar asistencia
          </Button>
        )}
      </div>

      {/* Lista de entrenamientos con asistencias */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : Object.keys(agrupadas).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground rounded-lg border bg-card">
            {profesorSinCategorias
              ? "No tienes categorías asignadas. Contacta al administrador para que te asigne las categorías que entrenarás."
              : deportistaSinCategoria
              ? "Tu cuenta no tiene una categoría asignada. Contacta al administrador."
              : userRol?.id_rol === 3
              ? "Aún no hay asistencias registradas en tu categoría."
              : "No hay asistencias registradas. Haz clic en \"Registrar asistencia\" para comenzar."}
          </div>
        ) : Object.values(agrupadas).map((grupo: any) => {
          const groupKey = String(grupo.id_entrenamiento);
          const isCollapsed = collapsedGroups.has(groupKey);
          return (
          <div key={groupKey} className="rounded-lg border bg-card overflow-hidden">
            <div className="border-b bg-muted/30 flex items-center gap-3 hover:bg-muted/50 transition-colors">
              <button
                type="button"
                onClick={() => toggleGroup(groupKey)}
                aria-expanded={!isCollapsed}
                className="flex-1 flex items-center gap-3 p-4 text-left"
              >
                {isCollapsed
                  ? <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {grupo.categoria || "Sin categoría"} · {grupo.fecha?.split("T")[0] || "—"} · {grupo.hora_inicio || "—"}{grupo.hora_fin ? ` – ${grupo.hora_fin}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{grupo.cancha || "—"}</p>
                </div>
              </button>
              <div className="flex items-center gap-3 pr-4">
                <span className="text-green-500 font-medium text-xs">
                  {grupo.deportistas.filter((d: any) => d.estado === "Activo").length} presentes
                </span>
                <span className="text-red-400 font-medium text-xs">
                  {grupo.deportistas.filter((d: any) => d.estado === "Inactivo").length} ausentes
                </span>
                {/* Botón editar */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEditar(grupo)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {!isCollapsed && (
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
            )}
          </div>
          );
        })}
      </div>

      {/* Modal pase de lista */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) cerrarModal() }}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modoEdicion ? "Editar" : "Registrar"} Asistencia</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">

            {/* Selector de entrenamiento solo en modo creación.
                Solo muestra entrenamientos SIN asistencia registrada — para
                cambiar una existente se usa el botón Editar del grupo. */}
            {!modoEdicion && (
              <div className="grid gap-2">
                <Label>Entrenamiento</Label>
                {entrenamientosDisponibles.length === 0 ? (
                  <div className="rounded-md border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
                    Todos los entrenamientos ya tienen asistencia registrada.
                    Usa el botón <span className="font-medium">Editar</span> de cada grupo para modificarla.
                  </div>
                ) : (
                  <Select value={idEntrenamiento} onValueChange={handleSeleccionarEntrenamiento}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar entrenamiento" /></SelectTrigger>
                    <SelectContent>
                      {entrenamientosDisponibles.map((e: any) => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.categoria} · {e.fecha?.split("T")[0]} · {e.hora_inicio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {loadingDeportistas && (
              <div className="text-center py-4 text-muted-foreground text-sm">Cargando deportistas...</div>
            )}

            {!loadingDeportistas && deportistas.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                <div className="p-3 bg-muted/30 border-b">
                  <p className="text-sm font-medium">Pase de lista — {deportistas.length} deportistas</p>
                  <p className="text-xs text-muted-foreground">Clic en cada deportista para cambiar asistencia</p>
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
            <Button variant="outline" onClick={cerrarModal}>Cancelar</Button>
            <Button onClick={handleGuardar} disabled={!idEntrenamiento || deportistas.length === 0}>
              {modoEdicion ? "Actualizar" : "Guardar"} asistencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}