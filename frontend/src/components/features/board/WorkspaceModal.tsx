import { useEffect, useState } from 'react';
import type { Workspace } from '../../../types/index.js';
import { Button } from '../../ui/Button.js';
import { Input } from '../../ui/Input.js';
import { Modal } from '../../ui/Modal.js';

export function WorkspaceModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { keyPrefix: string; name: string; description?: string }) => Promise<Workspace>;
}) {
  const [keyPrefix, setKeyPrefix] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setKeyPrefix('');
    setName('');
    setDescription('');
    setError(null);
    setBusy(false);
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onCreate({
        keyPrefix: keyPrefix.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create workspace');
      setBusy(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="secondary" type="button" disabled={busy} onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" form="workspace-form" disabled={busy}>
        {busy ? 'Creating…' : 'Create workspace'}
      </Button>
    </div>
  );

  return (
    <Modal open={open} title="Create workspace" onClose={onClose} footer={footer}>
      <form id="workspace-form" className="space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
            Workspace key prefix
          </label>
          <Input
            placeholder="Demo: APP"
            value={keyPrefix}
            onChange={(e) => setKeyPrefix(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Display name</label>
          <Input placeholder="Marketing delivery" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">Description</label>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-jira-border bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </div>

        {error ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div> : null}
      </form>
    </Modal>
  );
}
