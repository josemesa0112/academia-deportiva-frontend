import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "academia_deportistas";

function getStored(): Record<string, string>[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

const categorias = ["Sub-7","Sub-9","Sub-11","Sub-13","Sub-15","Sub-17","Sub-20","Mayores"];
const clasificaciones = ["Recreativo","Competitivo","Alto Rendimiento"];
const posiciones = ["Portero","Defensa","Mediocampista","Delantero"];
const personas = ["Santiago Muñoz","Valentina Torres","Diego Herrera","Camila Ríos","Mateo Salazar"];

const historialMock = [
  { anio: "2023", peso: "45", estatura: "1.55", imc: "18.7", clasificacion: "Competitivo" },
  { anio: "2024", peso: "50", estatura: "1.62", imc: "19.1", clasificacion: "Competitivo" },
  { anio: "2025", peso: "55", estatura: "1.68", imc: "19.5", clasificacion: "Alto Rendimiento" },
];

export default function Deportistas() {
  const { toast } = useToast();
  const [data, setData] = useState<Record<string, string>[]>(getStored);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const save = (d: Record<string, string>[]) => { setData(d); localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); };
  const openCreate = () => { setForm({}); setEditIndex(null); setOpen(true); };
  const openEdit = (i: number) => { setForm({ ...data[i] }); setEditIndex(i); setOpen(true); };
  const handleDelete = (i: number) => { save(data.filter((_, idx) => idx !== i)); toast({ title: "Eliminado", description: "Registro eliminado" }); };

  const handleSubmit = () => {
    if (!form.persona || !form.categoria) {
      toast({ title: "Error", description: "Completa los campos requeridos", variant: "destructive" });
      return;
    }
    const imc = form.peso && form.estatura ? (parseFloat(form.peso) / Math.pow(parseFloat(form.estatura), 2)).toFixed(1) : "";
    const newForm = { ...form, imc };
    const newData = [...data];
    if (editIndex !== null) { newData[editIndex] = newForm; } else { newData.push({ ...newForm, id: Date.now().toString() }); }
    save(newData);
    toast({ title: editIndex !== null ? "Actualizado" : "Creado", description: "Registro guardado correctamente" });
    setOpen(false);
  };

  const togglePos = (pos: string) => {
    const selected = (form.posiciones || "").split(",").filter(Boolean);
    const newSelected = selected.includes(pos) ? selected.filter(s => s !== pos) : [...selected, pos];
    setForm(prev => ({ ...prev, posiciones: newSelected.join(",") }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Deportistas</h2>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nuevo</Button>
      </div>
      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Clasificación</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Estatura</TableHead>
              <TableHead>Mensualidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No hay registros. Haz clic en "Nuevo" para agregar uno.</TableCell></TableRow>
            ) : data.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.persona || "—"}</TableCell>
                <TableCell>{row.categoria || "—"}</TableCell>
                <TableCell>{row.clasificacion || "—"}</TableCell>
                <TableCell>{row.peso ? `${row.peso} kg` : "—"}</TableCell>
                <TableCell>{row.estatura ? `${row.estatura} m` : "—"}</TableCell>
                <TableCell>{row.mensualidad ? `$${parseInt(row.mensualidad).toLocaleString()}` : "—"}</TableCell>
                <TableCell>{row.estado || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(i)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Editar" : "Nuevo"} Deportista</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="fisico">Estado Físico</TabsTrigger>
              <TabsTrigger value="posiciones">Posiciones</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="grid gap-4 pt-4">
              <div className="grid gap-2">
                <Label>Persona</Label>
                <Select value={form.persona || ""} onValueChange={v => setForm(p => ({ ...p, persona: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar persona" /></SelectTrigger>
                  <SelectContent>{personas.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <Select value={form.categoria || ""} onValueChange={v => setForm(p => ({ ...p, categoria: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                  <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Clasificación</Label>
                <Select value={form.clasificacion || ""} onValueChange={v => setForm(p => ({ ...p, clasificacion: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar clasificación" /></SelectTrigger>
                  <SelectContent>{clasificaciones.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Mensualidad</Label>
                <Input type="number" placeholder="150000" value={form.mensualidad || ""} onChange={e => setForm(p => ({ ...p, mensualidad: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Select value={form.estado || ""} onValueChange={v => setForm(p => ({ ...p, estado: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="fisico" className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Peso actual (kg)</Label>
                  <Input type="number" placeholder="55" value={form.peso || ""} onChange={e => setForm(p => ({ ...p, peso: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Estatura actual (m)</Label>
                  <Input type="number" step="0.01" placeholder="1.68" value={form.estatura || ""} onChange={e => setForm(p => ({ ...p, estatura: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>IMC</Label>
                  <Input readOnly value={form.peso && form.estatura ? (parseFloat(form.peso) / Math.pow(parseFloat(form.estatura), 2)).toFixed(1) : "—"} className="bg-muted" />
                </div>
                <div className="grid gap-2">
                  <Label>% Grasa corporal</Label>
                  <Input type="number" placeholder="15" value={form.grasa || ""} onChange={e => setForm(p => ({ ...p, grasa: e.target.value }))} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="posiciones" className="pt-4">
              <p className="text-sm text-muted-foreground mb-3">Selecciona las posiciones del deportista:</p>
              <div className="flex flex-wrap gap-3">
                {posiciones.map(pos => {
                  const selected = (form.posiciones || "").split(",").includes(pos);
                  return (
                    <Badge key={pos} variant={selected ? "default" : "outline"} className="cursor-pointer text-sm px-4 py-2 select-none" onClick={() => togglePos(pos)}>
                      {pos}
                    </Badge>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="historial" className="pt-4">
              <p className="text-sm text-muted-foreground mb-3">Historial de mediciones del deportista:</p>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Año</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead>Estatura</TableHead>
                      <TableHead>IMC</TableHead>
                      <TableHead>Clasificación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historialMock.map((h, i) => (
                      <TableRow key={i}>
                        <TableCell>{h.anio}</TableCell>
                        <TableCell>{h.peso} kg</TableCell>
                        <TableCell>{h.estatura} m</TableCell>
                        <TableCell>{h.imc}</TableCell>
                        <TableCell>{h.clasificacion}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editIndex !== null ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
