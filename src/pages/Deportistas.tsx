import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, X, AlertCircle, UserPlus, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const SORT_OPTIONS = [
  { key: "nombre", label: "Nombre (A-Z)" },
  { key: "apellido", label: "Apellido (A-Z)" },
  { key: "categoria", label: "Categoría (A-Z)" },
] as const;

export default function Deportistas() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [personasRol3, setPersonasRol3] = useState<Record<string, any>[]>([]);
  const [opciones, setOpciones] = useState({
    personas: [], categorias: [], clasificaciones: [], posiciones: [], estados: []
  });

  const personasPendientes = useMemo(() => {
    if (personasRol3.length === 0) return [];
    const idsConRegistro = new Set(
      data.map(d => Number(d.id_persona)).filter(n => !Number.isNaN(n))
    );
    return personasRol3.filter(p => !idsConRegistro.has(Number(p.id)));
  }, [data, personasRol3]);

  const filteredData = useMemo(() => {
    let result = data;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(row =>
        ["nombre", "apellido", "numero_documento"].some(f => {
          const v = row[f];
          return v !== null && v !== undefined && String(v).toLowerCase().includes(q);
        })
      );
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (!av && !bv) return 0;
        if (!av) return 1;
        if (!bv) return -1;
        return String(av).localeCompare(String(bv), "es", { sensitivity: "base" });
      });
    }
    return result;
  }, [data, searchQuery, sortKey]);

  useEffect(() => {
    cargarOpciones()
    fetchData()
  }, [])

  const cargarOpciones = async () => {
    const [personas, categorias, clasificaciones, posiciones, estados] = await Promise.all([
      api.get("/api/personas"),
      api.get("/api/catalogos/categorias"),
      api.get("/api/catalogos/clasificaciones"),
      api.get("/api/catalogos/posiciones"),
      api.get("/api/catalogos/estados"),
    ])
    const clasificacionesPermitidas = ["bajo en grasa", "saludable", "sobrepeso"]
    const soloRol3 = personas.filter((p: any) => p.id_rol === 3)
    setPersonasRol3(soloRol3)
    setOpciones({
      // ← Solo personas con rol Deportista (id_rol = 3)
      personas: soloRol3
        .map((p: any) => ({ value: String(p.id), label: `${p.nombre} ${p.apellido}` })),
      categorias: categorias.map((c: any) => ({ value: String(c.id), label: c.nombre })),
      // Solo muestra las 3 clasificaciones por composición corporal
      clasificaciones: clasificaciones
        .filter((c: any) => clasificacionesPermitidas.includes(String(c.nombre).trim().toLowerCase()))
        .map((c: any) => ({ value: String(c.id), label: c.nombre })),
      posiciones: posiciones.map((p: any) => ({ value: String(p.id), label: p.nombre })),
      estados: estados.map((e: any) => ({ value: String(e.id), label: e.nombre })),
    })
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/deportistas")
      setData(res)
    } catch {
      toast({ title: "Error", description: "No se pudo cargar los deportistas", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => { setForm({}); setEditId(null); setOpen(true) }

  const openCompletar = (persona: Record<string, any>) => {
    setForm({ id_persona: String(persona.id) })
    setEditId(null)
    setOpen(true)
  }

  // ← Convertir todos los IDs a string para que los selects funcionen al editar
  const openEdit = async (row: any) => {
    // Cargar posiciones actuales del deportista desde el backend
    let posicionesStr = ""
    try {
      const posData = await api.get(`/api/deportistas/${row.id}/posiciones`)
      if (Array.isArray(posData)) {
        posicionesStr = posData.map((p: any) => String(p.id)).join(",")
      }
    } catch {
      // si falla, deja vacío — el usuario puede agregarlas manualmente
    }
    setForm({
      id_persona: String(row.id_persona),
      id_categoria: String(row.id_categoria),
      id_clasificacion: String(row.id_clasificacion),
      id_estado: String(row.id_estado),
      peso_actual: String(row.peso_actual || ""),
      estatura_actual: String(row.estatura_actual || ""),
      IMC_actual: String(row.imc_actual || ""),
      porcentaje_grasa_actual: String(row.porcentaje_grasa_actual || ""),
      valor_mensualidad: String(row.valor_mensualidad || ""),
      posiciones: posicionesStr,
    })
    setEditId(String(row.id))
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/deportistas/${id}`)
      toast({ title: "Desactivado", description: "Deportista desactivado correctamente" })
      fetchData()
    } catch {
      toast({ title: "Error", description: "No se pudo desactivar", variant: "destructive" })
    }
  }

  const handleSubmit = async () => {
    if (!form.id_persona || !form.id_categoria || !form.id_estado) {
      toast({ title: "Error", description: "Completa los campos obligatorios", variant: "destructive" })
      return
    }
    const imc = form.peso_actual && form.estatura_actual
      ? (parseFloat(form.peso_actual) / Math.pow(parseFloat(form.estatura_actual), 2)).toFixed(2)
      : form.IMC_actual || "0"
    const payload = { ...form, IMC_actual: imc }
    try {
      if (editId) {
        await api.put(`/api/deportistas/${editId}`, payload)
        toast({ title: "Actualizado", description: "Deportista actualizado correctamente" })
      } else {
        await api.post("/api/deportistas", payload)
        toast({ title: "Creado", description: "Deportista creado correctamente" })
      }
      fetchData()
      setOpen(false)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const togglePos = (val: string) => {
    const selected = (form.posiciones || "").split(",").filter(Boolean)
    const newSelected = selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val]
    setForm(prev => ({ ...prev, posiciones: newSelected.join(",") }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Deportistas</h2>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nuevo</Button>
      </div>

      {personasPendientes.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold">
              {personasPendientes.length}{" "}
              {personasPendientes.length === 1 ? "persona pendiente" : "personas pendientes"} de completar como deportista
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {personasPendientes.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-md border bg-card px-3 py-2 text-sm">
                <div className="flex flex-col leading-tight">
                  <span className="font-medium">{p.nombre} {p.apellido}</span>
                  <span className="text-muted-foreground text-xs">{p.numero_documento || "—"}</span>
                </div>
                <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => openCompletar(p)}>
                  <UserPlus className="h-3 w-3" /> Completar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por nombre o número de documento..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={sortKey || "__none__"} onValueChange={v => setSortKey(v === "__none__" ? "" : v)}>
          <SelectTrigger className="sm:w-64"><SelectValue placeholder="Ordenar por..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Sin orden</SelectItem>
            {SORT_OPTIONS.map(o => (
              <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Clasificación</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Estatura</TableHead>
              <TableHead>Mensualidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No hay registros.</TableCell></TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No hay coincidencias con la búsqueda.</TableCell></TableRow>
            ) : filteredData.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.nombre || "—"}</TableCell>
                <TableCell>{row.apellido || "—"}</TableCell>
                <TableCell>{row.categoria || "—"}</TableCell>
                <TableCell>{row.clasificacion || "—"}</TableCell>
                <TableCell>{row.peso_actual ? `${row.peso_actual} kg` : "—"}</TableCell>
                <TableCell>{row.estatura_actual ? `${row.estatura_actual} m` : "—"}</TableCell>
                <TableCell>{row.valor_mensualidad ? `$${parseInt(row.valor_mensualidad).toLocaleString()}` : "—"}</TableCell>
                <TableCell>{row.estado || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate(`/deportistas/${row.id}`)}>
                    <User className="h-4 w-4" /> Perfil
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(String(row.id))} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar" : "Nuevo"} Deportista</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="fisico">Estado Físico</TabsTrigger>
              <TabsTrigger value="posiciones">Posiciones</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="grid gap-4 pt-4">
              <div className="grid gap-2">
                <Label>Persona</Label>
                <Select value={form.id_persona || ""} onValueChange={v => setForm(p => ({ ...p, id_persona: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar persona" /></SelectTrigger>
                  <SelectContent>{(opciones.personas as any[]).map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <Select value={form.id_categoria || ""} onValueChange={v => setForm(p => ({ ...p, id_categoria: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                  <SelectContent>{(opciones.categorias as any[]).map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Clasificación</Label>
                <Select value={form.id_clasificacion || ""} onValueChange={v => setForm(p => ({ ...p, id_clasificacion: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar clasificación" /></SelectTrigger>
                  <SelectContent>{(opciones.clasificaciones as any[]).map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Valor mensualidad</Label>
                <Input type="number" placeholder="150000" value={form.valor_mensualidad || ""} onChange={e => setForm(p => ({ ...p, valor_mensualidad: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Select value={form.id_estado || ""} onValueChange={v => setForm(p => ({ ...p, id_estado: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                  <SelectContent>{(opciones.estados as any[]).map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="fisico" className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Peso actual (kg)</Label>
                  <Input type="number" placeholder="55" value={form.peso_actual || ""} onChange={e => setForm(p => ({ ...p, peso_actual: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Estatura actual (m)</Label>
                  <Input type="number" step="0.01" placeholder="1.68" value={form.estatura_actual || ""} onChange={e => setForm(p => ({ ...p, estatura_actual: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>IMC (calculado)</Label>
                  <Input readOnly value={form.peso_actual && form.estatura_actual ? (parseFloat(form.peso_actual) / Math.pow(parseFloat(form.estatura_actual), 2)).toFixed(2) : "—"} className="bg-muted" />
                </div>
                <div className="grid gap-2">
                  <Label>% Grasa corporal</Label>
                  <Input type="number" placeholder="15" value={form.porcentaje_grasa_actual || ""} onChange={e => setForm(p => ({ ...p, porcentaje_grasa_actual: e.target.value }))} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="posiciones" className="pt-4">
              <p className="text-sm text-muted-foreground mb-3">Selecciona las posiciones del deportista:</p>
              <div className="flex flex-wrap gap-3">
                {(opciones.posiciones as any[]).map(pos => {
                  const selected = (form.posiciones || "").split(",").includes(pos.value)
                  return (
                    <Badge key={pos.value} variant={selected ? "default" : "outline"} className="cursor-pointer text-sm px-4 py-2 select-none" onClick={() => togglePos(pos.value)}>
                      {pos.label}
                    </Badge>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editId ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
