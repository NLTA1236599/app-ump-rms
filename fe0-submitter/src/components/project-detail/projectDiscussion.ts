import type { ProjectDiscussionNote, ResearchProject } from '../../types/researchProject.js';
import type { User } from '../../types/index.js';

/** Roles treated as staff — notes from non-staff users notify admins. */
const STAFF_ROLES = new Set(['admin', 'specialist', 'leader']);

function makeId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export function formatDiscussionAuthor(user: User | null): string {
  return user?.displayName?.trim() || user?.username || 'Người dùng';
}

export function isNoteOwner(note: ProjectDiscussionNote, user: User | null): boolean {
  if (!user) return false;
  if (note.authorId) return note.authorId === user.id;
  return note.author === formatDiscussionAuthor(user);
}

export type AppendNoteOptions = {
  /** User ids with role `admin` — required to notify admins when a regular user posts. */
  adminUserIds?: string[];
  /** User ids @mentioned in the comment — each receives a targeted notification. */
  mentionedUserIds?: string[];
};

export function resolveNoteRecipientIds(
  project: ResearchProject,
  author: User | null,
  adminUserIds: string[] = [],
  mentionedUserIds: string[] = [],
): string[] {
  const authorId = author?.id;
  if (!authorId) return [];

  const recipients = new Set<string>();
  const authorIsStaff = STAFF_ROLES.has(author.role);

  if (!authorIsStaff) {
    for (const adminId of adminUserIds) {
      if (adminId !== authorId) recipients.add(adminId);
    }
  }

  const specialistId = project.supervisorId?.trim();
  if (specialistId && specialistId !== authorId) {
    recipients.add(specialistId);
  }

  for (const mentionedId of mentionedUserIds) {
    if (mentionedId && mentionedId !== authorId) {
      recipients.add(mentionedId);
    }
  }

  return [...recipients];
}

function pushNoteNotifications(
  project: ResearchProject,
  note: ProjectDiscussionNote,
  author: User | null,
  options: AppendNoteOptions = {},
): ResearchProject['noteNotifications'] {
  const noteNotifications = [...(project.noteNotifications ?? [])];
  const mentionedUserIds = options.mentionedUserIds ?? [];
  const mentionedSet = new Set(mentionedUserIds);
  const recipientIds = resolveNoteRecipientIds(
    project,
    author,
    options.adminUserIds ?? [],
    mentionedUserIds,
  );

  for (const forUserId of recipientIds) {
    const isMentioned = mentionedSet.has(forUserId);
    noteNotifications.unshift({
      id: makeId(),
      noteId: note.id,
      forUserId,
      projectId: project.id,
      projectTitle: project.title,
      message: isMentioned
        ? `${note.author} đã nhắc đến bạn trong ghi chú về đề tài "${project.title}"`
        : `${note.author} đã để lại ghi chú về đề tài "${project.title}"`,
      read: false,
      createdAt: note.createdAt,
    });
  }

  return noteNotifications;
}

export function appendProjectNote(
  project: ResearchProject,
  content: string,
  author: User | null,
  parentId?: string,
  options?: AppendNoteOptions,
): ResearchProject {
  const mentionedUserIds = options?.mentionedUserIds ?? [];
  const note: ProjectDiscussionNote = {
    id: makeId(),
    content: content.trim(),
    author: formatDiscussionAuthor(author),
    authorId: author?.id,
    createdAt: new Date().toISOString(),
    likedBy: [],
    parentId,
    mentionedUserIds: mentionedUserIds.length ? mentionedUserIds : undefined,
  };

  const projectNotes = [note, ...(project.projectNotes ?? [])];
  const noteNotifications = pushNoteNotifications(project, note, author, options);

  return { ...project, projectNotes, noteNotifications };
}

export function toggleNoteLike(
  project: ResearchProject,
  noteId: string,
  userId: string,
): ResearchProject {
  const projectNotes = (project.projectNotes ?? []).map((note) => {
    if (note.id !== noteId) return note;
    const likedBy = note.likedBy ?? [];
    const hasLiked = likedBy.includes(userId);
    return {
      ...note,
      likedBy: hasLiked ? likedBy.filter((id) => id !== userId) : [...likedBy, userId],
    };
  });
  return { ...project, projectNotes };
}

export function editProjectNote(
  project: ResearchProject,
  noteId: string,
  content: string,
  user: User | null,
): ResearchProject | null {
  const trimmed = content.trim();
  if (!trimmed) return null;

  let allowed = false;
  const projectNotes = (project.projectNotes ?? []).map((note) => {
    if (note.id !== noteId) return note;
    if (!isNoteOwner(note, user)) return note;
    allowed = true;
    return {
      ...note,
      content: trimmed,
      updatedAt: new Date().toISOString(),
    };
  });

  return allowed ? { ...project, projectNotes } : null;
}

