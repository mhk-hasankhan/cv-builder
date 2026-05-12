const {
  Paragraph, TextRun, HeadingLevel,
} = require('docx');

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

// ─── PDF helpers ───────────────────────────────────────────────────────────────

function pdfHeader(doc, title, primary) {
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor(primary).font('Helvetica-Bold').text(title.toUpperCase());
  doc.moveTo(50, doc.y + 2).lineTo(doc.page.width - 50, doc.y + 2)
    .strokeColor(primary).lineWidth(0.5).stroke();
  doc.moveDown(0.4);
}

const pdfRenderers = {
  experience(doc, data, primary) {
    if (!data.experience?.length) return;
    pdfHeader(doc, 'Work Experience', primary);
    data.experience.forEach(exp => {
      doc.fontSize(11).fillColor('#1a1a1a').font('Helvetica-Bold')
        .text(exp.jobTitle || '', { continued: true });
      const dates = [exp.startDate, exp.endDate || 'Present'].filter(Boolean).join(' – ');
      doc.font('Helvetica').fillColor('#555').text(`  ${dates}`, { align: 'right' });
      doc.fontSize(10).fillColor('#444').font('Helvetica-Oblique')
        .text(`${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`);
      if (exp.description) {
        doc.fontSize(9.5).fillColor('#333').font('Helvetica')
          .text(stripHtml(exp.description), { indent: 10 });
      }
      doc.moveDown(0.4);
    });
  },

  education(doc, data, primary) {
    if (!data.education?.length) return;
    pdfHeader(doc, 'Education', primary);
    data.education.forEach(edu => {
      doc.fontSize(11).fillColor('#1a1a1a').font('Helvetica-Bold')
        .text(`${edu.degree || ''} ${edu.fieldOfStudy ? 'in ' + edu.fieldOfStudy : ''}`, { continued: true });
      const dates = [edu.startDate, edu.endDate || 'Present'].filter(Boolean).join(' – ');
      doc.font('Helvetica').fillColor('#555').text(`  ${dates}`, { align: 'right' });
      doc.fontSize(10).fillColor('#444').font('Helvetica-Oblique').text(edu.institution || '');
      if (edu.description) {
        doc.fontSize(9.5).fillColor('#333').font('Helvetica')
          .text(stripHtml(edu.description), { indent: 10 });
      }
      doc.moveDown(0.4);
    });
  },

  skills(doc, data, primary) {
    if (!data.skills?.length) return;
    pdfHeader(doc, 'Skills', primary);
    data.skills.forEach(cat => {
      doc.fontSize(10).fillColor('#1a1a1a').font('Helvetica-Bold')
        .text(`${cat.category}: `, { continued: true });
      doc.font('Helvetica').fillColor('#333').text((cat.items || []).join(', '));
    });
    doc.moveDown(0.3);
  },

  projects(doc, data, primary) {
    if (!data.projects?.length) return;
    pdfHeader(doc, 'Projects', primary);
    data.projects.forEach(proj => {
      doc.fontSize(11).fillColor('#1a1a1a').font('Helvetica-Bold').text(proj.name || '');
      if (proj.description) {
        doc.fontSize(9.5).fillColor('#333').font('Helvetica')
          .text(stripHtml(proj.description), { indent: 10 });
      }
      if (proj.technologies?.length) {
        doc.fontSize(9).fillColor('#555')
          .text(`Technologies: ${proj.technologies.join(', ')}`, { indent: 10 });
      }
      const projLinks = [proj.github, proj.liveUrl].filter(Boolean);
      if (projLinks.length) {
        doc.fontSize(9).fillColor(primary).text(projLinks.join('  |  '), { indent: 10 });
      }
      doc.moveDown(0.3);
    });
  },

  certifications(doc, data, primary) {
    if (!data.certifications?.length) return;
    pdfHeader(doc, 'Certifications & Achievements', primary);
    data.certifications.forEach(cert => {
      doc.fontSize(10).fillColor('#1a1a1a').font('Helvetica-Bold')
        .text(cert.name || '', { continued: !!cert.issuer });
      if (cert.issuer) doc.font('Helvetica').fillColor('#555').text(` – ${cert.issuer}`);
      if (cert.date) doc.fontSize(9).fillColor('#777').text(cert.date, { indent: 10 });
    });
    doc.moveDown(0.3);
  },

  languages(doc, data, primary) {
    if (!data.languages?.length) return;
    pdfHeader(doc, 'Languages', primary);
    const text = data.languages.map(l => `${l.language} (${l.proficiency})`).join('  •  ');
    doc.fontSize(10).fillColor('#333').font('Helvetica').text(text);
    doc.moveDown(0.3);
  },
};

