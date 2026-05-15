/** Faceted crystal logo — dense radial spokes like reference (~68×68 render). */
export function LoginMoleculeIcon({ className = '' }: { className?: string }) {
  const spokes = 16;

  return (
    <svg className={className} width={68} height={68} viewBox="0 0 64 64" aria-hidden>
      {Array.from({ length: spokes }, (_, i) => {
        const deg = (360 / spokes) * i;
        return (
          <g key={deg} transform={`rotate(${deg} 32 32)`}>
            <line
              x1="32"
              y1="34"
              x2="32"
              y2="9"
              stroke={i % 2 === 0 ? '#2BA3D8' : '#2288C2'}
              strokeWidth={2.25}
              strokeLinecap="round"
            />
            <circle cx="32" cy="8" r={3.25} fill="#4EC1F0" />
          </g>
        );
      })}
      <circle cx="32" cy="32" r={10.5} fill="#1A5FA8" />
      <circle cx="32" cy="32" r={7} fill="#2580C4" opacity={0.45} />
      <circle cx="32" cy="32" r={4.75} fill="#1A5FA8" />
    </svg>
  );
}
