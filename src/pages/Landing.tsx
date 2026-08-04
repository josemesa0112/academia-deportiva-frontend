import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Star, LogIn, ChevronDown, Trophy, HeartPulse, Users, CalendarCheck,
  MapPin, Phone, Mail, Clock, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";

// ---------------------------------------------------------------------------
// DATOS DEL CLUB — reemplazar por la información real.
// Los valores de contacto son marcadores de posición, no datos reales.
// ---------------------------------------------------------------------------
const CLUB = {
  nombre: "Estrellas del Milenio",
  tagline: "Formamos deportistas, construimos personas",
  intro:
    "Academia de fútbol formativo dedicada al desarrollo integral de niños y jóvenes. " +
    "Entrenamos técnica, táctica y carácter, con seguimiento individual de cada deportista.",
  contacto: {
    direccion: "Calle 00 #00-00, Barrio — Ciudad",
    telefono: "+57 300 000 0000",
    correo: "contacto@ejemplo.com",
    horario: "Lunes a viernes 2:00 p.m. – 6:00 p.m. · Sábados 8:00 a.m. – 12:00 m.",
  },
};

// Para usar fotos reales: dejarlas en public/ y poner aquí la ruta
// (ej. "/club-hero.jpg"). Con null se muestra el degradado de la marca.
const HERO_IMAGE: string | null = null;
const ABOUT_IMAGE: string | null = null;

const PILARES = [
  {
    icon: Trophy,
    titulo: "Formación competitiva",
    texto:
      "Entrenamientos estructurados por categoría, con participación en torneos locales que ponen a prueba lo trabajado en cancha.",
  },
  {
    icon: HeartPulse,
    titulo: "Seguimiento físico",
    texto:
      "Cada deportista tiene su historial de medidas y evolución en el tiempo, para acompañar su crecimiento de forma responsable.",
  },
  {
    icon: Users,
    titulo: "Cuerpo técnico dedicado",
    texto:
      "Profesores asignados por categoría, que conocen a cada jugador y acompañan su proceso de principio a fin.",
  },
  {
    icon: CalendarCheck,
    titulo: "Control de asistencia",
    texto:
      "Registro de cada entrenamiento, para que las familias sepan siempre cómo va el proceso de su deportista.",
  },
];

type Categoria = { id: number; nombre: string; edad_min: number | null; edad_max: number | null };

const rangoEdad = (c: Categoria) => {
  if (c.edad_min && c.edad_max) {
    return c.edad_min === c.edad_max ? `${c.edad_min} años` : `${c.edad_min} a ${c.edad_max} años`;
  }
  return c.edad_min ? `Desde ${c.edad_min} años` : "Todas las edades";
};

