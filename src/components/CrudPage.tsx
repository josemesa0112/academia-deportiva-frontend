import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, X, AlertCircle, UserPlus } from "lucide-react";
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

export interface SortOption {
  key: string;
  label: string;
  type?: "string" | "date" | "number";
}

interface PendingPersonasConfig {
  rolId: number;
  personaIdField: string;
  rolLabel?: string;
}

interface CrudPageProps {
  title: string;
  fields: FieldDef[];
  endpoint: string;
  tableFields?: FieldDef[];
  formFields?: FieldDef[];
  searchFields?: string[];
  searchPlaceholder?: string;
  sortOptions?: SortOption[];
  groupBy?: string;
  groupEmptyLabel?: string;
  pendingPersonas?: PendingPersonasConfig;
  rowActions?: (row: Record<string, any>, refresh: () => void) => React.ReactNode;
  headerActions?: (refresh: () => void) => React.ReactNode;
}

const compareValues = (a: any, b: any, type: SortOption["type"] = "string") => {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  if (type === "number") return Number(a) - Number(b);
  if (type === "date") return new Date(String(a)).getTime() - new Date(String(b)).getTime();
  return String(a).localeCompare(String(b), "es", { sensitivity: "base" });
};

export default function CrudPage({
  title,
  fields,
  endpoint,
  tableFields,
  formFields,
  searchFields,
  searchPlaceholder,
  sortOptions,
  groupBy,
  groupEmptyLabel = "Sin asignar",
  pendingPersonas,
  rowActions,
  headerActions,
}: CrudPageProps) {
  const { toast } = useToast();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [personasPendientes, setPersonasPendientes] = useState<Record<string, any>[]>([]);

  const displayFields = tableFields || fields.filter(f => !f.formOnly);
  const editFields = formFields || fields.filter(f => !f.tableOnly);

  const filteredData = useMemo(() => {
    let result = data;
    const q = searchQuery.trim().toLowerCase();
    if (q && searchFields && searchFields.length > 0) {
      result = result.filter(row =>
        searchFields.some(f => {
          const v = row[f];
          return v !== null && v !== undefined && String(v).toLowerCase().includes(q);
        })
      );
    }
    if (sortKey && sortOptions) {
      const opt = sortOptions.find(o => o.key === sortKey);
      if (opt) {
        result = [...result].sort((a, b) => compareValues(a[opt.key], b[opt.key], opt.type));
      }
    }
    return result;
  }, [data, searchQuery, sortKey, searchFields, sortOptions]);

  const showToolbar = (searchFields && searchFields.length > 0) || (sortOptions && sortOptions.length > 0);

  const groupedData = useMemo(() => {
    if (!groupBy) return null;
    const map = new Map<string, Record<string, any>[]>();
    for (const row of filteredData) {
      const raw = row[groupBy];
      const key = raw === null || raw === undefined || raw === "" ? groupEmptyLabel : String(raw);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, "es", { sensitivity: "base" }));
  }, [filteredData, groupBy, groupEmptyLabel]);

  const fetchData = async () => {
    try {
      setLoading(true)
      const [res, allPersonas] = await Promise.all([
        api.get(endpoint),
        pendingPersonas ? api.get("/api/personas") : Promise.resolve(null),
      ])
      setData(res)
      if (pendingPersonas && Array.isArray(allPersonas)) {
        const idsConRegistro = new Set(
          (res as any[]).map(r => Number(r[pendingPersonas.personaIdField])).filter(n => !Number.isNaN(n))
        )
        const pendientes = allPersonas.filter((p: any) =>
          Number(p.id_rol) === pendingPersonas.rolId && !idsConRegistro.has(Number(p.id))
        )
        setPersonasPendientes(pendientes)
      }
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

  const openCompletar = (persona: Record<string, any>) => {
    if (!pendingPersonas) return
    setForm({ [pendingPersonas.personaIdField]: String(persona.id) })
    setEditId(null)
    setOpen(true)
  }

  // ← Normaliza todos los valores a string para que los selects funcionen
  const openEdit = (row: Record<string, any>) => {
    const normalized: Record<string, string> = {}
    editFields.forEach(f => {
      const val = row[f.key]
      normalized[f.key] = val !== null && val !== undefined ? String(val) : ""
    })
    // Incluir también los campos id_ que pueden no estar en editFields
    Object.keys(row).forEach(key => {
      if (key.startsWith('id_') || key === 'id') {
        normalized[key] = row[key] !== null && row[key] !== undefined ? String(row[key]) : ""
      }
      // Corregir formato de fechas para input type="date"
      if (key.includes('fecha') || key.includes('date')) {
        const val = row[key]
        if (val) normalized[key] = String(val).split('T')[0]
      }
    })
    setForm(normalized)
    setEditId(String(row.id))
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
      toast({title: "❌ Error al guardar", description: err.message || "Ocurrió un error", variant: "destructive", duration: 6000 // ← más tiempo visible
      })
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

  const renderCellValue = (f: FieldDef, row: Record<string, any>) => {
    if (f.render) return f.render(row[f.key], row)
    return row[f.key] || "—"
  }

  const renderTable = (rows: Record<string, any>[], keyPrefix = "") => (
    <Table>
      <TableHeader>
        <TableRow>
          {displayFields.map(f => (
            <TableHead key={f.key}>{f.label}</TableHead>
          ))}
          <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={`${keyPrefix}${i}`}>
            {displayFields.map(f => (
              <TableCell key={f.key}>{renderCellValue(f, row)}</TableCell>
            ))}
            <TableCell className="text-right">
              {rowActions && rowActions(row, fetchData)}
              <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(String(row.id))} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {headerActions && headerActions(fetchData)}
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        </div>
      </div>

      {pendingPersonas && personasPendientes.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-semibold">
              {personasPendientes.length}{" "}
              {personasPendientes.length === 1 ? "persona pendiente" : "personas pendientes"} de completar
              {pendingPersonas.rolLabel ? ` como ${pendingPersonas.rolLabel}` : ""}
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

      {showToolbar && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {searchFields && searchFields.length > 0 && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={searchPlaceholder || "Buscar..."}
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
          )}
          {sortOptions && sortOptions.length > 0 && (
            <Select value={sortKey || "__none__"} onValueChange={v => setSortKey(v === "__none__" ? "" : v)}>
              <SelectTrigger className="sm:w-64">
                <SelectValue placeholder="Ordenar por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin orden</SelectItem>
                {sortOptions.map(o => (
                  <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border bg-card py-8 text-center text-muted-foreground">Cargando...</div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border bg-card py-8 text-center text-muted-foreground">
          No hay registros. Haz clic en "Nuevo" para agregar uno.
        </div>
      ) : filteredData.length === 0 ? (
        <div className="rounded-lg border bg-card py-8 text-center text-muted-foreground">
          No hay coincidencias con la búsqueda.
        </div>
      ) : groupedData ? (
        <div className="space-y-4">
          {groupedData.map(([groupName, rows]) => (
            <div key={groupName} className="rounded-lg border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                <h3 className="font-semibold text-sm">{groupName}</h3>
                <span className="text-xs text-muted-foreground">
                  {rows.length} {rows.length === 1 ? "registro" : "registros"}
                </span>
              </div>
              <div className="overflow-auto">
                {renderTable(rows, `${groupName}-`)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-auto">
          {renderTable(filteredData)}
        </div>
      )}

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