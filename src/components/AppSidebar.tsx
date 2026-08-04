import {
  LayoutDashboard, Users, GraduationCap, Dumbbell, Truck, Package,
  ShoppingCart, MapPin, Calendar, ClipboardCheck, FileText, CreditCard, LogOut, User
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useRol } from "@/hooks/useRol";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

// Items sin sección: van pegados al header, sin etiqueta propia.
const itemsPrincipales = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: [1, 2, 3, 4] },
  { title: "Mi Perfil", url: "/mi-perfil", icon: User, roles: [2, 3] },
];

// El resto se agrupa por área del negocio para que el menú no sea una lista plana.
const secciones = [
  {
    label: "Gestión",
    items: [
      { title: "Personas", url: "/personas", icon: Users, roles: [1] },
      { title: "Profesores", url: "/profesores", icon: GraduationCap, roles: [1] },
      { title: "Deportistas", url: "/deportistas", icon: Dumbbell, roles: [1, 2] },
    ],
  },
  {
    label: "Comercial",
    items: [
      { title: "Proveedores", url: "/proveedores", icon: Truck, roles: [1] },
      { title: "Productos", url: "/productos", icon: Package, roles: [1] },
      { title: "Compras", url: "/compras", icon: ShoppingCart, roles: [1] },
      { title: "Matrículas", url: "/matriculas", icon: FileText, roles: [1] },
      { title: "Mensualidades", url: "/mensualidades", icon: CreditCard, roles: [1] },
    ],
  },
  {
    label: "Deportiva",
    items: [
      { title: "Canchas", url: "/canchas", icon: MapPin, roles: [1, 2] },
      { title: "Entrenamientos", url: "/entrenamientos", icon: Calendar, roles: [1, 2, 3] },
      { title: "Asistencias", url: "/asistencias", icon: ClipboardCheck, roles: [1, 2, 3] },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { userRol, loading } = useRol();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Filtrar items según el rol del usuario
  const filtrarPorRol = (items: typeof itemsPrincipales) => items.filter(item => {
    if (!userRol) return item.title === "Dashboard"
    return item.roles.includes(userRol.id_rol)
  })

  const principalesFiltrados = filtrarPorRol(itemsPrincipales)
  // Las secciones que quedan sin items para este rol no se renderizan.
  const seccionesFiltradas = secciones
    .map(seccion => ({ ...seccion, items: filtrarPorRol(seccion.items) }))
    .filter(seccion => seccion.items.length > 0)

  const renderItem = (item: typeof itemsPrincipales[number]) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        {/* Sin `end`: /deportistas sigue marcado al abrir /deportistas/:id */}
        <NavLink
          to={item.url}
          className="hover:bg-sidebar-accent/80 transition-colors"
          activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
        >
          <item.icon className="mr-2 h-4 w-4 shrink-0" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-primary font-bold text-xs tracking-widest uppercase">
            {!collapsed && "Estrellas del Milenio"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Mostrar nombre y rol del usuario */}
              {!collapsed && !loading && userRol && (
                <div className="px-2 py-2 mb-2 rounded-md bg-sidebar-accent/30">
                  <p className="text-xs font-medium text-sidebar-primary truncate">
                    {userRol.nombre} {userRol.apellido}
                  </p>
                  <p className="text-xs text-muted-foreground">{userRol.nombre_rol}</p>
                </div>
              )}
              {principalesFiltrados.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {seccionesFiltradas.map((seccion) => (
          <SidebarGroup key={seccion.label} className="py-0">
            <SidebarGroupLabel className="text-muted-foreground font-semibold text-[10px] tracking-wider uppercase">
              {!collapsed && seccion.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {seccion.items.map(renderItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Botón cerrar sesión */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="hover:bg-red-500/10 text-red-400 hover:text-red-400 cursor-pointer transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4 shrink-0" />
                  {!collapsed && <span>Cerrar sesión</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}