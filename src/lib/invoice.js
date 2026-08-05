import PDFDocument from "pdfkit";
import { format } from "date-fns";

const BRAND = "Room Booking & Management";
const BLUE = "#0ea5e9";
const DARK = "#0f172a";
const MUTED = "#64748b";
const LIGHT = "#e2e8f0";

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const invoiceNumber = (b) => `INV-${format(new Date(b.createdAt || new Date()), "yyyyMMdd")}-${String(b._id).slice(-6).toUpperCase()}`;

function drawHeader(doc) {
  doc.rect(0, 0, doc.page.width, 96).fill(BLUE);
  doc
    .fill("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(22)
    .text(BRAND, 48, 30);
  doc
    .font("Helvetica")
    .fontSize(11)
    .text("Invoice & Booking Receipt", 48, 60);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("RMB-LTD", doc.page.width - 48, 34, { align: "right" });
  doc
    .font("Helvetica")
    .fontSize(9)
    .text("123 Hotel Avenue, City\nTax ID: 0000-0000-0000\nsupport@roombook.com", doc.page.width - 48, 54, { align: "right", width: 180 });
  doc.y = 120;
}

function drawSectionTitle(doc, text) {
  doc
    .fill(BLUE)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(text.toUpperCase(), 48, doc.y);
  doc.moveDown(0.4);
}

function drawInfoTable(doc, rows, leftWidth = 240) {
  rows.forEach(([k, v]) => {
    const y = doc.y;
    doc.fill(MUTED).font("Helvetica").fontSize(9).text(k, 48, y, { width: leftWidth });
    doc.fill(DARK).font("Helvetica-Bold").fontSize(9).text(String(v), 48 + leftWidth, y, { width: doc.page.width - 48 - leftWidth - 48, align: "right" });
    doc.moveDown(0.5);
  });
  doc.moveDown(0.5);
}

function drawLineItems(doc, booking) {
  const nights = booking.nights || 1;
  const rate = booking.roomId?.rent || 0;
  const colX = [48, 190, 350, 430, doc.page.width - 48];
  const headers = ["Description", "Qty", "Rate", "Amount"];

  doc.fill(LIGHT).rect(48, doc.y - 6, doc.page.width - 96, 18).fill();
  doc.fill(DARK).font("Helvetica-Bold").fontSize(9);
  doc.text(booking.roomId?.title || "Room", colX[0], doc.y);
  doc.text(String(nights), colX[1], doc.y);
  doc.text(money(rate), colX[2], doc.y);
  doc.text(money(booking.subtotal ?? rate * nights), colX[3], doc.y);
  doc.moveDown(1.4);

  doc.fill(MUTED).font("Helvetica").fontSize(8.5);
  doc.text(`${format(new Date(booking.checkInDate), "MMM d, yyyy")} · ${booking.checkInTime || ""} → ${format(new Date(booking.checkOutDate), "MMM d, yyyy")} · ${booking.checkOutTime || ""}`, colX[0], doc.y);
  doc.moveDown(0.8);

  // Totals
  const line = (label, value, bold = false) => {
    doc
      .fill(bold ? DARK : MUTED)
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(bold ? 10 : 9)
      .text(label, colX[2], doc.y);
    doc
      .fill(bold ? BLUE : DARK)
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(bold ? 10 : 9)
      .text(value, colX[3], doc.y, { align: "right" });
    doc.moveDown(0.6);
  };

  doc.moveDown(0.5);
  line("Subtotal", money(booking.subtotal ?? 0));
  line(`Tax & fees (8%)`, money(booking.tax ?? 0));
  doc.moveDown(0.2);
  line("TOTAL", money(booking.totalAmount ?? 0), true);
}

/**
 * Builds a payment-status label used on the invoice.
 */
const statusLabel = (status) =>
  status === "PAID" ? "PAID" : status === "REFUNDED" ? "REFUNDED" : "UNPAID / PENDING";

/**
 * Generates the invoice PDF buffer for a booking.
 */
export async function generateInvoicePdf(booking) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });

      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      drawHeader(doc);

      doc
        .fill(DARK)
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("INVOICE", 48, 120);
      doc
        .fill(BLUE)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(invoiceNumber(booking), 48, doc.y + 2);
      doc.moveDown(1.2);

      // Billed to
      const guestName = booking.contactName || booking.userId?.name || "Guest";
      const guestEmail = booking.contactEmail || booking.userId?.email || "";
      const guestPhone = booking.contactPhone || "";
      drawSectionTitle(doc, "Billed To");
      doc.fill(DARK).font("Helvetica-Bold").fontSize(10).text(guestName, 48, doc.y);
      doc.fill(MUTED).font("Helvetica").fontSize(9);
      doc.text(guestEmail, 48, doc.y);
      if (guestPhone) doc.text(guestPhone, 48, doc.y);
      doc.moveDown(0.8);

      // Summary
      drawSectionTitle(doc, "Summary");
      drawInfoTable(doc, [
        ["Booking reference", `#${booking._id}`],
        ["Booking date", format(new Date(booking.createdAt || new Date()), "MMM d, yyyy")],
        ["Room category", booking.roomId?.category || "—"],
        ["Guests", `${booking.guests || 1}`],
        ["Nights", `${booking.nights || 1}`],
        ["Payment status", statusLabel(booking.paymentStatus)],
      ]);

      // Line items
      drawSectionTitle(doc, "Line Items");
      drawLineItems(doc, booking);

      if (booking.specialRequests) {
        doc.moveDown(0.8);
        doc.fill(MUTED).font("Helvetica").fontSize(9).text("Special requests:", 48, doc.y);
        doc.fill(DARK).font("Helvetica").fontSize(9).text(booking.specialRequests, 48, doc.y);
      }

      // Footer
      const footer = (doc) => {
        doc
          .fill(MUTED)
          .font("Helvetica")
          .fontSize(8.5)
          .text(
            "Thank you for choosing Room Booking & Management. For questions about this invoice contact support@roombook.com.",
            48,
            doc.page.height - 48,
            { width: doc.page.width - 96, align: "center" }
          );
        doc
          .fill(MUTED)
          .fontSize(8)
          .text(`Page ${doc.page.pageNumber}`, doc.page.width - 48, doc.page.height - 48, { align: "right" });
      };

      footer(doc);

      // If content overflowed to multiple pages, stamp a footer on each.
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc
          .fill(MUTED)
          .font("Helvetica")
          .fontSize(8)
          .text(`Page ${i + 1}`, doc.page.width - 48, doc.page.height - 48, { align: "right" });
      }
      doc.switchToPage(range.count - 1);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
