import type { ComponentType } from 'react';
import { Building2, CreditCard, Wallet, Banknote } from 'lucide-react';
import { Input, Button, Card, Switch } from '@/components/ui';
import type { PaymentMethod } from '../pos.types';

interface PaymentMethodPanelProps {
  method: PaymentMethod;
  methodSecondary?: PaymentMethod | null;
  paidAmount: number;
  paidAmountSecondary?: number | null;
  changeAmount: number;
  splitEnabled: boolean;
  reference?: string | null;
  onMethodChange: (method: PaymentMethod) => void;
  onSecondaryMethodChange: (method: PaymentMethod) => void;
  onPaidAmountChange: (amount: number) => void;
  onPaidAmountSecondaryChange: (amount: number) => void;
  onSplitToggle: (enabled: boolean) => void;
  onReferenceChange: (reference: string | null) => void;
}

const methods: Array<{ value: PaymentMethod; label: string; icon: ComponentType<{ className?: string }> }> = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'bank-transfer', label: 'Bank Transfer', icon: Building2 },
  { value: 'e-wallet', label: 'E-Wallet', icon: Wallet }
];

function methodButtonClass(selected: boolean) {
  return selected
    ? 'border-2 border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900';
}

export function PaymentMethodPanel({
  method,
  methodSecondary,
  paidAmount,
  paidAmountSecondary,
  changeAmount,
  splitEnabled,
  reference,
  onMethodChange,
  onSecondaryMethodChange,
  onPaidAmountChange,
  onPaidAmountSecondaryChange,
  onSplitToggle,
  onReferenceChange
}: PaymentMethodPanelProps) {
  const selectedSecondaryOptions = methods.filter((option) => option.value !== method);

  return (
    <Card className="space-y-4 p-4 glass-card">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Payment method</h3>
        <p className="text-sm text-slate-500">Choose the primary payment method for this sale.</p>
      </div>

      <div className="grid gap-3 grid-cols-2">
        {methods.map((option) => {
          const Icon = option.icon;
          const isSelected = method === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-150 ${methodButtonClass(isSelected)}`}
              onClick={() => onMethodChange(option.value)}
            >
              <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Split Payment</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Use a second payment source if needed.</p>
        </div>
        <Switch checked={splitEnabled} onCheckedChange={(checked) => onSplitToggle(Boolean(checked))} />
      </div>

      <div className="grid gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Paid amount</label>
          <Input type="number" value={paidAmount} min={0} onChange={(event) => onPaidAmountChange(Number(event.target.value || 0))} />
        </div>

        {method === 'cash' ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-slate-700 dark:text-slate-200">Change</div>
            <div className={`mt-1 font-semibold ${changeAmount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {changeAmount >= 0 ? `+${changeAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}` : `${changeAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}`}
            </div>
          </div>
        ) : null}
      </div>

      {splitEnabled ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Secondary payment</div>
          <div className="grid gap-3 grid-cols-2">
            {selectedSecondaryOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = methodSecondary === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl p-3 transition-all duration-150 ${methodButtonClass(isSelected)}`}
                  onClick={() => onSecondaryMethodChange(option.value)}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Secondary paid amount</label>
            <Input type="number" value={paidAmountSecondary ?? 0} min={0} onChange={(event) => onPaidAmountSecondaryChange(Number(event.target.value || 0))} />
          </div>
        </div>
      ) : null}

      {(method !== 'cash' || (splitEnabled && methodSecondary && ['card', 'bank-transfer', 'e-wallet'].includes(methodSecondary))) ? (
        <div>
          <label htmlFor="payment-reference" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Reference / Note</label>
          <Input
            id="payment-reference"
            type="text"
            value={reference ?? ''}
            placeholder="Payment reference (optional)"
            onChange={(event) => onReferenceChange(event.target.value || null)}
          />
        </div>
      ) : null}
    </Card>
  );
}
