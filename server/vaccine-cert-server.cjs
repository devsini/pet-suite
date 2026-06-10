#!/usr/bin/env node
const http = require('http');
const { URL } = require('url');
const PDFDocument = require('pdfkit');
let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseServiceRoleKey) {
    supabase = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
  }
} catch (e) {
  // supabase not available or not configured in dev; fallback to placeholders
}

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 4000;

async function generateCertificatePDF(res, id) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="vaccination-${id}.pdf"`);
  doc.pipe(res);

  // default placeholders
  let vaccineName = '[Unknown vaccine]';
  let dateAdministered = '[Unknown date]';
  let petName = '[Unknown pet]';
  let ownerName = '[Unknown owner]';
  let vet = '[Unknown veterinarian]';

  if (supabase) {
    try {
      const { data: vac, error: vacErr } = await supabase.from('vaccinations').select('id, pet_id, vaccine_name, date_administered, veterinarian_id').eq('id', id).single();
      if (!vacErr && vac) {
        vaccineName = vac.vaccine_name || vaccineName;
        dateAdministered = vac.date_administered || dateAdministered;
        vet = vac.veterinarian_id || vet;
        if (vac.pet_id) {
          const { data: pet, error: petErr } = await supabase.from('pets').select('id, name, owner_id').eq('id', vac.pet_id).single();
          if (!petErr && pet) {
            petName = pet.name || petName;
            if (pet.owner_id) {
              const { data: owner, error: ownerErr } = await supabase.from('customers').select('id, full_name').eq('id', pet.owner_id).single();
              if (!ownerErr && owner) ownerName = owner.full_name || ownerName;
            }
          }
        }
      }
    } catch (e) {
      // ignore and use placeholders
    }
  }

  doc.fontSize(20).text('Vaccination Certificate', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Certificate ID: ${id}`);
  doc.text(`Issued at: ${new Date().toLocaleString()}`);
  doc.moveDown();

  doc.fontSize(14).text('Patient', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Pet: ${petName}`);
  doc.text(`Owner: ${ownerName}`);
  doc.moveDown();

  doc.fontSize(14).text('Vaccination', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Vaccine: ${vaccineName}`);
  doc.text(`Administered: ${dateAdministered}`);
  doc.text(`Veterinarian: ${vet}`);
  doc.moveDown();

  doc.fontSize(12).text('This certifies that the vaccine was administered according to clinic protocols.');

  doc.end();
}

const server = http.createServer(async (req, res) => {
  try {
    const base = `http://${HOST}:${PORT}`;
    const parsed = new URL(req.url || '/', base);
    const match = parsed.pathname && parsed.pathname.match(/^\/vaccination-certificates\/(.+)\.pdf$/);
    if (match) {
      const id = match[1];
      try {
        await generateCertificatePDF(res, id);
      } catch (err) {
        res.statusCode = 500;
        res.end('Failed to generate PDF');
      }
      return;
    }

    res.statusCode = 404;
    res.end('Not found');
  } catch (e) {
    res.statusCode = 400;
    res.end('Bad request');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Vaccination certificate server running at http://${HOST}:${PORT}/`);
});
