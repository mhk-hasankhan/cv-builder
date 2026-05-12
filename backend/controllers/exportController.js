const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { getDb } = require('../database/db');
const { renderPdfSections, renderDocxSections, stripHtml } = require('../sectionRenderers');

function getCV(id, userId) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM cvs WHERE id = ? AND user_id = ?').get(id, userId);
  if (!row) return null;
  return {
    ...row,
    data: JSON.parse(row.data),
    section_order: JSON.parse(row.section_order),
    enabled_sections: JSON.parse(row.enabled_sections),
  };
}

function getCL(id, userId) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM cover_letters WHERE id = ? AND user_id = ?').get(id, userId);
  if (!row) return null;
  return { ...row, data: JSON.parse(row.data) };
}

// ─── PDF EXPORT ────────────────────────────────────────────────────────────────
exports.exportPdf = (req, res) => {
  const cv = getCV(req.params.id, req.user.id);
  if (!cv) return res.status(404).json({ error: 'CV not found' });

  const { data, title, color_theme, enabled_sections, section_order } = cv;
  const primary = color_theme || '#2563eb';

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
  doc.pipe(res);

  // Header
  if (data.personal?.name) {
    doc.fontSize(26).fillColor(primary).font('Helvetica-Bold')
      .text(data.personal.name, { align: 'center' });
    doc.moveDown(0.3);
  }
  const contacts = [
    data.personal?.email, data.personal?.phone,
    data.personal?.address, data.personal?.website,
  ].filter(Boolean);
  if (contacts.length) {
    doc.fontSize(9).fillColor('#555').font('Helvetica').text(contacts.join('  |  '), { align: 'center' });
  }
  const links = [data.personal?.linkedin, data.personal?.github].filter(Boolean);
  if (links.length) {
    doc.fontSize(9).fillColor('#555').text(links.join('  |  '), { align: 'center' });
  }
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y)
    .strokeColor(primary).lineWidth(2).stroke();
  doc.moveDown(0.5);

  const enabledSections = enabled_sections?.length ? enabled_sections : section_order || [];
  renderPdfSections(doc, data, enabledSections, primary);

  doc.end();
};

// ─── DOCX EXPORT ──────────────────────────────────────────────────────────────
exports.exportDocx = async (req, res) => {
  const cv = getCV(req.params.id, req.user.id);
  if (!cv) return res.status(404).json({ error: 'CV not found' });

  const { data, title, color_theme, enabled_sections } = cv;
  const primaryHex = (color_theme || '#2563eb').replace('#', '');

  const children = [];

  // Personal header
  if (data.personal?.name) {
    children.push(new Paragraph({
      children: [new TextRun({ text: data.personal.name, bold: true, size: 48, color: primaryHex })],
      spacing: { after: 100 },
    }));
    const contacts = [
      data.personal.email, data.personal.phone, data.personal.address,
      data.personal.website, data.personal.linkedin, data.personal.github,
    ].filter(Boolean);
    if (contacts.length) {
      children.push(new Paragraph({
        children: [new TextRun({ text: contacts.join('  |  '), size: 18, color: '555555' })],
        spacing: { after: 200 },
      }));
    }
  }

  renderDocxSections(children, data, enabled_sections || []);

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.docx"`);
  res.send(buffer);
};

// ─── COVER LETTER PDF ─────────────────────────────────────────────────────────
exports.exportCoverLetterPdf = (req, res) => {
  const cl = getCL(req.params.id, req.user.id);
  if (!cl) return res.status(404).json({ error: 'Cover letter not found' });

  const { data, title } = cl;
  const doc = new PDFDocument({ margin: 72, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
  doc.pipe(res);

  doc.fontSize(10).font('Helvetica').fillColor('#333');
  if (data.senderName)    doc.text(data.senderName, { align: 'right' });
  if (data.senderEmail)   doc.text(data.senderEmail, { align: 'right' });
  if (data.senderPhone)   doc.text(data.senderPhone, { align: 'right' });
  doc.moveDown();
  if (data.date)          doc.text(data.date);
  doc.moveDown();
  if (data.recipientName) doc.font('Helvetica-Bold').text(data.recipientName).font('Helvetica');
  if (data.recipientTitle) doc.text(data.recipientTitle);
  if (data.companyName)   doc.text(data.companyName);
  if (data.companyAddress) doc.text(data.companyAddress);
  doc.moveDown();
  if (data.subject)       doc.font('Helvetica-Bold').text(`Re: ${data.subject}`).font('Helvetica');
  doc.moveDown();
  if (data.salutation)    doc.text(data.salutation);
  doc.moveDown(0.5);
  if (data.body)          doc.text(stripHtml(data.body), { lineGap: 4 });
  doc.moveDown();
  if (data.closing)       doc.text(data.closing);
  doc.moveDown(2);
  if (data.senderName)    doc.text(data.senderName);
  doc.end();
};

// ─── COVER LETTER DOCX ────────────────────────────────────────────────────────
exports.exportCoverLetterDocx = async (req, res) => {
  const cl = getCL(req.params.id, req.user.id);
  if (!cl) return res.status(404).json({ error: 'Cover letter not found' });

  const { data, title } = cl;
  const p = (text, opts = {}) => new Paragraph({
    children: [new TextRun({ text: text || '', ...opts })],
    spacing: { after: 160 },
  });

  const doc = new Document({
    sections: [{
      children: [
        p(data.senderName || '',    { bold: true }),
        p(data.senderEmail || ''),
        p(data.senderPhone || ''),
        p(''),
        p(data.date || ''),
        p(''),
        p(data.recipientName || '',  { bold: true }),
        p(data.recipientTitle || ''),
        p(data.companyName || ''),
        p(data.companyAddress || ''),
        p(''),
        p(data.subject ? `Re: ${data.subject}` : '', { bold: true }),
        p(''),
        p(data.salutation || ''),
        p(''),
        p(stripHtml(data.body || '')),
        p(''),
        p(data.closing || ''),
        p(''),
        p(''),
        p(data.senderName || '',    { bold: true }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.docx"`);
  res.send(buffer);
};
