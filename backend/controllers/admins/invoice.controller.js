const Invoice = require("../../models/invoice.model");
const PDFDocument = require("pdfkit");

// ─────────────────────────────────────────────
//  GET ALL INVOICES
// ─────────────────────────────────────────────
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("studentId", "admissionNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    console.error("Get Invoice Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ─── By Student ID ────────────────────────────────────────────
exports.downloadInvoiceByStudent = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ studentId: req.params.studentId })
      .populate("studentId");

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    await buildInvoicePDF(invoice, res);
  } catch (error) {
    console.error("Download Invoice By Student Error:", error);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: "Invoice generation failed." });
  }
};
// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

/**
 * Draw a rounded rectangle using Bezier curves (PDFKit lacks native rx/ry).
 */
function roundRect(doc, x, y, w, h, r = 6) {
  doc
    .moveTo(x + r, y)
    .lineTo(x + w - r, y)
    .quadraticCurveTo(x + w, y, x + w, y + r)
    .lineTo(x + w, y + h - r)
    .quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    .lineTo(x + r, y + h)
    .quadraticCurveTo(x, y + h, x, y + h - r)
    .lineTo(x, y + r)
    .quadraticCurveTo(x, y, x + r, y)
    .closePath();
}

/**
 * Draw a filled pill-shaped badge.
 */
function badge(doc, text, x, y, w, h, fillColor, textColor, fontSize = 7) {
  roundRect(doc, x, y, w, h, h / 2);
  doc.fill(fillColor);
  doc
    .fillColor(textColor)
    .font("Helvetica-Bold")
    .fontSize(fontSize)
    .text(text, x, y + (h - fontSize) / 2 + 1, { width: w, align: "center" });
}

/**
 * Draw a thin horizontal rule.
 */
function rule(doc, x1, x2, y, color = "#E5E7EB", lineWidth = 0.5) {
  doc.moveTo(x1, y).lineTo(x2, y).lineWidth(lineWidth).stroke(color);
}