// ─── DOCX helpers ──────────────────────────────────────────────────────────────

function docxHeading(text) {
  return new Paragraph({
    text: text.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    thematicBreak: true,
    spacing: { before: 300, after: 100 },
  });
}

const docxRenderers = {
  experience(out, data) {
    if (!data.experience?.length) return;
    out.push(docxHeading('Work Experience'));
    data.experience.forEach(exp => {
      out.push(new Paragraph({
        children: [
          new TextRun({ text: exp.jobTitle || '', bold: true }),
          new TextRun({ text: `  —  ${exp.company || ''}${exp.location ? ', ' + exp.location : ''}`, italics: true }),
          new TextRun({ text: `  (${[exp.startDate, exp.endDate || 'Present'].join(' – ')})`, color: '777777' }),
        ],
        spacing: { before: 120, after: 60 },
      }));
      if (exp.description) {
        out.push(new Paragraph({ text: stripHtml(exp.description), spacing: { after: 60 } }));
      }
    });
  },

  education(out, data) {
    if (!data.education?.length) return;
    out.push(docxHeading('Education'));
    data.education.forEach(edu => {
      out.push(new Paragraph({
        children: [
          new TextRun({ text: `${edu.degree || ''} ${edu.fieldOfStudy ? 'in ' + edu.fieldOfStudy : ''}`, bold: true }),
          new TextRun({ text: `  —  ${edu.institution || ''}`, italics: true }),
          new TextRun({ text: `  (${[edu.startDate, edu.endDate || 'Present'].join(' – ')})`, color: '777777' }),
        ],
        spacing: { before: 120, after: 60 },
      }));
    });
  },

  skills(out, data) {
    if (!data.skills?.length) return;
    out.push(docxHeading('Skills'));
    data.skills.forEach(cat => {
      out.push(new Paragraph({
        children: [
          new TextRun({ text: `${cat.category}: `, bold: true }),
          new TextRun({ text: (cat.items || []).join(', ') }),
        ],
        spacing: { after: 60 },
      }));
    });
  },

  projects(out, data) {
    if (!data.projects?.length) return;
    out.push(docxHeading('Projects'));
    data.projects.forEach(proj => {
      out.push(new Paragraph({
        children: [new TextRun({ text: proj.name || '', bold: true })],
        spacing: { before: 120, after: 60 },
      }));
      if (proj.description) {
        out.push(new Paragraph({ text: stripHtml(proj.description) }));
      }
      if (proj.technologies?.length) {
        out.push(new Paragraph({
          children: [
            new TextRun({ text: 'Tech: ', bold: true }),
            new TextRun({ text: proj.technologies.join(', ') }),
          ],
        }));
      }
    });
  },

  certifications(out, data) {
    if (!data.certifications?.length) return;
    out.push(docxHeading('Certifications & Achievements'));
    data.certifications.forEach(cert => {
      out.push(new Paragraph({
        children: [
          new TextRun({ text: cert.name || '', bold: true }),
          new TextRun({ text: cert.issuer ? ` — ${cert.issuer}` : '' }),
        ],
        spacing: { after: 60 },
      }));
    });
  },

  languages(out, data) {
    if (!data.languages?.length) return;
    out.push(docxHeading('Languages'));
    out.push(new Paragraph({
      text: data.languages.map(l => `${l.language} (${l.proficiency})`).join('  •  '),
    }));
  },
};

// ─── Public API ────────────────────────────────────────────────────────────────

function renderPdfSections(doc, data, enabledSections, primary) {
  enabledSections.forEach(section => {
    pdfRenderers[section]?.(doc, data, primary);
  });
}

function renderDocxSections(out, data, enabledSections) {
  enabledSections.forEach(section => {
    docxRenderers[section]?.(out, data);
  });
}

module.exports = { renderPdfSections, renderDocxSections, stripHtml };
