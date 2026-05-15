/** Bottom wave band across full viewport width (matches reference curve). */
export function LoginBlueWave() {
  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-[3] h-[min(54vh,520px)] w-full overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute bottom-0 h-full min-w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 420"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ump-wave-top" x1="0%" y1="100%" x2="100%" y2="40%">
            <stop offset="0%" stopColor="#2B81D4" stopOpacity={0.75} />
            <stop offset="55%" stopColor="#3BADEB" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#5FD0F9" stopOpacity={0.45} />
          </linearGradient>
          <linearGradient id="ump-wave-fill" x1="100%" y1="100%" x2="0%" y2="30%">
            <stop offset="0%" stopColor="#2175AE" stopOpacity={0.95} />
            <stop offset="45%" stopColor="#3BA3DA" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#5EC7F7" stopOpacity={0.35} />
          </linearGradient>
        </defs>
        <path
          d="M0,418 C380,218 740,488 928,348 C1180,168 1280,-12 1480,-20 L1480,420 L0,420 Z"
          fill="url(#ump-wave-fill)"
        />
        <path
          d="M0,420 Q420,240 720,332 T1440,196 L1440,420 Z"
          fill="url(#ump-wave-top)"
          opacity={0.45}
        />
      </svg>
    </div>
  );
}