// ─────────────────────────────────────────────
//  DOWNLOAD INVOICE PDF  — Ultra-Premium v4
// ─────────────────────────────────────────────
exports.downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate("studentId");

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    // ── Design Tokens ─────────────────────────────────────────────────────
    const BRAND = "#05717C";   // primary teal
    const BRAND_DARK = "#044E56";   // deep teal (header, grand-total)
    const BRAND_SOFT = "#E8F6F7";   // light teal tint (cards, row bg)
    const BRAND_MID = "#0A8C9A";   // mid teal (accents)

    const INK = "#111827";   // primary text
    const MUTED = "#6B7280";   // secondary text
    const PALE = "#9CA3AF";   // hint / label text
    const BORDER = "#E5E7EB";   // dividers
    const SURFACE = "#F9FAFB";   // alternate / panel bg
    const WHITE = "#FFFFFF";

    const GREEN = "#059669";   // PAID text
    const GREEN_LIGHT = "#D1FAE5";   // PAID bg

    const CURRENCY = "INR ";

    // ── Page setup ────────────────────────────────────────────────────────
    const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=INV-${invoice.invoiceNumber}.pdf`
    );
    doc.pipe(res);
    doc.on("error", (err) => console.error("PDF stream error:", err));

    const PW = 595.28;
    const PH = 841.89;
    const LM = 48;
    const RM = PW - 48;
    const CW = RM - LM;

    // ══════════════════════════════════════════════════════════════════════
    // 1. HEADER BAND
    // ══════════════════════════════════════════════════════════════════════
    const HDR_H = 115;

    doc.rect(0, 0, PW, HDR_H).fill(BRAND_DARK);

    // Diagonal slash accent (right side)
    doc.save()
      .moveTo(PW - 175, 0)
      .lineTo(PW, 0)
      .lineTo(PW, HDR_H)
      .lineTo(PW - 75, HDR_H)
      .fill(BRAND);
    doc.restore();

    // Inner highlight triangle
    doc.save()
      .moveTo(PW - 68, 0)
      .lineTo(PW, 0)
      .lineTo(PW, HDR_H * 0.6)
      .fill(BRAND_MID);
    doc.restore();

    // Logo circle
    const CX = LM + 28;
    const CY = HDR_H / 2;
    doc.circle(CX, CY, 31).lineWidth(1).stroke(BRAND_MID);
    doc.circle(CX, CY, 28).fill(BRAND);
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(14)
      .text("VA", CX - 13, CY - 9, { width: 26, align: "center" });

    // School name
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(21)
      .text("VIGYAN ACADEMY", LM + 70, 34);

    // Underline
    doc.moveTo(LM + 71, 59).lineTo(LM + 71 + 198, 59)
      .lineWidth(0.6).stroke(BRAND_MID);

    // Tagline
    doc.fillColor(BRAND_MID).font("Helvetica").fontSize(7.5)
      .text(
        "E  D  U  C  A  T  I  O  N     F  O  R     E  X  C  E  L  L  E  N  C  E",
        LM + 71, 65
      );

    // Contact info block
    const contacts = [
      ["+", "+91 98765 43210"],
      ["@", "info@vigyanacademy.com"],
      ["W", "www.vigyanacademy.com"],
      ["~", "Boring Road, Patna — 800001"],
    ];
    contacts.forEach(([, value], i) => {
      doc
        .fillColor(i === 0 ? WHITE : "#94A3B8")
        .font(i === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8)
        .text(value, PW - 240, 28 + i * 17, { width: 192 });
    });

    // Bottom accent stripe
    doc.rect(0, HDR_H, PW, 3).fill(BRAND);
    doc.rect(0, HDR_H - 2, 6, 5).fill(BRAND_MID);

    // ══════════════════════════════════════════════════════════════════════
    // 2. INVOICE META STRIP
    // ══════════════════════════════════════════════════════════════════════
    let y = HDR_H + 22;

    badge(doc, "INVOICE", LM, y - 2, 78, 22, BRAND, WHITE, 8.5);

    doc.fillColor(INK).font("Helvetica-Bold").fontSize(12)
      .text(`#${invoice.invoiceNumber}`, LM + 88, y + 1);

    const dateStr = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
    doc.fillColor(MUTED).font("Helvetica").fontSize(8.5)
      .text(`Date of Issue: ${dateStr}`, 0, y + 2, { width: RM, align: "right" });

    y += 32;
    rule(doc, LM, RM, y, BORDER, 0.5);

    // ══════════════════════════════════════════════════════════════════════
    // 3. INFO CARDS
    // ══════════════════════════════════════════════════════════════════════
    y += 18;

    const CARD_H = 128;
    const LC_W = CW * 0.54;
    const RC_W = CW * 0.41;
    const RC_X = RM - RC_W;

    // Left card
    roundRect(doc, LM, y, LC_W, CARD_H, 8);
    doc.fill(BRAND_SOFT);
    doc.rect(LM, y, 4, CARD_H).fill(BRAND);

    doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(7)
      .text("BILLED TO", LM + 16, y + 14);

    doc.fillColor(INK).font("Helvetica-Bold").fontSize(13)
      .text(
        (invoice.studentName || "Student").toUpperCase(),
        LM + 16, y + 27,
        { width: LC_W - 28 }
      );

    rule(doc, LM + 16, LM + LC_W - 14, y + 52, BORDER, 0.5);

    const details = [
      ["Admission No.", invoice.studentId?.admissionNumber || "N/A"],
      ["Class", invoice.className || "N/A"],
      ["Section", invoice.section || "N/A"],
    ];
    details.forEach(([label, val], i) => {
      const dy = y + 62 + i * 19;
      doc.fillColor(PALE).font("Helvetica").fontSize(7.5).text(label + ":", LM + 16, dy);
      doc.fillColor(INK).font("Helvetica-Bold").fontSize(7.5).text(val, LM + 105, dy);
    });

    // Right card
    roundRect(doc, RC_X, y, RC_W, CARD_H, 8);
    doc.fill(BRAND_DARK);
    doc.rect(RC_X, y, 4, CARD_H).fill(BRAND_MID);

    doc.fillColor(BRAND_MID).font("Helvetica-Bold").fontSize(7)
      .text("AMOUNT DUE", RC_X + 16, y + 14);

    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(27)
      .text(
        `${CURRENCY}${parseFloat(invoice.amount).toFixed(2)}`,
        RC_X + 16, y + 30,
        { width: RC_W - 24, align: "center" }
      );

    badge(doc, "PAID", RC_X + RC_W / 2 - 30, y + 79, 60, 19, GREEN_LIGHT, GREEN, 8);

    doc.fillColor("#94A3B8").font("Helvetica").fontSize(8)
      .text(`Month: ${invoice.month}`, RC_X + 16, y + 107, {
        width: RC_W - 24, align: "center",
      });

    y += CARD_H + 28;

    // ══════════════════════════════════════════════════════════════════════
    // 4. ITEMS TABLE
    // ══════════════════════════════════════════════════════════════════════
    const COL = {
      desc: { x: LM, w: 204 },
      month: { x: LM + 204, w: 88 },
      qty: { x: LM + 292, w: 58 },
      rate: { x: LM + 350, w: 90 },
      amount: { x: LM + 440, w: CW - 440 },
    };

    // Header
    const TH_H = 26;
    roundRect(doc, LM, y, CW, TH_H, 5);
    doc.fill(BRAND_DARK);

    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(7.5);
    doc.text("DESCRIPTION", COL.desc.x + 10, y + 9);
    doc.text("MONTH", COL.month.x + 10, y + 9);
    doc.text("QTY", COL.qty.x, y + 9, { width: COL.qty.w, align: "center" });
    doc.text("UNIT PRICE", COL.rate.x, y + 9, { width: COL.rate.w, align: "center" });
    doc.text("AMOUNT", COL.amount.x, y + 9, { width: COL.amount.w - 10, align: "right" });

    y += TH_H;

    // Item row
    const ITEM_H = 54;
    roundRect(doc, LM, y, CW, ITEM_H, 5);
    doc.fill(BRAND_SOFT);
    doc.rect(LM, y, 3, ITEM_H).fill(BRAND);

    doc.fillColor(INK).font("Helvetica-Bold").fontSize(9.5)
      .text("School Tuition Fee", COL.desc.x + 10, y + 12);
    doc.fillColor(MUTED).font("Helvetica").fontSize(7.5)
      .text(
        "Monthly academic fee — current session",
        COL.desc.x + 10, y + 29,
        { width: COL.desc.w - 16 }
      );

    doc.fillColor(INK).font("Helvetica").fontSize(9)
      .text(invoice.month, COL.month.x + 10, y + 24);

    doc.fillColor(INK).font("Helvetica").fontSize(9)
      .text("1", COL.qty.x, y + 24, { width: COL.qty.w, align: "center" });

    doc.fillColor(INK).font("Helvetica").fontSize(9)
      .text(
        `${CURRENCY}${parseFloat(invoice.amount).toFixed(2)}`,
        COL.rate.x, y + 24,
        { width: COL.rate.w, align: "center" }
      );

    doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(10)
      .text(
        `${CURRENCY}${parseFloat(invoice.amount).toFixed(2)}`,
        COL.amount.x, y + 24,
        { width: COL.amount.w - 10, align: "right" }
      );

    y += ITEM_H + 2;
    doc.rect(LM, y, CW, 2).fill(BRAND);
    y += 2;

    // Summary rows
    const SUM_X = LM + CW * 0.52;
    const SUM_W = CW * 0.48;

    const summaryRows = [
      { label: "Sub-Total", value: parseFloat(invoice.amount).toFixed(2) },
      { label: "Tax / VAT (0%)", value: "0.00" },
      { label: "Discount", value: "0.00" },
    ];

    y += 4;
    summaryRows.forEach(({ label, value }) => {
      doc.rect(SUM_X, y, SUM_W, 22).fill(SURFACE);
      rule(doc, SUM_X, RM, y + 22, BORDER, 0.4);
      doc.fillColor(MUTED).font("Helvetica").fontSize(8.5)
        .text(label, SUM_X + 12, y + 7);
      doc.fillColor(INK).font("Helvetica").fontSize(8.5)
        .text(
          `${CURRENCY}${value}`,
          SUM_X, y + 7,
          { width: SUM_W - 12, align: "right" }
        );
      y += 22;
    });

    // Grand total
    roundRect(doc, SUM_X, y, SUM_W, 32, 6);
    doc.fill(BRAND_DARK);
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9)
      .text("GRAND TOTAL", SUM_X + 12, y + 11);
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(12)
      .text(
        `${CURRENCY}${parseFloat(invoice.amount).toFixed(2)}`,
        SUM_X, y + 10,
        { width: SUM_W - 12, align: "right" }
      );

    y += 46;

    // ══════════════════════════════════════════════════════════════════════
    // 5. NOTES PANEL
    // ══════════════════════════════════════════════════════════════════════
    roundRect(doc, LM, y, CW, 105, 8);
    doc.fill(SURFACE);
    doc.rect(LM, y, CW, 105).lineWidth(0.5).stroke(BORDER);

    // Left — Payment
    doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(8)
      .text("PAYMENT DETAILS", LM + 18, y + 16);

    ["Cash · Bank Transfer", "UPI / NEFT / IMPS", "payments@vigyanacademy.com"].forEach(
      (line, i) => {
        doc.fillColor(INK).font("Helvetica").fontSize(8)
          .text(`•  ${line}`, LM + 18, y + 32 + i * 16, { width: CW / 2 - 30 });
      }
    );

    // Vertical divider
    doc.moveTo(LM + CW / 2, y + 12).lineTo(LM + CW / 2, y + 92)
      .lineWidth(0.5).stroke(BORDER);

    // Right — Terms
    const TX = LM + CW / 2 + 18;
    doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(8)
      .text("TERMS & CONDITIONS", TX, y + 16);

    [
      "Fee once paid is non-refundable.",
      "Late fee: Rs.50/day after due date.",
      "System-generated; valid without signature.",
    ].forEach((term, i) => {
      doc.fillColor(INK).font("Helvetica").fontSize(8)
        .text(`${i + 1}.  ${term}`, TX, y + 32 + i * 16, { width: CW / 2 - 30 });
    });

    y += 120;

    // ══════════════════════════════════════════════════════════════════════
    // 6. SIGNATURE + THANK-YOU
    // ══════════════════════════════════════════════════════════════════════
    // Thank-you message
    doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(9)
      .text("Thank you for your timely payment!", LM, y + 12);
    doc.fillColor(MUTED).font("Helvetica").fontSize(8)
      .text("Queries: finance@vigyanacademy.com", LM, y + 26);

    // Signature
    const SIG_W = 170;
    const SIG_X = RM - SIG_W;

    doc.fillColor(BRAND_DARK).font("Times-Italic").fontSize(18)
      .text("Authorized Admin", SIG_X, y + 5, { width: SIG_W, align: "center" });

    rule(doc, SIG_X + 10, RM - 10, y + 32, MUTED, 0.8);

    doc.fillColor(INK).font("Helvetica-Bold").fontSize(8)
      .text("Finance Department", SIG_X, y + 37, { width: SIG_W, align: "center" });
    doc.fillColor(PALE).font("Helvetica").fontSize(7.5)
      .text("Vigyan Academy", SIG_X, y + 49, { width: SIG_W, align: "center" });

    // ══════════════════════════════════════════════════════════════════════
    // 7. FOOTER
    // ══════════════════════════════════════════════════════════════════════
    doc.rect(0, PH - 42, PW, 3).fill(BRAND);
    doc.rect(0, PH - 39, PW, 39).fill(BRAND_DARK);

    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8)
      .text("VIGYAN ACADEMY", 0, PH - 30, { width: PW, align: "center" });

    doc.fillColor("#94A3B8").font("Helvetica").fontSize(7.5)
      .text(
        "Boring Road, Patna 800001  ·  +91 98765 43210  ·  info@vigyanacademy.com  ·  www.vigyanacademy.com",
        0, PH - 19,
        { width: PW, align: "center" }
      );

    badge(doc, "EDU", PW - 58, PH - 34, 36, 16, BRAND, WHITE, 7);

    // ══════════════════════════════════════════════════════════════════════
    // 8. WATERMARK
    // ══════════════════════════════════════════════════════════════════════
    doc.save();
    doc.opacity(0.033);
    doc.fillColor(BRAND_DARK)
      .font("Helvetica-Bold")
      .fontSize(88)
      .rotate(-38, { origin: [PW / 2, PH / 2] })
      .text("VIGYAN ACADEMY", PW / 2 - 260, PH / 2 - 44);
    doc.restore();

    doc.end();

  } catch (error) {
    console.error("Download Invoice Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Invoice generation failed.",
        error: error.message,
      });
    }
  }
};