import PDFDocument from 'pdfkit';

export async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = await request.json();
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks: Uint8Array[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  doc.fontSize(20).text('PetCare Suite Receipt', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Created at: ${new Date().toISOString()}`);
  doc.moveDown();
  doc.text(JSON.stringify(payload, null, 2));
  doc.end();

  const buffer = new Uint8Array(await new Promise<Buffer>((resolve, reject) => {
    const body: Buffer[] = [];
    doc.on('data', (chunk) => body.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(body)));
    doc.on('error', reject);
  }));

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=receipt.pdf'
    }
  });
}
