import { pool } from '../../config/database.js';

export type ImportFileRow = {
  id: string;
  original_name: string;
  filename: string;
  file_path: string;
  row_count: number;
  uploaded_by: string;
  created_at: string;
};

export type ImportFileRecord = {
  id: string;
  originalName: string;
  filename: string;
  filePath: string;
  rowCount: number;
  uploadedBy: string;
  createdAt: string;
};

function toRecord(row: ImportFileRow): ImportFileRecord {
  return {
    id: row.id,
    originalName: row.original_name,
    filename: row.filename,
    filePath: row.file_path,
    rowCount: row.row_count,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

export class ImportFileRepository {
  async insert(input: {
    originalName: string;
    filename: string;
    filePath: string;
    rowCount: number;
    uploadedBy: string;
  }): Promise<ImportFileRecord> {
    const { rows } = await pool.query<ImportFileRow>(
      `INSERT INTO project_import_files (original_name, filename, file_path, row_count, uploaded_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.originalName, input.filename, input.filePath, input.rowCount, input.uploadedBy],
    );
    return toRecord(rows[0]);
  }

  async findAll(): Promise<ImportFileRecord[]> {
    const { rows } = await pool.query<ImportFileRow>(
      `SELECT * FROM project_import_files ORDER BY created_at DESC`,
    );
    return rows.map(toRecord);
  }
}
