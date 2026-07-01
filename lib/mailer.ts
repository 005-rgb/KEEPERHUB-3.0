import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  toEmail: string,
  toNama: string,
  resetUrl: string
) {
  await transporter.sendMail({
    from: `"KeeperHub" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Reset Kata Sandi KeeperHub",
    html: `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f2ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2ff;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:rgba(255,255,255,0.95);border-radius:20px;padding:40px;box-shadow:0 4px 40px rgba(99,102,241,0.12);">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:14px;padding:12px;margin-bottom:12px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 22V12h6v10" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">KeeperHub</div>
              <div style="font-size:11px;color:#6366f1;letter-spacing:2px;text-transform:uppercase;font-weight:600;margin-top:2px;">Manajemen Aset HNWI</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Reset Kata Sandi</h2>
              <p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">Halo <strong style="color:#0f172a;">${toNama}</strong>,</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.6;">
                Kami menerima permintaan untuk mereset kata sandi akun KeeperHub Anda. Klik tombol di bawah untuk membuat kata sandi baru.
              </p>
              <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
                Link ini hanya berlaku selama <strong style="color:#0f172a;">1 jam</strong> dan hanya dapat digunakan sekali.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.2px;box-shadow:0 4px 15px rgba(99,102,241,0.35);">
                Reset Kata Sandi
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;background:rgba(99,102,241,0.04);border-radius:12px;border:1px solid rgba(99,102,241,0.1);">
              <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">Jika tombol tidak bisa diklik, salin URL berikut ke browser Anda:</p>
              <p style="margin:0;font-size:11px;color:#6366f1;word-break:break-all;">${resetUrl}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                Jika Anda tidak meminta reset kata sandi, abaikan email ini. Akun Anda tetap aman.<br><br>
                &copy; ${new Date().getFullYear()} KeeperHub · Manajemen Aset HNWI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
