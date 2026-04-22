import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

export interface FieldDef {
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  tableHidden?: boolean;
  formOnly?: boolean;
  tableOnly?: boolean;
  render?: (value: string, row: Record<string, string>) => React.ReactNode;
}

interface CrudPageProps {
  title: string;
  fields: FieldDef[];
  endpoint: string;
  tableFields?: FieldDef[];
  formFields?: FieldDef[];
}

export default function CrudPage({ title, fields, endpoint, tableFields, formFields }: CrudPageProps) {
  const { toast } = useToast();
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const displayFields = tableFields || fields.filter(f => !f.formOnly);
  const editFields = formFields || fields.filter(f => !f.tableOnly);

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get(endpoint)
      setData(res)
    } catch (err) {
      toast({ title: "Error", description: "No se pudo cargar los datos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [endpoint])

  const openCreate = () => {
    setForm({})
    setEditId(null)
    setOpen(true)
  }

  const openEdit = (row: Record<string, string>) => {
    setForm({ ...row })
    setEditId(row.id)
    setOpen(true)
  }

  const handleSubmit = async () => {
    const required = editFields.filter(f => f.type !== "switch")
    const missing = required.some(f => !form[f.key]?.toString().trim())
    if (missing) {
      toast({ title: "Error", description: "Completa todos los campos obligatorios", variant: "destructive" })
      return
    }
    try {
      if (editId) {
        await api.put(`${endpoint}/${editId}`, form)
        toast({ title: "Actualizado", description: "Registro actualizado correctamente" })
      } else {
        await api.post(endpoint, form)
        toast({ title: "Creado", description: "Registro creado correctamente" })
      }
      await fetchData()
      setOpen(false)
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Ocurrió un error", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`${endpoint}/${id}`)
      toast({ title: "Desactivado", description: "Registro desactivado correctamente" })
      await fetchData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Ocurrió un error", variant: "destructive" })
    }
  }

  const renderFieldInput = (f: FieldDef) => {
    if (f.type === "select" && f.options) {
      return (
        <Select value={form[f.key] || ""} onValueChange={val => setForm(prev => ({ ...prev, [f.key]: val }))}>
          <SelectTrigger><SelectValue placeholder={f.placeholder || `Seleccionar ${f.label.toLowerCase()}`} /></SelectTrigger>
          <SelectContent>
            {f.options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      )
    }
    if (f.type === "multiselect" && f.options) {
      const selected = (form[f.key] || "").split(",").filter(Boolean)
      return (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
          {f.options.map(o => {
            const isSelected = selected.includes(o.value)
            return (
              <Badge
                key={o.value}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer select-none"
                onClick={() => {
                  const newSelected = isSelected ? selected.filter(s => s !== o.value) : [...selected, o.value]
                  setForm(prev => ({ ...prev, [f.key]: newSelected.join(",") }))
                }}
              >
                {o.label}
              </Badge>
            )
          })}
        </div>
      )
    }
    return (
      <Input
        id={f.key}
        type={f.type || "text"}
        placeholder={f.placeholder || f.label}
        value={form[f.key] || ""}
        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
      />
    )
  }

  const renderCellValue = (f: FieldDef, row: Record<string, string>) => {
    if (f.render) return f.render(row[f.key], row)
    return row[f.key] || "—"
  }

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
            {loading ? (
              <TableRow>
                <TableCell colSpan={displayFields.length + 1} className="text-center py-8 text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
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
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="text-destructive hover:text-destructive">
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
            <DialogTitle>{editId !== null ? "Editar" : "Nuevo"} {title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editFields.map(f => (
              <div key={f.key} className="grid gap-2">
                <Label htmlFor={f.key}>{f.label}</Label>
                {renderFieldInput(f)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editId !== null ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}