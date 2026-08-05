import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, X, AlertCircle, UserPlus, ChevronDown, ChevronRight } from "lucide-react";
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
  // Si retorna false, el campo no se muestra en el form (ni se valida como
  // obligatorio). Útil para campos condicionales según otro valor del form.
  showIf?: (form: Record<string, string>) => boolean;
  // El campo se muestra pero puede quedar vacío al guardar.
  optional?: boolean;
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
  // Filtro extra aplicado antes de search/sort (ej. limitar entrenamientos
  // a las categorías que el profesor logueado tiene a cargo).
  dataFilter?: (row: Record<string, any>) => boolean;
  // Mensaje cuando el filtro deja la lista vacía (sobreescribe el genérico).
  emptyFilteredMessage?: string;
  // Si false, oculta el botón "Nuevo" (ej. profesor sin categorías).
  canCreate?: boolean;
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
  dataFilter,
  emptyFilteredMessage,
  canCreate = true,
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
  // Grupos colapsados (cuando groupBy está activo). Por defecto todos expandidos.
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  const displayFields = tableFields || fields.filter(f => !f.formOnly);
  const editFields = formFields || fields.filter(f => !f.tableOnly);

  const filteredData = useMemo(() => {
    // Pre-filtro contextual (ej. solo categorías del profesor logueado)
    let result = dataFilter ? data.filter(dataFilter) : data;
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
      // Multiselect: si viene un array (puede ser [1,2] o [{id, nombre}, ...])
      // lo convertimos a CSV de ids para el componente.
      if (f.type === "multiselect" && Array.isArray(val)) {
        normalized[f.key] = val
          .map((item: any) =>
            typeof item === "object" && item !== null
              ? String(item.id ?? item.value ?? "")
              : String(item)
          )
          .filter(Boolean)
          .join(",")
      } else {
        normalized[f.key] = val !== null && val !== undefined ? String(val) : ""
      }
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
    // Solo se exigen los campos visibles según showIf, que no sean switch
    // (aceptan false como valor válido) ni estén marcados como opcionales.
    const required = editFields.filter(f =>
      f.type !== "switch" && !f.optional && (!f.showIf || f.showIf(form))
    )
    const missing = required.some(f => !form[f.key]?.toString().trim())
    if (missing) {
      toast({ title: "Error", description: "Completa todos los campos obligatorios", variant: "destructive" })
      return
    }
    // Construye el payload limpiando "" y "null" a null real para que la
    // DB no falle al castear vacíos a integer/numeric. Además, los campos
    // ocultos por showIf se envían como null (evita que valores antiguos
    // del form queden viajando al backend cuando la condición cambió).
    const payload: Record<string, any> = {}
    for (const [k, v] of Object.entries(form)) {
      const fieldDef = editFields.find(f => f.key === k)
      const isHidden = fieldDef?.showIf && !fieldDef.showIf(form)
      if (isHidden) {
        payload[k] = null
      } else {
        payload[k] = v === "" || v === "null" || v === undefined ? null : v
      }
    }
    try {
      if (editId) {
        await api.put(`${endpoint}/${editId}`, payload)
        toast({ title: "Actualizado", description: "Registro actualizado correctamente" })
      } else {
        await api.post(endpoint, payload)
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

  // Cuando hay pendingPersonas configurado, el select de la persona se
  // restringe a las pendientes + la persona actual (si está en edición).
  // Esto evita registrar dos veces a la misma persona como proveedor /
  // profesor / deportista.
  const getFilteredOptions = (f: FieldDef) => {
    if (!f.options) return []
    if (!pendingPersonas || f.key !== pendingPersonas.personaIdField) return f.options
    const idsPendientes = new Set(personasPendientes.map(p => String(p.id)))
    const currentValue = form[f.key]
    return f.options.filter(o => idsPendientes.has(o.value) || o.value === currentValue)
  }

  const renderFieldInput = (f: FieldDef) => {
    if (f.type === "switch") {
      const checked = form[f.key] === "true" || form[f.key] === true as any
      return (
        <Switch
          checked={checked}
          onCheckedChange={(val) => setForm(prev => ({ ...prev, [f.key]: val ? "true" : "false" }))}
        />
      )
    }
    if (f.type === "select" && f.options) {
      const options = getFilteredOptions(f)
      return (
        <Select value={form[f.key] || ""} onValueChange={val => setForm(prev => ({ ...prev, [f.key]: val }))}>
          <SelectTrigger><SelectValue placeholder={f.placeholder || `Seleccionar ${f.label.toLowerCase()}`} /></SelectTrigger>
          <SelectContent>
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Todas las personas ya están registradas. Crea una nueva persona en la sección Personas.
              </div>
            ) : (
              options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)
            )}
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
        <h2 className="text-2xl font-bold text-title">{title}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {headerActions && headerActions(fetchData)}
          {canCreate && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Nuevo
            </Button>
          )}
        </div>
      </div>

      {pendingPersonas && personasPendientes.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-400" />
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
                  <span className="font-medium">{p.nombre}{p.apellido ? ` ${p.apellido}` : ""}</span>
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
          {emptyFilteredMessage || "No hay coincidencias con la búsqueda."}
        </div>
      ) : groupedData ? (
        <div className="space-y-4">
          {groupedData.map(([groupName, rows]) => {
            const isCollapsed = collapsedGroups.has(groupName);
            return (
              <div key={groupName} className="rounded-lg border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleGroup(groupName)}
                  className="w-full px-4 py-3 border-b bg-muted/30 hover:bg-muted/50 flex items-center justify-between transition-colors text-left"
                  aria-expanded={!isCollapsed}
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed
                      ? <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    <h3 className="font-semibold text-sm">{groupName}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {rows.length} {rows.length === 1 ? "registro" : "registros"}
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="overflow-auto">
                    {renderTable(rows, `${groupName}-`)}
                  </div>
                )}
              </div>
            );
          })}
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
            {editFields
              .filter(f => !f.showIf || f.showIf(form))
              .map(f => (
                <div key={f.key} className={f.type === "switch" ? "flex items-center justify-between" : "grid gap-2"}>
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