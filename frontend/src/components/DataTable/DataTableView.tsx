import { useMemo, useState } from 'react';

import type { ResearchProject as PmProject } from '../projectManager/types.js';

import { DataTablePage } from './DataTablePage.js';
import { mapToTableProjects } from './mapToTableProjects.js';
import type { ResearchProject } from './types.js';

type DataTableViewProps = {
  sourceProjects: PmProject[];
};

export function DataTableView({ sourceProjects }: DataTableViewProps) {
  const initial = useMemo(() => mapToTableProjects(sourceProjects), [sourceProjects]);
  const [projects, setProjects] = useState<ResearchProject[]>(initial);

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDeleteMultiple = (ids: string[]) => {
    const idSet = new Set(ids);
    setProjects((prev) => prev.filter((p) => !idSet.has(p.id)));
  };

  const handleImport = (rows: Partial<ResearchProject>[]) => {
    setProjects((prev) => [...prev, ...(rows as ResearchProject[])]);
  };

  return (
    <DataTablePage
      projects={projects}
      onDelete={handleDelete}
      onEdit={() => {}}
      onView={() => {}}
      onImport={handleImport}
      onDeleteMultiple={handleDeleteMultiple}
    />
  );
}
