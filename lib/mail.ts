/**
 * lib/mail.ts
 *
 * Single entry point for every transactional email the platform sends
 * (email verification, password reset, email-change confirmation, etc.).
 *
 * Uses Resend when RESEND_API_KEY is configured. If it isn't configured
 * (e.g. local development without an email provider set up yet), emails
 * are logged to the server console instead of silently failing — this
 * keeps every flow (register, forgot password, ...) fully testable
 * end-to-end without requiring a paid/external service.
 */

import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.MAIL_FROM_ADDRESS || "no-reply@aksa.id";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    // Dev fallback — no email provider configured. Print the content so the
    // flow (verification link, reset link, ...) is still testable locally.
    console.warn(
      `[MAIL_DEV_FALLBACK] RESEND_API_KEY belum diset — email berikut TIDAK benar-benar terkirim, hanya dicetak untuk keperluan development:\n` +
        `To: ${to}\nSubject: ${subject}\n---\n${text}\n---`
    );
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[MAIL_SEND_ERROR]", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[MAIL_SEND_EXCEPTION]", error);
    return { success: false, error: "Gagal mengirim email." };
  }
}

function emailShell(siteName: string, title: string, bodyHtml: string, footerNote: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;padding:32px 24px;">
      <tr><td>
        <p style="color:#9b6dff;font-weight:600;font-size:14px;letter-spacing:0.02em;margin:0 0 24px;">${siteName}</p>
        <h1 style="color:#f5f5f7;font-size:20px;margin:0 0 16px;">${title}</h1>
        <div style="color:#a1a1aa;font-size:14px;line-height:1.6;">${bodyHtml}</div>
        <p style="color:#71717a;font-size:12px;margin-top:32px;">${footerNote}</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function buildVerifyEmailTemplate(siteName: string, verifyUrl: string) {
  const html = emailShell(
    siteName,
    "Verifikasi alamat email kamu",
    `<p>Klik tombol di bawah untuk memverifikasi email dan mengaktifkan akunmu.</p>
     <p style="margin:24px 0;"><a href="${verifyUrl}" style="background:#9b6dff;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Verifikasi Email</a></p>
     <p>Atau salin tautan ini: <br/><span style="word-break:break-all;">${verifyUrl}</span></p>`,
    "Tautan berlaku selama 24 jam. Abaikan email ini jika kamu tidak mendaftar."
  );
  const text = `Verifikasi email kamu di ${siteName}: ${verifyUrl} (berlaku 24 jam)`;
  return { html, text };
}

export function buildResetPasswordTemplate(siteName: string, resetUrl: string) {
  const html = emailShell(
    siteName,
    "Reset password kamu",
    `<p>Kami menerima permintaan untuk mereset password akunmu.</p>
     <p style="margin:24px 0;"><a href="${resetUrl}" style="background:#9b6dff;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Reset Password</a></p>
     <p>Atau salin tautan ini: <br/><span style="word-break:break-all;">${resetUrl}</span></p>`,
    "Tautan berlaku selama 1 jam. Kalau kamu tidak meminta ini, abaikan saja — password lamamu tetap aman."
  );
  const text = `Reset password akunmu di ${siteName}: ${resetUrl} (berlaku 1 jam)`;
  return { html, text };
}

export function buildEmailChangeTemplate(siteName: string, confirmUrl: string, newEmail: string) {
  const html = emailShell(
    siteName,
    "Konfirmasi email baru",
    `<p>Kamu meminta untuk mengganti email akun menjadi <strong>${newEmail}</strong>.</p>
     <p style="margin:24px 0;"><a href="${confirmUrl}" style="background:#9b6dff;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Konfirmasi Email Baru</a></p>
     <p>Atau salin tautan ini: <br/><span style="word-break:break-all;">${confirmUrl}</span></p>`,
    "Tautan berlaku selama 1 jam. Kalau kamu tidak meminta ini, abaikan email ini — email akunmu tidak akan berubah."
  );
  const text = `Konfirmasi email baru untuk akunmu di ${siteName}: ${confirmUrl} (berlaku 1 jam)`;
  return { html, text };
}
