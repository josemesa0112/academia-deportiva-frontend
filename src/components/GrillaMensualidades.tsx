import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Check, Search, X, Loader2, ChevronLeft, ChevronRight, MoreVertical, CheckCheck, Undo2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

type Celda = { id: number; valor: number | null; pagada: boolean; fecha_pago: string | null } | null;

type FilaDeportista = {
  id_deportista: number;
  nombre: string;
  apellido: string;
  numero_documento: string | null;
  id_categoria: number | null;
  categoria: string | null;
  valor_mensualidad: number | null;
  meses: Celda[];
};

type Matriz = {
  año: number;
  deportistas: FilaDeportista[];
  totales_por_mes: { mes: number; pagadas: number; pendientes: number; recaudado: number }[];
};

const formatMoneda = (v: number) => `$${v.toLocaleString("es-CO")}`;

const TODAS = "__todas__";

export default function GrillaMensualidades() {
  const { toast } = useToast();
  const [año, setAño] = useState(() => new Date().getFullYear());
  const [matriz, setMatriz] = useState<Matriz | null>(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState(TODAS);
  // Celdas en curso, para no permitir dobles clics sobre la misma.
  const [enProceso, setEnProceso] = useState<Set<string>>(new Set());
  // Acción masiva pendiente de confirmar. Marcar un mes entero afecta a
  // decenas de deportistas, así que nunca se ejecuta con un solo clic.
  const [confirmacion, setConfirmacion] = useState<{ indiceMes: number; pagada: boolean } | null>(null);
  const [aplicandoMes, setAplicandoMes] = useState(false);

  const cargar = useCallback(async (añoPedido: number) => {
    setCargando(true);
    try {
      const res = await api.get(`/api/mensualidades/anio/${añoPedido}`);
      setMatriz(res);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "No se pudo cargar la grilla", variant: "destructive" });
      setMatriz(null);
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => { cargar(año); }, [año, cargar]);

  const categorias = useMemo(() => {
    if (!matriz) return [];
    const vistas = new Map<string, number>();
    for (const d of matriz.deportistas) {
      const nombre = d.categoria || "Sin categoría";
      if (!vistas.has(nombre)) vistas.set(nombre, d.id_categoria ?? Infinity);
    }
    return Array.from(vistas.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([nombre]) => nombre);
  }, [matriz]);

  const filas = useMemo(() => {
    if (!matriz) return [];
    let out = matriz.deportistas;
    if (categoria !== TODAS) {
      out = out.filter(d => (d.categoria || "Sin categoría") === categoria);
    }
    const q = busqueda.trim().toLowerCase();
    if (q) {
      out = out.filter(d =>
        `${d.nombre} ${d.apellido}`.toLowerCase().includes(q) ||
        (d.numero_documento || "").toLowerCase().includes(q)
      );
    }
    return out;
  }, [matriz, categoria, busqueda]);

  // Los totales del pie se recalculan sobre lo filtrado, para que coincidan
  // con lo que se está viendo en pantalla.
  const totales = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      let pagadas = 0, recaudado = 0;
      for (const d of filas) {
        const c = d.meses[i];
        if (c?.pagada) { pagadas++; recaudado += c.valor || 0; }
      }
      return { pagadas, recaudado };
    });
  }, [filas]);

  const alternar = async (fila: FilaDeportista, indiceMes: number) => {
    const clave = `${fila.id_deportista}-${indiceMes}`;
    if (enProceso.has(clave)) return;

    const celda = fila.meses[indiceMes];
    const pagadaNueva = !celda?.pagada;

    setEnProceso(prev => new Set(prev).add(clave));
    try {
      await api.post("/api/mensualidades/marcar", {
        id_deportista: fila.id_deportista,
        mes: indiceMes + 1,
        año,
        pagada: pagadaNueva,
      });

      // Actualización local: evita recargar 133 filas por cada clic.
      setMatriz(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          deportistas: prev.deportistas.map(d => {
            if (d.id_deportista !== fila.id_deportista) return d;
            const meses = [...d.meses];
            meses[indiceMes] = pagadaNueva
              ? {
                  id: celda?.id ?? 0,
                  valor: celda?.valor ?? d.valor_mensualidad,
                  pagada: true,
                  fecha_pago: new Date().toISOString(),
                }
              : celda
                ? { ...celda, pagada: false, fecha_pago: null }
                : null;
            return { ...d, meses };
          }),
        };
      });
    } catch (err: any) {
      toast({
        title: pagadaNueva ? "No se pudo registrar el pago" : "No se pudo revertir",
        description: err?.message || "Intenta de nuevo",
        variant: "destructive",
      });
    } finally {
      setEnProceso(prev => {
        const next = new Set(prev);
        next.delete(clave);
        return next;
      });
    }
  };

  // Aplica la acción a los deportistas que están a la vista: si hay un filtro
  // de categoría o búsqueda activo, solo afecta a esos. Así lo que ocurre
  // coincide con lo que el administrador ve.
  const aplicarMesCompleto = async () => {
    if (!confirmacion) return;
    const { indiceMes, pagada } = confirmacion;
    const hayFiltro = categoria !== TODAS || busqueda.trim() !== "";

    setAplicandoMes(true);
    try {
      const res: any = await api.post("/api/mensualidades/marcar-mes", {
        mes: indiceMes + 1,
        año,
        pagada,
        ...(hayFiltro ? { ids_deportistas: filas.map(f => f.id_deportista) } : {}),
      });
      toast({
        title: pagada ? "Mes marcado como pagado" : "Pagos revertidos",
        description: res?.message,
      });
      setConfirmacion(null);
      // Aquí sí se recarga: cambiaron muchas filas de golpe y el servidor
      // sabe cuáles se crearon y con qué valor.
      await cargar(año);
    } catch (err: any) {
      toast({
        title: "No se pudo aplicar",
        description: err?.message || "Intenta de nuevo",
        variant: "destructive",
      });
    } finally {
      setAplicandoMes(false);
    }
  };

  const añosDisponibles = useMemo(() => {
    const actual = new Date().getFullYear();
    return [actual - 2, actual - 1, actual, actual + 1];
  }, []);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => setAño(a => a - 1)} aria-label="Año anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={String(año)} onValueChange={v => setAño(Number(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {añosDisponibles.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setAño(a => a + 1)} aria-label="Año siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o documento..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="pl-9 pr-9"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {categorias.length > 1 && (
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className="lg:w-56"><SelectValue placeholder="Categoría" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todas las categorías</SelectItem>
              {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-green-500/25 ring-1 ring-green-500/50">
            <Check className="h-2.5 w-2.5 text-green-400" />
          </span>
          Pagada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-4 w-4 rounded ring-1 ring-amber-500/50 bg-amber-500/10" />
          Pendiente (ya generada)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-4 w-4 rounded border border-dashed border-muted-foreground/40" />
          Sin generar — al marcarla se crea
        </span>
        <span className="ml-auto">Clic en cualquier celda para marcar o quitar el pago</span>
      </div>

      {cargando ? (
        <div className="rounded-lg border bg-card py-10 text-center text-muted-foreground">Cargando grilla...</div>
      ) : !matriz || filas.length === 0 ? (
        <div className="rounded-lg border bg-card py-10 text-center text-muted-foreground">
          {matriz && matriz.deportistas.length > 0 ? "No hay coincidencias con el filtro." : "No hay deportistas activos."}
        </div>
      ) : (
        <div className="overflow-auto rounded-lg border bg-card">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="sticky left-0 z-20 min-w-[220px] bg-muted/40 px-4 py-3 text-left font-semibold backdrop-blur">
                  Deportista
                </th>
                {MESES_CORTOS.map((m, i) => (
                  <th key={m} className="min-w-[64px] px-1 py-2 text-center font-semibold">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="mx-auto flex flex-col items-center rounded px-2 py-1 transition-colors hover:bg-muted"
                          title={`Acciones para ${MESES_LARGOS[i]}`}
                        >
                          <span className="flex items-center gap-1">
                            {m}
                            <MoreVertical className="h-3 w-3 text-muted-foreground" />
                          </span>
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {totales[i].pagadas}/{filas.length}
                          </span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center">
                        <DropdownMenuItem onClick={() => setConfirmacion({ indiceMes: i, pagada: true })}>
                          <CheckCheck className="mr-2 h-4 w-4" />
                          Marcar todos como pagados
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setConfirmacion({ indiceMes: i, pagada: false })}>
                          <Undo2 className="mr-2 h-4 w-4" />
                          Quitar el pago a todos
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </th>
                ))}
                <th className="min-w-[70px] px-3 py-3 text-center font-semibold">Año</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(fila => {
                const pagadasFila = fila.meses.filter(m => m?.pagada).length;
                return (
                  <tr key={fila.id_deportista} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2">
                      <div className="font-medium leading-tight">{fila.apellido} {fila.nombre}</div>
                      <div className="text-xs text-muted-foreground">
                        {fila.categoria || "Sin categoría"}
                        {fila.valor_mensualidad ? ` · ${formatMoneda(fila.valor_mensualidad)}` : " · sin valor"}
                      </div>
                    </td>

                    {fila.meses.map((celda, i) => {
                      const clave = `${fila.id_deportista}-${i}`;
                      const ocupada = enProceso.has(clave);
                      const pagada = Boolean(celda?.pagada);
                      const existe = celda !== null;
                      return (
                        <td key={i} className="px-1 py-1 text-center">
                          <button
                            type="button"
                            disabled={ocupada}
                            onClick={() => alternar(fila, i)}
                            aria-label={`${MESES_LARGOS[i]} de ${fila.nombre} ${fila.apellido}: ${pagada ? "pagada" : "pendiente"}`}
                            aria-pressed={pagada}
                            title={
                              pagada
                                ? `Pagada${celda?.fecha_pago ? ` el ${new Date(celda.fecha_pago).toLocaleDateString("es-CO")}` : ""} — clic para revertir`
                                : existe
                                  ? "Pendiente — clic para marcar como pagada"
                                  : "Sin generar — clic para crearla y marcarla como pagada"
                            }
                            className={[
                              "mx-auto flex h-8 w-8 items-center justify-center rounded transition-colors disabled:opacity-50",
                              pagada
                                ? "bg-green-500/25 ring-1 ring-green-500/50 hover:bg-green-500/40"
                                : existe
                                  ? "bg-amber-500/10 ring-1 ring-amber-500/40 hover:bg-amber-500/25"
                                  : "border border-dashed border-muted-foreground/40 hover:bg-muted",
                            ].join(" ")}
                          >
                            {ocupada
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : pagada
                                ? <Check className="h-4 w-4 text-green-400" />
                                : null}
                          </button>
                        </td>
                      );
                    })}

                    <td className="px-3 py-2 text-center">
                      <span className={pagadasFila === 12 ? "font-semibold text-green-400" : "text-muted-foreground"}>
                        {pagadasFila}/12
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/40 text-xs">
                <td className="sticky left-0 z-10 bg-muted/40 px-4 py-3 font-semibold">Recaudado</td>
                {totales.map((t, i) => (
                  <td key={i} className="px-1 py-3 text-center text-[10px] text-muted-foreground">
                    {t.recaudado > 0 ? `$${Math.round(t.recaudado / 1000)}k` : "—"}
                  </td>
                ))}
                <td className="px-3 py-3 text-center text-[10px] font-semibold">
                  {formatMoneda(totales.reduce((s, t) => s + t.recaudado, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <AlertDialog open={confirmacion !== null} onOpenChange={o => !o && setConfirmacion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmacion?.pagada
                ? `¿Marcar ${MESES_LARGOS[confirmacion.indiceMes]} como pagado?`
                : `¿Quitar el pago de ${confirmacion ? MESES_LARGOS[confirmacion.indiceMes] : ""}?`}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  {confirmacion?.pagada
                    ? <>Se registrará el pago de <strong>{MESES_LARGOS[confirmacion.indiceMes]} de {año}</strong> a <strong>{filas.length} deportista{filas.length === 1 ? "" : "s"}</strong>. Las mensualidades que aún no existan se crearán.</>
                    : <>Se quitará el pago de <strong>{confirmacion ? MESES_LARGOS[confirmacion.indiceMes] : ""} de {año}</strong> a <strong>{filas.length} deportista{filas.length === 1 ? "" : "s"}</strong>. Los registros no se borran, vuelven a pendiente.</>}
                </p>
                {(categoria !== TODAS || busqueda.trim() !== "") && (
                  <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-400">
                    Solo aplica a los {filas.length} deportistas que tienes filtrados en pantalla
                    {categoria !== TODAS ? ` (categoría ${categoria})` : ""}
                    {busqueda.trim() ? ` (búsqueda "${busqueda.trim()}")` : ""}.
                  </p>
                )}
                {confirmacion?.pagada && (
                  <p className="text-muted-foreground">
                    Los que ya estaban pagados conservan su fecha original.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={aplicandoMes}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); aplicarMesCompleto(); }}
              disabled={aplicandoMes}
            >
              {aplicandoMes && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmacion?.pagada ? "Sí, marcar todos" : "Sí, quitar el pago"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}