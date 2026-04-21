import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, PlusCircle, MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "academia_compras";
const proveedores = ["Distribuciones ABC", "Deportes del Sur", "Textiles Pro", "Implementos JR"];
const productos = ["Balón de fútbol", "Uniforme completo", "Canilleras", "Guantes de portero", "Conos de entrenamiento"];

interface LineItem { producto: string; cantidad: string; precioUnit: string; }

function getStored(): Record<string, any>[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export default function Compras() {
  const { toast } = useToast();
  const [data, setData] = useState<Record<string, any>[]>(getStored);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [items, setItems] = useState<LineItem[]>([{ producto: "", cantidad: "", precioUnit: "" }]);

  const save = (d: Record<string, any>[]) => { setData(d); localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); };

  const openCreate = () => { setForm({}); setItems([{ producto: "", cantidad: "", precioUnit: "" }]); setEditIndex(null); setOpen(true); };
  const openEdit = (i: number) => {
    setForm({ proveedor: data[i].proveedor, fecha: data[i].fecha, estado: data[i].estado });
    setItems(data[i].items || [{ producto: "", cantidad: "", precioUnit: "" }]);
    setEditIndex(i);
    setOpen(true);
  };
  const handleDelete = (i: number) => { save(data.filter((_, idx) => idx !== i)); toast({ title: "Eliminado" }); };

  const total = items.reduce((s, it) => s + (parseFloat(it.cantidad) || 0) * (parseFloat(it.precioUnit) || 0), 0);

  const handleSubmit = () => {
    if (!form.proveedor || !form.fecha) { toast({ title: "Error", description: "Completa proveedor y fecha", variant: "destructive" }); return; }
    const record = { ...form, items, total: total.toString(), id: editIndex !== null ? data[editIndex].id : Date.now().toString() };
    const newData = [...data];
    if (editIndex !== null) { newData[editIndex] = record; } else { newData.push(record); }
    save(newData);
    toast({ title: editIndex !== null ? "Actualizado" : "Creado" });
    setOpen(false);
  };

  const updateItem = (idx: number, key: keyof LineItem, val: string) => {
    const newItems = [...items]; newItems[idx] = { ...newItems[idx], [key]: val }; setItems(newItems);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Compras</h2>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nueva</Button>
      </div>
      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Proveedor</TableHead><TableHead>Fecha</TableHead><TableHead>Total</TableHead><TableHead>Estado</TableHead>
            <TableHead className="w-[120px] text-right">Acciones</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No hay registros.</TableCell></TableRow>
            ) : data.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.proveedor || "—"}</TableCell>
                <TableCell>{row.fecha || "—"}</TableCell>
                <TableCell>${parseInt(row.total || "0").toLocaleString()}</TableCell>
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
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editIndex !== null ? "Editar" : "Nueva"} Compra</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Proveedor</Label>
                <Select value={form.proveedor || ""} onValueChange={v => setForm(p => ({ ...p, proveedor: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                  <SelectContent>{proveedores.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Fecha compra</Label>
                <Input type="date" value={form.fecha || ""} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select value={form.estado || ""} onValueChange={v => setForm(p => ({ ...p, estado: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Completada">Completada</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Detalle de productos</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { producto: "", cantidad: "", precioUnit: "" }])}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Agregar
                </Button>
              </div>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Producto</TableHead><TableHead>Cantidad</TableHead><TableHead>Precio unit.</TableHead><TableHead>Subtotal</TableHead><TableHead className="w-10"></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Select value={it.producto} onValueChange={v => updateItem(idx, "producto", v)}>
                            <SelectTrigger className="h-8"><SelectValue placeholder="Producto" /></SelectTrigger>
                            <SelectContent>{productos.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input type="number" className="h-8 w-20" value={it.cantidad} onChange={e => updateItem(idx, "cantidad", e.target.value)} /></TableCell>
                        <TableCell><Input type="number" className="h-8 w-24" value={it.precioUnit} onChange={e => updateItem(idx, "precioUnit", e.target.value)} /></TableCell>
                        <TableCell className="font-medium">${((parseFloat(it.cantidad) || 0) * (parseFloat(it.precioUnit) || 0)).toLocaleString()}</TableCell>
                        <TableCell>
                          {items.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setItems(items.filter((_, i2) => i2 !== idx))}><MinusCircle className="h-4 w-4 text-destructive" /></Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-right mt-2 font-bold text-lg">Total: ${total.toLocaleString()}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editIndex !== null ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
