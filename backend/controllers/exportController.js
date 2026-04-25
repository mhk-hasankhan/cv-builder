const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, UnderlineType } = require('docx');
const { getDb } = require('../database/db');

function getCV(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM cvs WHERE id = ?').get(id);
  if (!row) return null;
  return { ...row, data: JSON.parse(row.data), section_order: JSON.parse(row.section_order), enabled_sections: JSON.parse(row.enabled_sections) };
}

function getCL(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM cover_letters WHERE id = ?').get(id);
  if (!row) return null;
  return { ...row, data: JSON.parse(row.data) };
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

// ─── PDF EXPORT ────────────────────────────────────────────────────────────────
exports.exportPdf = (req, res) => {
  const cv = getCV(req.params.id);
  if (!cv) return res.status(404).json({ error: 'CV not found' });

  const { data, title, color_theme } = cv;
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
  doc.pipe(res);

  const primary = color_theme || '#2563eb';
  const pageWidth = doc.page.width - 100;

  // Header
  if (data.personal?.name) {
    doc.fontSize(26).fillColor(primary).font('Helvetica-Bold').text(data.personal.name, { align: 'center' });
    doc.moveDown(0.3);
  }

  // Contact info
  const contacts = [data.personal?.email, data.personal?.phone, data.personal?.address, data.personal?.website].filter(Boolean);
  if (contacts.length) {
    doc.fontSize(9).fillColor('#555').font('Helvetica').text(contacts.join('  |  '), { align: 'center' });
  }
  const links = [data.personal?.linkedin, data.personal?.github].filter(Boolean);
  if (links.length) {
    doc.fontSize(9).fillColor('#555').text(links.join('  |  '), { align: 'center' });
  }
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(primary).lineWidth(2).stroke();
  doc.moveDown(0.5);

  const sectionHeader = (title) => {
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor(primary).font('Helvetica-Bold').text(title.toUpperCase());
    doc.moveTo(50, doc.y + 2).lineTo(doc.page.width - 50, doc.y + 2).strokeColor(primary).lineWidth(0.5).stroke();
    doc.moveDown(0.4);
  };

  const enabledSections = cv.enabled_sections || cv.section_order || [];

  enabledSections.forEach(section => {
    switch (section) {
      case 'experience':
        if (data.experience?.length) {
          sectionHeader('Work Experience');
          data.experience.forEach(exp => {
            doc.fontSize(11).fillColor('#1a1a1a').font('Helvetica-Bold').text(exp.jobTitle || '', { continued: true });
            const dates = [exp.startDate, exp.endDate || 'Present'].filter(Boolean).join(' – ');
            doc.font('Helvetica').fillColor('#555').text(`  ${dates}`, { align: 'right' });
            doc.fontSize(10).fillColor('#444').font('Helvetica-Oblique').text(`${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`);
            if (exp.description) {
              doc.fontSize(9.5).fillColor('#333').font('Helvetica').text(stripHtml(exp.description), { indent: 10 });
            }
            doc.moveDown(0.4);
          });
        }
        break;
      case 'education':
        if (data.education?.length) {
          sectionHeader('Education');
          data.education.forEach(edu => {
            doc.fontSize(11).fillColor('#1a1a1a').font('Helvetica-Bold').text(`${edu.degree || ''} ${edu.fieldOfStudy ? 'in ' + edu.fieldOfStudy : ''}`, { continued: true });
            const dates = [edu.startDate, edu.endDate || 'Present'].filter(Boolean).join(' – ');
            doc.font('Helvetica').fillColor('#555').text(`  ${dates}`, { align: 'right' });
            doc.fontSize(10).fillColor('#444').font('Helvetica-Oblique').text(edu.institution || '');
            if (edu.description) doc.fontSize(9.5).fillColor('#333').font('Helvetica').text(stripHtml(edu.description), { indent: 10 });
            doc.moveDown(0.4);
          });
        }
        break;
      case 'skills':
        if (data.skills?.length) {
          sectionHeader('Skills');
          data.skills.forEach(cat => {
            doc.fontSize(10).fillColor('#1a1a1a').font('Helvetica-Bold').text(`${cat.category}: `, { continued: true });
            doc.font('Helvetica').fillColor('#333').text((cat.items || []).join(', '));
          });
          doc.moveDown(0.3);
        }
        break;
      case 'projects':
        if (data.projects?.length) {
          sectionHeader('Projects');
          data.projects.forEach(proj => {
            doc.fontSize(11).fillColor('#1a1a1a').font('Helvetica-Bold').text(proj.name || '');
            if (proj.description) doc.fontSize(9.5).fillColor('#333').font('Helvetica').text(stripHtml(proj.description), { indent: 10 });
            if (proj.technologies?.length) {
              doc.fontSize(9).fillColor('#555').text(`Technologies: ${proj.technologies.join(', ')}`, { indent: 10 });
            }
            const projLinks = [proj.github, proj.liveUrl].filter(Boolean);
            if (projLinks.length) doc.fontSize(9).fillColor(primary).text(projLinks.join('  |  '), { indent: 10 });
            doc.moveDown(0.3);
          });
        }
        break;
      case 'certifications':
        if (data.certifications?.length) {
          sectionHeader('Certifications & Achievements');
          data.certifications.forEach(cert => {
            doc.fontSize(10).fillColor('#1a1a1a').font('Helvetica-Bold').text(cert.name || '', { continued: !!cert.issuer });
            if (cert.issuer) doc.font('Helvetica').fillColor('#555').text(` – ${cert.issuer}`);
            if (cert.date) doc.fontSize(9).fillColor('#777').text(cert.date, { indent: 10 });
          });
          doc.moveDown(0.3);
        }
        break;
      case 'languages':
        if (data.languages?.length) {
          sectionHeader('Languages');
          const langText = data.languages.map(l => `${l.language} (${l.proficiency})`).join('  •  ');
          doc.fontSize(10).fillColor('#333').font('Helvetica').text(langText);
          doc.moveDown(0.3);
        }
        break;
    }
  });

  doc.end();
};

// ─── DOCX EXPORT ──────────────────────────────────────────────────────────────
exports.exportDocx = async (req, res) => {
  const cv = getCV(req.params.id);
  if (!cv) return res.status(404).json({ error: 'CV not found' });

  const { data, title, color_theme, enabled_sections } = cv;
  const primaryHex = (color_theme || '#2563eb').replace('#', '');

  const sections = [];

  const addSectionHeading = (text) => new Paragraph({
    text: text.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    thematicBreak: true,
    spacing: { before: 300, after: 100 },
  });

  // Personal info
  if (data.personal?.name) {
    sections.push(new Paragraph({
      children: [new TextRun({ text: data.personal.name, bold: true, size: 48, color: primaryHex })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    }));
    const contacts = [data.personal.email, data.personal.phone, data.personal.address, data.personal.website, data.personal.linkedin, data.personal.github].filter(Boolean);
    if (contacts.length) {
      sections.push(new Paragraph({
        children: [new TextRun({ text: contacts.join('  |  '), size: 18, color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }));
    }
  }

  (enabled_sections || []).forEach(section => {
    switch (section) {
      case 'experience':
        if (data.experience?.length) {
          sections.push(addSectionHeading('Work Experience'));
          data.experience.forEach(exp => {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: exp.jobTitle || '', bold: true }),
                new TextRun({ text: `  —  ${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`, italics: true }),
                new TextRun({ text: `  (${[exp.startDate, exp.endDate || 'Present'].join(' – ')})`, color: '777777' })
              ],
              spacing: { before: 120, after: 60 }
            }));
            if (exp.description) {
              sections.push(new Paragraph({ text: stripHtml(exp.description), spacing: { after: 60 } }));
            }
          });
        }
        break;
      case 'education':
        if (data.education?.length) {
          sections.push(addSectionHeading('Education'));
          data.education.forEach(edu => {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: `${edu.degree || ''} ${edu.fieldOfStudy ? 'in ' + edu.fieldOfStudy : ''}`, bold: true }),
                new TextRun({ text: `  —  ${edu.institution || ''}`, italics: true }),
                new TextRun({ text: `  (${[edu.startDate, edu.endDate || 'Present'].join(' – ')})`, color: '777777' })
              ],
              spacing: { before: 120, after: 60 }
            }));
          });
        }
        break;
      case 'skills':
        if (data.skills?.length) {
          sections.push(addSectionHeading('Skills'));
          data.skills.forEach(cat => {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: `${cat.category}: `, bold: true }),
                new TextRun({ text: (cat.items || []).join(', ') })
              ],
              spacing: { after: 60 }
            }));
          });
        }
        break;
      case 'projects':
        if (data.projects?.length) {
          sections.push(addSectionHeading('Projects'));
          data.projects.forEach(proj => {
            sections.push(new Paragraph({ children: [new TextRun({ text: proj.name || '', bold: true })], spacing: { before: 120, after: 60 } }));
            if (proj.description) sections.push(new Paragraph({ text: stripHtml(proj.description) }));
            if (proj.technologies?.length) sections.push(new Paragraph({ children: [new TextRun({ text: 'Tech: ', bold: true }), new TextRun({ text: proj.technologies.join(', ') })] }));
          });
        }
        break;
      case 'certifications':
        if (data.certifications?.length) {
          sections.push(addSectionHeading('Certifications & Achievements'));
          data.certifications.forEach(cert => {
            sections.push(new Paragraph({ children: [new TextRun({ text: cert.name || '', bold: true }), new TextRun({ text: cert.issuer ? ` — ${cert.issuer}` : '' })], spacing: { after: 60 } }));
          });
        }
        break;
      case 'languages':
        if (data.languages?.length) {
          sections.push(addSectionHeading('Languages'));
          sections.push(new Paragraph({ text: data.languages.map(l => `${l.language} (${l.proficiency})`).join('  •  ') }));
        }
        break;
    }
  });

  const doc = new Document({ sections: [{ properties: {}, children: sections }] });
  const buffer = await Packer.toBuffer(doc);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.docx"`);
  res.send(buffer);
};

