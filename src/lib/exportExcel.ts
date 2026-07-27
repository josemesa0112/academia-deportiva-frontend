import * as XLSX from "xlsx";

interface ExportOptions {
  fileName: string;
  sheetName?: string;
  data: Record<string, any>[];
}

/**
 * Función global para exportar cualquier arreglo de objetos a Excel
 */
export const exportToExcel = ({ data, fileName, sheetName = "Datos" }: ExportOptions) => {
  if (!data || data.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  // 1. Convierte los datos a hoja de Excel
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 2. Descarga el archivo con la fecha de hoy
  const fecha = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `${fileName}_${fecha}.xlsx`);
};