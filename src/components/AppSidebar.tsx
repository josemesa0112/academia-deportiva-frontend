import {
  LayoutDashboard, Users, GraduationCap, Dumbbell, Truck, Package,
  ShoppingCart, MapPin, Calendar, ClipboardCheck, FileText, CreditCard, LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Personas", url: "/personas", icon: Users },
  { title: "Profesores", url: "/profesores", icon: GraduationCap },
  { title: "Deportistas", url: "/deportistas", icon: Dumbbell },
  { title: "Proveedores", url: "/proveedores", icon: Truck },
  { title: "Productos", url: "/productos", icon: Package },
  { title: "Compras", url: "/compras", icon: ShoppingCart },
  { title: "Canchas", url: "/canchas", icon: MapPin },
  { title: "Entrenamientos", url: "/entrenamientos", icon: Calendar },
  { title: "Asistencias", url: "/asistencias", icon: ClipboardCheck },
  { title: "Matrículas", url: "/matriculas", icon: FileText },
  { title: "Mensualidades", url: "/mensualidades", icon: CreditCard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-sidebar-primary font-bold text-xs tracking-widest uppercase">
            {!collapsed && "Estrellas del Milenio"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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