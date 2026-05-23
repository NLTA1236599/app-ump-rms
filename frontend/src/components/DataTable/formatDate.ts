/** Date display helper — avoids timezone off-by-one for ISO strings. */
export function formatDate(value: string | number | null | undefined): string {
  if (value == null || value === '') return '';

  if (typeof value === 'number') {
    const utcMs = (value - 25569) * 86400 * 1000;
    const d = new Date(utcMs);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  const str = String(value).trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;

  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  if (/^\d+(\.\d+)?$/.test(str)) {
    const excelSerial = Number(str);
    if (excelSerial > 20000 && excelSerial < 100000) {
      const d = new Date((excelSerial - 25569) * 86400 * 1000);
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  const largeYearMatch = str.match(/(\d{5,})/);
  if (largeYearMatch) {
    const excelNum = Number(largeYearMatch[1]);
    if (excelNum > 20000 && excelNum < 100000) {
      const d = new Date((excelNum - 25569) * 86400 * 1000);
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) return str;

  return str;
}

export function getAge(birthYear?: string): string {
  if (!birthYear) return '';
  const year = parseInt(birthYear, 10);
  if (Number.isNaN(year)) return '';
  return String(new Date().getFullYear() - year);
}