export default function Landing() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [autenticado, setAutenticado] = useState(false);

  // Si ya hay sesión, los botones llevan directo a la plataforma en vez de
  // pasar por el login.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAutenticado(Boolean(session));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAutenticado(Boolean(session));
    });
    return () => subscription.unsubscribe();
  }, []);

  const destino = autenticado ? "/dashboard" : "/login";
  const textoAcceso = autenticado ? "Ir a la plataforma" : "Iniciar sesión";

  // La sección de categorías es opcional: si el backend no responde
  // (arranque en frío del hosting), simplemente no se muestra.
  useEffect(() => {
    let activo = true;
    api
      .get("/api/catalogos/categorias")
      .then((res: Categoria[]) => {
        if (activo && Array.isArray(res)) setCategorias(res);
      })
      .catch(() => {
        /* sin categorías: la sección se omite */
      });
    return () => {
      activo = false;
    };
  }, []);

  const irA = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ------------------------------------------------------------------ */}
      {/* Barra superior: botón de login arriba a la izquierda               */}
      {/* ------------------------------------------------------------------ */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[hsl(220,50%,9%)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Button
            asChild
            size="sm"
            className="gap-2 bg-[hsl(213,88%,45%)] text-white hover:bg-[hsl(213,88%,52%)]"
          >
            <Link to={destino}>
              <LogIn className="h-4 w-4" />
              {textoAcceso}
            </Link>
          </Button>

          <div className="flex items-center gap-2 text-white">
            <Star className="h-5 w-5 shrink-0 text-[hsl(45,96%,58%)]" fill="currentColor" />
            <span className="truncate text-sm font-bold uppercase tracking-wider sm:text-base">
              {CLUB.nombre}
            </span>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(220,55%,7%)] px-4 pt-16">
        {HERO_IMAGE ? (
          <>
            <img
              src={HERO_IMAGE}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[hsl(220,55%,7%)]/75" />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[hsl(213,80%,30%)]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-[hsl(45,96%,58%)]/15 blur-3xl" />
          </>
        )}

        <div className="relative z-10 mx-auto max-w-3xl py-20 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[hsl(45,96%,58%)]/25 blur-2xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-[hsl(45,96%,58%)]/30 bg-gradient-to-br from-[hsl(213,88%,45%)] to-[hsl(220,60%,12%)] shadow-2xl">
                <Star className="h-12 w-12 text-white" strokeWidth={2.5} fill="currentColor" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            ESTRELLAS DEL{" "}
            <span className="text-[hsl(45,96%,58%)]">MILENIO</span>
          </h1>

          <div className="my-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[hsl(45,70%,50%)]/60" />
            <span className="text-xs uppercase tracking-[0.3em] text-[hsl(45,55%,75%)]">
              Academia Deportiva
            </span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[hsl(45,70%,50%)]/60" />
          </div>

          <p className="mx-auto max-w-2xl text-lg text-[hsl(212,20%,80%)] sm:text-xl">
            {CLUB.tagline}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => irA("club")}
              className="gap-2 bg-[hsl(213,88%,45%)] text-white hover:bg-[hsl(213,88%,52%)]"
            >
              Conoce el club
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => irA("contacto")}
              className="gap-2 border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Contáctanos
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => irA("club")}
          aria-label="Bajar a la información del club"
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/50 transition-colors hover:text-white"
        >
          <ChevronDown className="h-7 w-7 animate-bounce motion-reduce:animate-none" />
        </button>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Sobre el club                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section id="club" className="scroll-mt-16 px-4 py-24 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Quiénes somos
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-title sm:text-4xl">
              Un club que forma dentro y fuera de la cancha
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{CLUB.intro}</p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Trabajamos por categorías según la edad de cada deportista, de modo que entrene y
              compita con quienes están en su mismo momento de desarrollo. Cada proceso queda
              registrado: asistencia, evolución física y participación.
            </p>
          </Reveal>

          <Reveal delay={120}>
            {ABOUT_IMAGE ? (
              <img
                src={ABOUT_IMAGE}
                alt={`Deportistas de ${CLUB.nombre}`}
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(213,80%,30%)] to-[hsl(220,55%,9%)] shadow-xl">
                <Star className="h-24 w-24 text-white/20" fill="currentColor" />
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Pilares                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-secondary/40 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Qué ofrecemos
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-title sm:text-4xl">
              Un proceso completo para cada deportista
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILARES.map((pilar, i) => (
              <Reveal key={pilar.titulo} delay={i * 100}>
                <div className="h-full rounded-2xl border bg-card p-7 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <pilar.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{pilar.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pilar.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Categorías (se omite si el backend no responde)                     */}
      {/* ------------------------------------------------------------------ */}
      {categorias.length > 0 && (
        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Categorías
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-title sm:text-4xl">
                Un grupo para cada edad
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Las categorías se organizan por año de nacimiento. Escríbenos para saber en cuál
                entraría tu deportista.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categorias.map((c, i) => (
                <Reveal key={c.id} delay={i * 80}>
                  <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      <Star className="h-5 w-5" fill="currentColor" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold">{c.nombre}</p>
                      <p className="text-sm text-muted-foreground">{rangoEdad(c)}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Contacto                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="contacto" className="scroll-mt-16 bg-[hsl(220,50%,9%)] px-4 py-24 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(45,96%,58%)]">
              Contacto
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-title sm:text-4xl">
              Visítanos o escríbenos
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[hsl(212,18%,73%)]">
              Estamos atentos para resolver tus dudas sobre inscripciones, horarios y categorías.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {[
              { icon: MapPin, titulo: "Dirección", valor: CLUB.contacto.direccion, href: null },
              { icon: Phone, titulo: "Teléfono", valor: CLUB.contacto.telefono, href: `tel:${CLUB.contacto.telefono.replace(/\s/g, "")}` },
              { icon: Mail, titulo: "Correo", valor: CLUB.contacto.correo, href: `mailto:${CLUB.contacto.correo}` },
              { icon: Clock, titulo: "Horarios", valor: CLUB.contacto.horario, href: null },
            ].map((item, i) => (
              <Reveal key={item.titulo} delay={i * 100}>
                <div className="flex h-full items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(213,88%,45%)]/20">
                    <item.icon className="h-5 w-5 text-[hsl(45,96%,58%)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{item.titulo}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-1 block break-words text-[hsl(212,18%,75%)] underline-offset-4 hover:text-white hover:underline"
                      >
                        {item.valor}
                      </a>
                    ) : (
                      <p className="mt-1 break-words text-[hsl(212,18%,75%)]">{item.valor}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-14 flex flex-col items-center gap-4 border-t border-white/10 pt-10 text-center">
              <p className="text-[hsl(212,18%,73%)]">¿Ya haces parte del club?</p>
              <Button
                asChild
                size="lg"
                className="gap-2 bg-[hsl(213,88%,45%)] text-white hover:bg-[hsl(213,88%,52%)]"
              >
                <Link to={destino}>
                  <LogIn className="h-4 w-4" />
                  {autenticado ? "Ir a la plataforma" : "Entrar a la plataforma"}
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-[hsl(220,55%,7%)] px-4 py-8 text-center sm:px-6">
        <p className="text-xs text-[hsl(212,14%,50%)]">
          © {new Date().getFullYear()} {CLUB.nombre}. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}