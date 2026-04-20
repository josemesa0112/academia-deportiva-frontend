import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface FieldDef {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
}

interface CrudPageProps {
  title: string;
  fields: FieldDef[];
  storageKey: string;
}

function getStored<T>(key: string, fallback: T[]): T[] {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}

export default function CrudPage({ title, fields, storageKey }: CrudPageProps) {
  const { toast } = useToast();
  const [data, setData] = useState<Record<string, string>[]>(() => getStored(storageKey, []));
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const save = (newData: Record<string, string>[]) => {
    setData(newData);
    localStorage.setItem(storageKey, JSON.stringify(newData));
  };

  const openCreate = () => {
    setForm({});
    setEditIndex(null);
    setOpen(true);
  };

  const openEdit = (i: number) => {
    setForm({ ...data[i] });
    setEditIndex(i);
    setOpen(true);
  };

  const handleSubmit = () => {
    const missing = fields.some(f => !form[f.key]?.trim());
    if (missing) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }
    const newData = [...data];
    if (editIndex !== null) {
      newData[editIndex] = form;
      toast({ title: "Actualizado", description: `Registro actualizado correctamente` });
    } else {
      newData.push({ ...form, id: Date.now().toString() });
      toast({ title: "Creado", description: `Registro creado correctamente` });
    }
    save(newData);
    setOpen(false);
  };

  const handleDelete = (i: number) => {
    const newData = data.filter((_, idx) => idx !== i);
    save(newData);
    toast({ title: "Eliminado", description: "Registro eliminado correctamente" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map(f => (
                <TableHead key={f.key}>{f.label}</TableHead>
              ))}
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={fields.length + 1} className="text-center text-muted-foreground py-8">
                  No hay registros. Haz clic en "Nuevo" para agregar uno.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  {fields.map(f => (
                    <TableCell key={f.key}>{row[f.key] || "—"}</TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(i)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(i)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Editar" : "Nuevo"} {title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {fields.map(f => (
              <div key={f.key} className="grid gap-2">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  type={f.type || "text"}
                  placeholder={f.placeholder || f.label}
                  value={form[f.key] || ""}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              </div>
            ))}
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
