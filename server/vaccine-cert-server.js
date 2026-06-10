#!/usr/bin/env node
const http = require('http');
const url = require('url');
const PDFDocument = require('pdfkit');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 4000;

function generateCertificatePDF(res, id) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="vaccination-${id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(20).text('Vaccination Certificate', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Certificate ID: ${id}`);
  doc.text(`Issued at: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.text('This certifies that the vaccine was administered according to clinic protocols.');
  doc.moveDown();
  doc.text('Details:', { underline: true });
  doc.moveDown();
  doc.text(' - Vaccine: [REDACTED]');
  doc.text(' - Lot: [REDACTED]');
  doc.text(' - Administrator: [REDACTED]');

  doc.end();
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '', true);
  const match = parsed.pathname && parsed.pathname.match(/^\/vaccination-certificates\/(.+)\.pdf$/);
  if (match) {
    const id = match[1];
    try {
      generateCertificatePDF(res, id);
    } catch (err) {
      res.statusCode = 500;
      res.end('Failed to generate PDF');
    }
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Vaccination certificate server running at http://${HOST}:${PORT}/`);
});
