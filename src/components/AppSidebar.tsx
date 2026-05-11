import {
  LayoutDashboard, Users, GraduationCap, Dumbbell, Truck, Package,
  ShoppingCart, MapPin, Calendar, ClipboardCheck, FileText, CreditCard, LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useRol } from "@/hooks/useRol";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const todosLosItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: [1, 2, 3, 4] },
  { title: "Personas", url: "/personas", icon: Users, roles: [1] },
  { title: "Profesores", url: "/profesores", icon: GraduationCap, roles: [1] },
  { title: "Deportistas", url: "/deportistas", icon: Dumbbell, roles: [1, 2] },
  { title: "Proveedores", url: "/proveedores", icon: Truck, roles: [1] },
  { title: "Productos", url: "/productos", icon: Package, roles: [1, 4] },
  { title: "Compras", url: "/compras", icon: ShoppingCart, roles: [1, 4] },
  { title: "Canchas", url: "/canchas", icon: MapPin, roles: [1, 2] },
  { title: "Entrenamientos", url: "/entrenamientos", icon: Calendar, roles: [1, 2] },
  { title: "Asistencias", url: "/asistencias", icon: ClipboardCheck, roles: [1, 2, 3] },
  { title: "Matrículas", url: "/matriculas", icon: FileText, roles: [1] },
  { title: "Mensualidades", url: "/mensualidades", icon: CreditCard, roles: [1, 3] },
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
  const itemsFiltrados = todosLosItems.filter(item => {
    if (!userRol) return item.title === "Dashboard"
    return item.roles.includes(userRol.id_rol)
  })

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup className="flex-1">
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
              {itemsFiltrados.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/80 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Botón cerrar sesión */}
        <SidebarGroup>
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