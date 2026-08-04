import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";

vi.mock("@/lib/api", () => ({
  default: { get: vi.fn().mockResolvedValue([]) },
}));

const html = (node: React.ReactElement) =>
  renderToString(<MemoryRouter>{node}</MemoryRouter>);

describe("Landing", () => {
  it("renderiza sin errores con el botón de login y las secciones", () => {
    const out = html(<Landing />);
    expect(out).toContain('href="/login"');
    expect(out).toContain("Iniciar sesión");
    expect(out).toContain("ESTRELLAS DEL");
    expect(out).toContain("Quiénes somos");
    expect(out).toContain('id="contacto"');
  });
});

describe("Login", () => {
  // La pestaña activa por defecto es Documento; Radix solo renderiza esa,
  // así que el botón de Google no aparece hasta que se cambia de pestaña.
  it("muestra el ingreso por documento y el enlace al inicio", () => {
    const out = html(<Login />);
    expect(out).toContain("Número de documento");
    expect(out).toContain("Contraseña");
    expect(out).toContain("Olvidé mi contraseña");
    expect(out).toContain("Documento");
    expect(out).toContain("Correo");
    expect(out).toContain('href="/"');
  });

  it("con sesión activa redirige fuera del login", () => {
    const out = html(<Login session={{ user: { email: "a@b.com" } }} />);
    expect(out).not.toContain("Número de documento");
  });
});