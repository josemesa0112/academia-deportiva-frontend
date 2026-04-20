import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Personas from "@/pages/Personas";
import Profesores from "@/pages/Profesores";
import Deportistas from "@/pages/Deportistas";
import Proveedores from "@/pages/Proveedores";
import Productos from "@/pages/Productos";
import Compras from "@/pages/Compras";
import Canchas from "@/pages/Canchas";
import Entrenamientos from "@/pages/Entrenamientos";
import Asistencias from "@/pages/Asistencias";
import Matriculas from "@/pages/Matriculas";
import Mensualidades from "@/pages/Mensualidades";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/personas" element={<Personas />} />
            <Route path="/profesores" element={<Profesores />} />
            <Route path="/deportistas" element={<Deportistas />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/canchas" element={<Canchas />} />
            <Route path="/entrenamientos" element={<Entrenamientos />} />
            <Route path="/asistencias" element={<Asistencias />} />
            <Route path="/matriculas" element={<Matriculas />} />
            <Route path="/mensualidades" element={<Mensualidades />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
