import { useState } from 'react';
import { LoginSealPlaceholder } from './LoginSealPlaceholder.js';

/** Large aqua watermark + uni name — right third of viewport (desktop). */
export function LoginBrandingPanel() {
  const [sealBroken, setSealBroken] = useState(false);

  return (
    <div
      className="pointer-events-none absolute right-[2%] top-[clamp(64px,9vh,112px)] z-[6] hidden w-[min(420px,40vw)] select-none lg:block"
      aria-hidden
    >
      <div className="flex flex-col items-end gap-6 text-right">
        <h2 className="max-w-[min(440px,40vw)] text-[clamp(28px,3.75vw,44px)] font-extrabold uppercase leading-[1.06] tracking-[0.02em] text-ump-branding-aqua [text-shadow:0_2px_18px_rgba(255,255,255,0.85),0_0_1px_rgba(255,255,255,0.95)]">
          Đại học y dược
          <br />
          Thành phố Hồ Chí Minh
        </h2>
      </div>
    </div>
  );
}
