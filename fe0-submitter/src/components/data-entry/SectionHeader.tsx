type SectionHeaderProps = {
  number: number;
  title: string;
  first?: boolean;
};

/** spec §3 */
export function SectionHeader({ number, title, first }: SectionHeaderProps) {
  return (
    <h3
      className={`border-b border-blue-100 pb-2 text-sm font-black uppercase tracking-widest text-blue-600 ${first ? 'mb-6 mt-0' : 'mb-6 mt-8'}`}
    >
      {number}. {title}
    </h3>
  );
}
