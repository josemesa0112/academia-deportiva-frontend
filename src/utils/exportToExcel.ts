import * as XLSX from 'xlsx';

/**
 * Función para exportar un arreglo de objetos a un archivo Excel
 * @param {Array} data - Los datos a exportar (ej: lista de productos)
 * @param {String} fileName - Nombre del archivo a descargar
 * @param {String} sheetName - Nombre de la pestaña en el Excel
 */
export const exportToExcel = (data, fileName = 'Reporte', sheetName = 'Datos') => {
  // 1. Convertir la lista de objetos JSON a una hoja de trabajo (worksheet)
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. Crear un libro de trabajo (workbook)
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 3. Generar el archivo y forzar la descarga en el navegador
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};