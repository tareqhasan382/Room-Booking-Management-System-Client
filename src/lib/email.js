import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import path from "path";
import { format } from "date-fns";

/**
 * Email service.
 *
 * Production: set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/EMAIL_FROM to use a
 * real mail server. Without those, emails are rendered and written to
 * data/emails/*.html so the pipeline can be verified locally.
 */

const FROM = process.env.EMAIL_FROM || "Room Booking & Management <no-reply@roombook.com>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const useSmtp = Boolean(process.env.SMTP_HOST);

let transporter = null;
if (useSmtp) {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  });
}

const ESC = { name: (s) => String(s ?? ""), safe: (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])) };

const layout = ({ title, body }) => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${ESC.safe(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
        <tr><td style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:24px 32px">
          <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold">Room Booking &amp; Management</p>
          <p style="margin:4px 0 0;color:#e0f2fe;font-size:12px">${ESC.safe(title)}</p>
        </td></tr>
        <tr><td style="padding:28px 32px">
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0">
          <p style="margin:0;font-size:12px;color:#64748b">Thank you for choosing Room Booking &amp; Management.</p>
          <p style="margin:6px 0 0;font-size:12px;color:#94a3b8">Questions? <a href="mailto:support@roombook.com" style="color:#0ea5e9">support@roombook.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const bookingTable = (b) => {
  const dateFmt = (d, t) =>
    `${format(new Date(d), "EEEE, MMM d, yyyy")} · ${t || ""}`;
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:16px 0">
    <tr style="background:#f8fafc"><td style="padding:10px 16px;font-size:11px;color:#64748b">ROOM</td><td style="padding:10px 16px;font-size:13px;font-weight:600">${ESC.safe(b.roomId?.title || "—")}</td></tr>
    <tr style="border-top:1px solid #e2e8f0"><td style="padding:10px 16px;font-size:11px;color:#64748b">CHECK-IN</td><td style="padding:10px 16px;font-size:13px">${ESC.safe(dateFmt(b.checkInDate, b.checkInTime))}</td></tr>
    <tr style="border-top:1px solid #e2e8f0"><td style="padding:10px 16px;font-size:11px;color:#64748b">CHECK-OUT</td><td style="padding:10px 16px;font-size:13px">${ESC.safe(dateFmt(b.checkOutDate, b.checkOutTime))}</td></tr>
    <tr style="border-top:1px solid #e2e8f0"><td style="padding:10px 16px;font-size:11px;color:#64748b">GUESTS</td><td style="padding:10px 16px;font-size:13px">${ESC.safe(b.guests || 1)}</td></tr>
    <tr style="border-top:1px solid #e2e8f0"><td style="padding:10px 16px;font-size:11px;color:#64748b">BOOKING REF</td><td style="padding:10px 16px;font-size:13px">#${ESC.safe(b._id)}</td></tr>
    <tr style="border-top:1px solid #e2e8f0"><td style="padding:10px 16px;font-size:11px;color:#64748b">TOTAL</td><td style="padding:10px 16px;font-size:16px;font-weight:700;color:#0ea5e9">${money(b.totalAmount)}</td></tr>
  </table>`;
};

const buildBookingConfirmation = (b) =>
  layout({
    title: "Booking Confirmation",
    body: `
    <h1 style="margin:0 0 6px;font-size:20px">Your booking is confirmed 🎉</h1>
    <p style="margin:0 0 4px;font-size:14px;color:#475569">Hi ${ESC.safe(b.contactName || b.userId?.name || "there")},</p>
    <p style="margin:0 0 4px;font-size:14px;color:#475569">Thanks for booking with us. Here are the details of your stay:</p>
    ${bookingTable(b)}
    <p style="margin:16px 0 0;font-size:13px;color:#475569">A copy of your invoice is attached. You can also download it any time from <a href="${SITE_URL}/order" style="color:#0ea5e9">My Bookings</a>.</p>
    ${b.specialRequests ? `<p style="margin:12px 0 0;font-size:13px;color:#475569">Special requests: <strong>${ESC.safe(b.specialRequests)}</strong></p>` : ""}
    <p style="margin:12px 0 0;font-size:13px;color:#475569">Payment status: <strong>${ESC.safe(b.paymentStatus || "UNPAID")}</strong></p>`,
  });

const buildPaymentReceipt = (p, b) =>
  layout({
    title: "Payment Receipt",
    body: `
    <h1 style="margin:0 0 6px;font-size:20px">Payment received</h1>
    <p style="margin:0 0 4px;font-size:14px;color:#475569">Hi ${ESC.safe(b.contactName || b.userId?.name || "there")},</p>
    <p style="margin:0 0 4px;font-size:14px;color:#475569">We have received your payment of <strong>${money(p.amount)}</strong>. Your booking is now fully paid.</p>
    ${bookingTable(b)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:16px 0">
      <tr style="background:#f8fafc"><td style="padding:10px 16px;font-size:11px;color:#64748b">TRANSACTION ID</td><td style="padding:10px 16px;font-size:13px">${ESC.safe(p.transactionId || "—")}</td></tr>
      <tr style="border-top:1px solid #e2e8f0"><td style="padding:10px 16px;font-size:11px;color:#64748b">CARD</td><td style="padding:10px 16px;font-size:13px">${ESC.safe(p.cardBrand || "Card")} •••• ${ESC.safe(p.cardLast4 || "••••")}</td></tr>
      <tr style="border-top:1px solid #e2e8f0"><td style="padding:10px 16px;font-size:11px;color:#64748b">PAID AT</td><td style="padding:10px 16px;font-size:13px">${p.paidAt ? format(new Date(p.paidAt), "MMM d, yyyy h:mm a") : "—"}</td></tr>
    </table>
    <p style="margin:16px 0 0;font-size:13px;color:#475569">Your receipt is attached as a PDF and available from <a href="${SITE_URL}/order" style="color:#0ea5e9">My Bookings</a>.</p>`,
  });

const buildCancellationNotice = (b) =>
  layout({
    title: "Booking Cancelled",
    body: `
    <h1 style="margin:0 0 6px;font-size:20px">Booking cancelled</h1>
    <p style="margin:0 0 4px;font-size:14px;color:#475569">Hi ${ESC.safe(b.contactName || b.userId?.name || "there")},</p>
    <p style="margin:0 0 4px;font-size:14px;color:#475569">Your booking has been cancelled. ${b.paymentStatus === "REFUNDED" ? "Any payment made will be refunded to your original payment method." : "No payment was collected."}</p>
    ${bookingTable(b)}
    <p style="margin:16px 0 0;font-size:13px;color:#475569">We hope to host you another time. Browse rooms again at <a href="${SITE_URL}/" style="color:#0ea5e9">${SITE_URL}</a>.</p>`,
  });

async function persist(html, name) {
  const dir = path.join(process.cwd(), "data", "emails");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${name}.html`);
  await fs.writeFile(file, html, "utf8");
  return file;
}

/**
 * Sends an email. Never throws — failures are logged so booking flows are
 * never blocked by the mail provider.
 */
async function sendMail({ to, subject, html, attachments = [], label }) {
  try {
    if (!to) return;
    if (useSmtp && transporter) {
      await transporter.sendMail({ from: FROM, to, subject, html, attachments });
      console.log(`[email] sent "${label || subject}" to ${to}`);
    } else {
      const file = await persist(html, `${Date.now()}-${label || subject}`);
      console.log(`[email:dev] "${label || subject}" -> ${to} (saved ${file})`);
    }
  } catch (error) {
    console.error(`[email] failed "${label || subject}":`, error);
  }
}

export async function sendBookingConfirmation(booking) {
  const html = buildBookingConfirmation(booking);
  const to = booking.contactEmail || booking.userId?.email;
  await sendMail({
    to,
    subject: `Booking Confirmed — ${booking.roomId?.title || "Room"}`,
    html,
    label: "booking-confirmation",
  });
}

export async function sendPaymentReceipt(payment, booking) {
  const html = buildPaymentReceipt(payment, booking);
  const to = booking.contactEmail || booking.userId?.email;
  await sendMail({
    to,
    subject: `Payment Received — ${money(payment.amount)} for ${booking.roomId?.title || "Room"}`,
    html,
    label: "payment-receipt",
  });
}

export async function sendCancellationNotice(booking) {
  const html = buildCancellationNotice(booking);
  const to = booking.contactEmail || booking.userId?.email;
  await sendMail({
    to,
    subject: `Booking Cancelled — ${booking.roomId?.title || "Room"}`,
    html,
    label: "cancellation-notice",
  });
}
