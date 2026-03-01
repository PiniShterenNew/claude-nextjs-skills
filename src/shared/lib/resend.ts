import { Resend } from 'resend'
import { env } from './env'

const resend = new Resend(env.RESEND_API_KEY)

interface InvitationEmailParams {
  to: string
  workspaceName: string
  role: string
  inviteUrl: string
}

interface VerificationEmailParams {
  to: string
  verifyUrl: string
}

interface PasswordResetEmailParams {
  to: string
  resetUrl: string
}

export async function sendInvitationEmail({
  to,
  workspaceName,
  role,
  inviteUrl,
}: InvitationEmailParams): Promise<void> {
  const roleLabels: Record<string, string> = {
    OWNER: 'בעלים',
    MANAGER: 'מנהל',
    CHEF: 'שף',
    VIEWER: 'צופה',
  }
  const roleLabel = roleLabels[role] ?? role

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `הוזמנת להצטרף ל-${workspaceName} ב-MenuCost`,
    html: `
      <div dir="rtl" style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2>הזמנה ל-${workspaceName}</h2>
        <p>הוזמנת להצטרף לסביבת העבודה <strong>${workspaceName}</strong> בתפקיד <strong>${roleLabel}</strong>.</p>
        <p>
          <a href="${inviteUrl}" style="background:#2563EB;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
            קבל הזמנה
          </a>
        </p>
        <p style="color:#64748B;font-size:12px;">הקישור תקף ל-48 שעות.</p>
      </div>
    `,
  })
}

export async function sendVerificationEmail({
  to,
  verifyUrl,
}: VerificationEmailParams): Promise<void> {
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: 'אמת את כתובת האימייל שלך — MenuCost',
    html: `
      <div dir="rtl" style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2>אימות כתובת אימייל</h2>
        <p>לחץ על הכפתור לאימות כתובת האימייל שלך:</p>
        <p>
          <a href="${verifyUrl}" style="background:#2563EB;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
            אמת אימייל
          </a>
        </p>
        <p style="color:#64748B;font-size:12px;">הקישור תקף ל-24 שעות.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: PasswordResetEmailParams): Promise<void> {
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: 'איפוס סיסמה — MenuCost',
    html: `
      <div dir="rtl" style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2>איפוס סיסמה</h2>
        <p>קיבלנו בקשה לאיפוס הסיסמה שלך. לחץ על הכפתור להמשך:</p>
        <p>
          <a href="${resetUrl}" style="background:#2563EB;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
            אפס סיסמה
          </a>
        </p>
        <p style="color:#64748B;font-size:12px;">הקישור תקף לשעה אחת. אם לא ביקשת איפוס, התעלם מהודעה זו.</p>
      </div>
    `,
  })
}