// ─── COVER LETTER PDF ─────────────────────────────────────────────────────────
exports.exportCoverLetterPdf = (req, res) => {
  const cl = getCL(req.params.id);
  if (!cl) return res.status(404).json({ error: 'Cover letter not found' });

  const { data, title } = cl;
  const doc = new PDFDocument({ margin: 72, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
  doc.pipe(res);

  doc.fontSize(10).font('Helvetica').fillColor('#333');
  if (data.senderName) doc.text(data.senderName, { align: 'right' });
  if (data.senderEmail) doc.text(data.senderEmail, { align: 'right' });
  if (data.senderPhone) doc.text(data.senderPhone, { align: 'right' });
  doc.moveDown();
  if (data.date) doc.text(data.date);
  doc.moveDown();
  if (data.recipientName) doc.font('Helvetica-Bold').text(data.recipientName).font('Helvetica');
  if (data.recipientTitle) doc.text(data.recipientTitle);
  if (data.companyName) doc.text(data.companyName);
  if (data.companyAddress) doc.text(data.companyAddress);
  doc.moveDown();
  if (data.subject) doc.font('Helvetica-Bold').text(`Re: ${data.subject}`).font('Helvetica');
  doc.moveDown();
  if (data.salutation) doc.text(data.salutation);
  doc.moveDown(0.5);
  if (data.body) doc.text(stripHtml(data.body), { lineGap: 4 });
  doc.moveDown();
  if (data.closing) doc.text(data.closing);
  doc.moveDown(2);
  if (data.senderName) doc.text(data.senderName);
  doc.end();
};

// ─── COVER LETTER DOCX ────────────────────────────────────────────────────────
exports.exportCoverLetterDocx = async (req, res) => {
  const cl = getCL(req.params.id);
  if (!cl) return res.status(404).json({ error: 'Cover letter not found' });

  const { data, title } = cl;
  const p = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text: text || '', ...opts })], spacing: { after: 160 } });

  const doc = new Document({
    sections: [{
      children: [
        p(data.senderName || '', { bold: true }),
        p(data.senderEmail || ''),
        p(data.senderPhone || ''),
        p(''),
        p(data.date || ''),
        p(''),
        p(data.recipientName || '', { bold: true }),
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
        p(data.senderName || '', { bold: true }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.docx"`);
  res.send(buffer);
};
