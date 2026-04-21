import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface FieldDef {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  multiSelect?: boolean;
  tableHidden?: boolean;
  formOnly?: boolean;
  tableOnly?: boolean;
  render?: (value: string, row: Record<string, string>) => React.ReactNode;
}

interface CrudPageProps {
  title: string;
  fields: FieldDef[];
  storageKey: string;
  tableFields?: FieldDef[];
  formFields?: FieldDef[];
  renderCustomForm?: (form: Record<string, string>, setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>) => React.ReactNode;
}

function getStored<T>(key: string, fallback: T[]): T[] {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}

export default function CrudPage({ title, fields, storageKey, tableFields, formFields, renderCustomForm }: CrudPageProps) {
  const { toast } = useToast();
  const [data, setData] = useState<Record<string, string>[]>(() => getStored(storageKey, []));
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const displayFields = tableFields || fields.filter(f => !f.formOnly);
  const editFields = formFields || fields.filter(f => !f.tableOnly);

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
    const required = editFields.filter(f => f.type !== "switch");
    const missing = required.some(f => !form[f.key]?.trim());
    if (missing) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }
    const newData = [...data];
    if (editIndex !== null) {
      newData[editIndex] = form;
      toast({ title: "Actualizado", description: "Registro actualizado correctamente" });
    } else {
      newData.push({ ...form, id: Date.now().toString() });
      toast({ title: "Creado", description: "Registro creado correctamente" });
    }
    save(newData);
    setOpen(false);
  };

  const handleDelete = (i: number) => {
    const newData = data.filter((_, idx) => idx !== i);
    save(newData);
    toast({ title: "Eliminado", description: "Registro eliminado correctamente" });
  };

  const renderFieldInput = (f: FieldDef) => {
    if (f.type === "select" && f.options) {
      return (
        <Select value={form[f.key] || ""} onValueChange={val => setForm(prev => ({ ...prev, [f.key]: val }))}>
          <SelectTrigger><SelectValue placeholder={f.placeholder || `Seleccionar ${f.label.toLowerCase()}`} /></SelectTrigger>
          <SelectContent>
            {f.options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }
    if (f.type === "multiselect" && f.options) {
      const selected = (form[f.key] || "").split(",").filter(Boolean);
      return (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
          {f.options.map(o => {
            const isSelected = selected.includes(o.value);
            return (
              <Badge
                key={o.value}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer select-none"
                onClick={() => {
                  const newSelected = isSelected ? selected.filter(s => s !== o.value) : [...selected, o.value];
                  setForm(prev => ({ ...prev, [f.key]: newSelected.join(",") }));
                }}
              >
                {o.label}
              </Badge>
            );
          })}
        </div>
      );
    }
    if (f.type === "switch") {
      return (
        <div className="flex items-center gap-3">
          <Switch
            checked={form[f.key] === "true"}
            onCheckedChange={val => setForm(prev => ({ ...prev, [f.key]: String(val) }))}
          />
          <span className="text-sm text-muted-foreground">{form[f.key] === "true" ? "Sí" : "No"}</span>
        </div>
      );
    }
    return (
      <Input
        id={f.key}
        type={f.type || "text"}
        placeholder={f.placeholder || f.label}
        value={form[f.key] || ""}
        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
      />
    );
  };

  const renderCellValue = (f: FieldDef, row: Record<string, string>) => {
    if (f.render) return f.render(row[f.key], row);
    if (f.type === "switch") {
      return row[f.key] === "true"
        ? <Check className="h-4 w-4 text-green-500" />
        : <X className="h-4 w-4 text-red-400" />;
    }
    return row[f.key] || "—";
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
              {displayFields.map(f => (
                <TableHead key={f.key}>{f.label}</TableHead>
              ))}
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={displayFields.length + 1} className="text-center text-muted-foreground py-8">
                  No hay registros. Haz clic en "Nuevo" para agregar uno.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  {displayFields.map(f => (
                    <TableCell key={f.key}>{renderCellValue(f, row)}</TableCell>
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
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Editar" : "Nuevo"} {title}</DialogTitle>
          </DialogHeader>
          {renderCustomForm ? (
            renderCustomForm(form, setForm)
          ) : (
            <div className="grid gap-4 py-4">
              {editFields.map(f => (
                <div key={f.key} className="grid gap-2">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  {renderFieldInput(f)}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editIndex !== null ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
