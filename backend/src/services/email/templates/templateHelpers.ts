function primaryFrontendOrigin(): string {
  const raw = process.env.FRONTEND_ORIGIN?.split(',')[0]?.trim();
  return raw ?? 'http://localhost:5173';
}

export const deadlineTable = (date: string) => `
  <table style="border-collapse:collapse;width:100%;margin:16px 0;">
    <tr style="background:#fef3c7;">
      <td style="padding:8px 12px;border:1px solid #fcd34d;font-weight:bold;">Thời hạn</td>
      <td style="padding:8px 12px;border:1px solid #fcd34d;color:red;font-weight:bold;">${date}</td>
    </tr>
  </table>
`;

export const ctaButton = (color: string) => `
  <a href="${primaryFrontendOrigin()}"
     style="background:${color};color:#fff;padding:10px 20px;
            border-radius:5px;text-decoration:none;display:inline-block;margin-top:12px;">
    Vào hệ thống
  </a>
`;

export const footer = () => `
  <p style="margin-top:24px;color:#6b7280;font-size:12px;">
    Email này được gửi tự động từ hệ thống RMS – UMP. Vui lòng không trả lời email này.
  </p>
`;