export function deleteProjectNote(
  project: ResearchProject,
  noteId: string,
  user: User | null,
): ResearchProject | null {
  const target = (project.projectNotes ?? []).find((n) => n.id === noteId);
  if (!target || !isNoteOwner(target, user)) return null;

  const idsToRemove = new Set<string>([noteId]);
  for (const note of project.projectNotes ?? []) {
    if (note.parentId && idsToRemove.has(note.parentId)) {
      idsToRemove.add(note.id);
    }
  }
  // Collect nested replies (one pass may miss deep nesting — loop until stable)
  let changed = true;
  while (changed) {
    changed = false;
    for (const note of project.projectNotes ?? []) {
      if (note.parentId && idsToRemove.has(note.parentId) && !idsToRemove.has(note.id)) {
        idsToRemove.add(note.id);
        changed = true;
      }
    }
  }

  const projectNotes = (project.projectNotes ?? []).filter((n) => !idsToRemove.has(n.id));
  const noteNotifications = (project.noteNotifications ?? []).filter((n) => n.noteId !== noteId);

  return { ...project, projectNotes, noteNotifications };
}

export function markNoteNotificationsRead(
  project: ResearchProject,
  userId: string,
): ResearchProject {
  const noteNotifications = (project.noteNotifications ?? []).map((n) =>
    n.forUserId === userId ? { ...n, read: true } : n,
  );
  return { ...project, noteNotifications };
}

export function markSingleNoteNotificationRead(
  project: ResearchProject,
  notificationId: string,
  userId: string,
): ResearchProject {
  const noteNotifications = (project.noteNotifications ?? []).map((n) =>
    n.id === notificationId && n.forUserId === userId ? { ...n, read: true } : n,
  );
  return { ...project, noteNotifications };
}

export function countUnreadNoteNotifications(
  project: ResearchProject,
  userId?: string,
): number {
  if (!userId) return 0;
  return (project.noteNotifications ?? []).filter((n) => n.forUserId === userId && !n.read)
    .length;
}

export function getTopLevelNotes(notes: ProjectDiscussionNote[]): ProjectDiscussionNote[] {
  return notes
    .filter((n) => !n.parentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getNoteReplies(
  notes: ProjectDiscussionNote[],
  parentId: string,
): ProjectDiscussionNote[] {
  return notes
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export type FeedItem =
  | { kind: 'workflow'; step: number; updatedAt: string; user: string; isRevert?: boolean }
  | ({ kind: 'note' } & ProjectDiscussionNote);

export function buildDiscussionFeed(
  workflowHistory: ResearchProject['workflowHistory'],
  notes: ProjectDiscussionNote[],
): FeedItem[] {
  const workflowItems: FeedItem[] = (workflowHistory ?? []).map((h) => ({
    kind: 'workflow' as const,
    ...h,
  }));
  const noteItems: FeedItem[] = getTopLevelNotes(notes).map((n) => ({
    kind: 'note' as const,
    ...n,
  }));
  return [...workflowItems, ...noteItems].sort((a, b) => {
    const ta = a.kind === 'workflow' ? a.updatedAt : a.createdAt;
    const tb = b.kind === 'workflow' ? b.updatedAt : b.createdAt;
    return new Date(tb).getTime() - new Date(ta).getTime();
  });
}

function mergeNoteFields(local: ProjectDiscussionNote, remote: ProjectDiscussionNote): ProjectDiscussionNote {
  const likedBy = [...new Set([...(remote.likedBy ?? []), ...(local.likedBy ?? [])])];
  const localTime = new Date(local.updatedAt ?? local.createdAt).getTime();
  const remoteTime = new Date(remote.updatedAt ?? remote.createdAt).getTime();
  const base = localTime >= remoteTime ? local : remote;
  return { ...base, likedBy };
}

/** Keep the newest union of notes when polling — avoids stale server data wiping local notes. */
export function mergeProjectNotes(
  local: ResearchProject,
  remote: ResearchProject,
): ResearchProject {
  const byId = new Map<string, ProjectDiscussionNote>();
  for (const note of remote.projectNotes ?? []) byId.set(note.id, note);
  for (const note of local.projectNotes ?? []) {
    const existing = byId.get(note.id);
    byId.set(note.id, existing ? mergeNoteFields(note, existing) : note);
  }

  const projectNotes = [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const notificationById = new Map(
    (remote.noteNotifications ?? []).map((n) => [n.id, n]),
  );
  for (const n of local.noteNotifications ?? []) {
    if (!notificationById.has(n.id)) notificationById.set(n.id, n);
  }

  return {
    ...remote,
    projectNotes,
    noteNotifications: [...notificationById.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  };
}
