import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, PlusCircle, MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface LineItem { id_producto: string; cantidad_productos: string; precio: string; }

export default function Compras() {
  const { toast } = useToast();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [items, setItems] = useState<LineItem[]>([{ id_producto: "", cantidad_productos: "", precio: "" }]);
  const [opciones, setOpciones] = useState({ proveedores: [], productos: [], estados: [] });

  useEffect(() => { cargarOpciones(); fetchData(); }, []);

  const cargarOpciones = async () => {
    const [proveedores, productos, estados] = await Promise.all([
      api.get("/api/proveedores"),
      api.get("/api/productos"),
      api.get("/api/catalogos/estados"),
    ]);
    setOpciones({
      proveedores: proveedores.map((p: any) => ({ value: String(p.id), label: `${p.nombre} ${p.apellido}` })),
      productos: productos.map((p: any) => ({ value: String(p.id), label: p.nombre_producto })),
      estados: estados.map((e: any) => ({ value: String(e.id), label: e.nombre })),
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/compras");
      setData(res);
    } catch {
      toast({ title: "Error", description: "No se pudo cargar las compras", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const total = items.reduce((s, it) => s + (parseFloat(it.cantidad_productos) || 0) * (parseFloat(it.precio) || 0), 0);

  const openCreate = () => {
    setForm({});
    setItems([{ id_producto: "", cantidad_productos: "", precio: "" }]);
    setEditId(null);
    setOpen(true);
  };

  const openEdit = (row: any) => {
    setForm({ id_proveedor: String(row.id_proveedor), fecha_compra: row.fecha_compra?.split("T")[0], id_estado: String(row.id_estado) });
    setItems(row.productos?.map((p: any) => ({ id_producto: String(p.id_producto), cantidad_productos: String(p.cantidad_productos), precio: String(p.precio) })) || [{ id_producto: "", cantidad_productos: "", precio: "" }]);
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/compras/${id}`);
      toast({ title: "Desactivado", description: "Compra desactivada correctamente" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "No se pudo desactivar", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!form.id_proveedor || !form.fecha_compra) {
      toast({ title: "Error", description: "Completa proveedor y fecha", variant: "destructive" });
      return;
    }
    try {
      const payload = { ...form, total_compra: total.toString() };
      let compraId = editId;
      if (editId) {
        await api.put(`/api/compras/${editId}`, payload);
      } else {
        const res = await api.post("/api/compras", payload);
        compraId = res.id;
      }
      for (const item of items) {
        if (item.id_producto && item.cantidad_productos && item.precio) {
          await api.post("/api/compras/productos", { ...item, id_compra: compraId });
        }
      }
      toast({ title: editId ? "Actualizado" : "Creado", description: "Compra guardada correctamente" });
      fetchData();
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateItem = (idx: number, key: keyof LineItem, val: string) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [key]: val };
    setItems(newItems);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Compras</h2>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nueva</Button>
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proveedor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Cargando...</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay registros.</TableCell></TableRow>
            ) : data.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.nombre_proveedor} {row.apellido_proveedor}</TableCell>
                <TableCell>{row.fecha_compra?.split("T")[0] || "—"}</TableCell>
                <TableCell>${parseInt(row.total_compra || "0").toLocaleString()}</TableCell>
                <TableCell>{row.estado || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Editar" : "Nueva"} Compra</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Proveedor</Label>
                <Select value={form.id_proveedor || ""} onValueChange={v => setForm(p => ({ ...p, id_proveedor: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                  <SelectContent>{(opciones.proveedores as any[]).map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Fecha compra</Label>
                <Input type="date" value={form.fecha_compra || ""} onChange={e => setForm(p => ({ ...p, fecha_compra: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select value={form.id_estado || ""} onValueChange={v => setForm(p => ({ ...p, id_estado: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent>{(opciones.estados as any[]).map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Detalle de productos</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { id_producto: "", cantidad_productos: "", precio: "" }])}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Agregar
                </Button>
              </div>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio unit.</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Select value={it.id_producto} onValueChange={v => updateItem(idx, "id_producto", v)}>
                            <SelectTrigger className="h-8"><SelectValue placeholder="Producto" /></SelectTrigger>
                            <SelectContent>{(opciones.productos as any[]).map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input type="number" className="h-8 w-20" value={it.cantidad_productos} onChange={e => updateItem(idx, "cantidad_productos", e.target.value)} /></TableCell>
                        <TableCell><Input type="number" className="h-8 w-24" value={it.precio} onChange={e => updateItem(idx, "precio", e.target.value)} /></TableCell>
                        <TableCell className="font-medium">${((parseFloat(it.cantidad_productos) || 0) * (parseFloat(it.precio) || 0)).toLocaleString()}</TableCell>
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
            <Button onClick={handleSubmit}>{editId ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}