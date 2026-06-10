import React from 'react';

export default function PetQRCard({ petId }: { petId: string }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?data=pet:${petId}&size=200x200`;
  return (
    <div className="p-3 border rounded inline-block text-center">
      <img src={url} alt="QR" className="w-36 h-36 mx-auto" />
      <div className="text-sm mt-2">Scan to view pet</div>
      <div className="mt-2">
        <a href={url} download={`pet-${petId}-qrcode.png`} className="px-3 py-1 border rounded">Download</a>
      </div>
    </div>
  );
}
