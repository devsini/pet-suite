import React from 'react';

export default function QueueDisplay({ number }: { number: string }) {
  return (
    <div className="p-6 border rounded text-center">
      <div className="text-sm text-gray-500">Queue Number</div>
      <div className="text-6xl font-bold mt-2">{number}</div>
    </div>
  );
}
