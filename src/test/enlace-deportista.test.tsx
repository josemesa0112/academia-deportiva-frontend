import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import EnlaceDeportista from "@/components/EnlaceDeportista";

const html = (node: React.ReactElement) =>
  renderToString(<MemoryRouter>{node}</MemoryRouter>);

describe("EnlaceDeportista", () => {
  it("enlaza al perfil cuando hay id", () => {
    const out = html(<EnlaceDeportista id={42}>Pérez Juan</EnlaceDeportista>);
    expect(out).toContain('href="/deportistas/42"');
    expect(out).toContain("Pérez Juan");
  });

  it("acepta el id como texto", () => {
    const out = html(<EnlaceDeportista id="7">Ana</EnlaceDeportista>);
    expect(out).toContain('href="/deportistas/7"');
  });

  // Una fila sin id_deportista no debe producir un enlace roto a
  // /deportistas/null o /deportistas/undefined.
  it("degrada a texto plano sin id", () => {
    for (const id of [null, undefined, ""]) {
      const out = html(<EnlaceDeportista id={id}>Sin vínculo</EnlaceDeportista>);
      expect(out).toContain("Sin vínculo");
      expect(out).not.toContain("href");
    }
  });
});