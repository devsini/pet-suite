import React, { useState } from 'react';
import { DollarSign, PlusCircle, MinusCircle } from 'lucide-react';
import customersService from '../customers.service';

interface Props { customerId: string; points: number }

export default function LoyaltyPointsCard({ customerId, points }: Props) {
  const [isLoading, setLoading] = useState(false);

  async function adjust(amount: number) {
    setLoading(true);
    try {
      await customersService.adjustLoyaltyPoints(customerId, amount, amount > 0 ? 'Admin add' : 'Admin subtract');
      alert('Loyalty adjusted');
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded">
      <div className="flex items-center">
        <DollarSign className="w-6 h-6 mr-2" />
        <div>
          <div className="text-sm text-gray-500">Loyalty Points</div>
          <div className="text-2xl font-semibold">{points}</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button disabled={isLoading} onClick={() => adjust(10)} className="inline-flex items-center px-3 py-1 border rounded text-sm bg-green-50">
          <PlusCircle className="w-4 h-4 mr-1" /> Add
        </button>
        <button disabled={isLoading} onClick={() => adjust(-10)} className="inline-flex items-center px-3 py-1 border rounded text-sm bg-red-50">
          <MinusCircle className="w-4 h-4 mr-1" /> Subtract
        </button>
      </div>
    </div>
  );
}
