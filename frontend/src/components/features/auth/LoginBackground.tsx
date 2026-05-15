/**
 * Full-bleed campus photo per mockup — softly blurred wash, lighter on the right
 * so the watermark seal reads clearly. Requires `/ump-campus.png` in `public/`.
 */
export function LoginBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-[#c9dbe9]" aria-hidden />

      {/* Blurred photo (matches reference: soft, low-contrast building) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center brightness-[1.06] saturate-[0.72] [transform:translateZ(0)_scale(1.08)] [filter:blur(11px)]"
        style={{
          backgroundImage: `linear-gradient(rgb(237 246 253 / 0.12), rgb(237 246 253 / 0.12)), url('/ump-campus.png')`,
          backgroundPosition: 'center center',
          backgroundBlendMode: 'normal',
        }}
        aria-hidden
      />

      {/* Left-to-right haze — keeps building muted, opens mid/right for aqua branding */}
      <div
        className="fixed inset-0 z-[1] bg-gradient-to-r from-slate-400/35 via-transparent to-sky-200/45 mix-blend-soft-light"
        aria-hidden
      />
      <div
        className="fixed inset-0 z-[1] bg-[linear-gradient(105deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.35)_52%,rgba(186,226,246,0.55)_85%,rgba(150,209,239,0.45)_100%)]"
        aria-hidden
      />
      {/* Subtle vignette */}
      <div
        className="fixed inset-0 z-[1] bg-[radial-gradient(ellipse_70%_90%_at_40%_45%,transparent_35%,rgba(255,255,255,0.75)_125%)] opacity-95"
        aria-hidden
      />
    </>
  );
}
