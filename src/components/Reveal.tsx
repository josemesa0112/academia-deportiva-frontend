import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Retraso en ms, para escalonar varios elementos de una misma sección. */
  delay?: number;
  className?: string;
};

/**
 * Muestra su contenido con un fade-up la primera vez que entra en pantalla.
 * Sin dependencias: usa IntersectionObserver y se desconecta tras revelarse,
 * así el contenido no vuelve a ocultarse al subir el scroll.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Entornos sin IntersectionObserver (jsdom en tests): mostrar sin animar.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={[
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        // Si el usuario pidió menos movimiento, se muestra sin transición.
        "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default Reveal;