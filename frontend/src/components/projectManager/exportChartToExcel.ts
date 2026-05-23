import type { RefObject } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

type Column = { header: string; key: string; width?: number };

export async function exportChartToExcel<T extends Record<string, unknown>>(args: {
  chartRef: RefObject<HTMLDivElement | null>;
  data: T[];
  columns: Column[];
  filename: string;
  sheetName: string;
}): Promise<void> {
  const { chartRef, data, columns, filename, sheetName } = args;
  if (!chartRef.current) return;

  try {
    const canvas = await html2canvas(chartRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });
    const base64Image = canvas.toDataURL('image/png');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = columns;
    worksheet.addRows(data as unknown as ExcelJS.RowValues[]);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };

    const imageStartRow = data.length + 3;

    const imageId = workbook.addImage({
      base64: base64Image,
      extension: 'png',
    });

    worksheet.addImage(imageId, {
      tl: { col: 0, row: imageStartRow },
      ext: { width: canvas.width / 2, height: canvas.height / 2 },
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${filename}.xlsx`);
  } catch (error) {
    console.error('Export failed:', error);
    alert('Lỗi khi xuất dữ liệu ra Excel.');
  }
}
