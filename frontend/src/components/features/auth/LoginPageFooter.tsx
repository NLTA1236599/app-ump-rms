export function LoginPageFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[25] px-4 py-2.5 text-center text-[11px] font-normal tracking-[0.05em] text-ump-navy/75 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
      @{year} - TRƯỜNG ĐẠI HỌC Y DƯỢC TPHCM
    </footer>
  );
}
