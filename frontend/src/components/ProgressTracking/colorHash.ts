/** Spec §9.8 — hash-colored department capsule */
const TAG_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-indigo-100 text-indigo-700',
] as const;

const AVATAR_BACKGROUNDS = [
  'bg-violet-600',
  'bg-cyan-600',
  'bg-rose-600',
  'bg-emerald-600',
  'bg-orange-600',
  'bg-indigo-600',
] as const;

export function tagColorClasses(name: string): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length] ?? TAG_COLORS[0];
}

export function avatarTintFromString(name: string): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_BACKGROUNDS[hash % AVATAR_BACKGROUNDS.length] ?? AVATAR_BACKGROUNDS[0];
}
