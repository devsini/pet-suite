import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ShoppingCart, Receipt, Search } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button, Card, Input, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { posService } from '../pos.service';
import useCartStore from '../stores/cart.store';
import ReceiptModal from '../components/ReceiptModal';
import { CustomerSearchPanel } from '../components/CustomerSearchPanel';
import { LoyaltyRedeemPanel } from '../components/LoyaltyRedeemPanel';
import { PaymentMethodPanel } from '../components/PaymentMethodPanel';
import { LoadInpatientBillModal } from '../components/LoadInpatientBillModal';
import { formatCurrency } from '@/lib/utils';
import type { CartItem } from '../pos.types';

export default function PosPage() {
  const [tab, setTab] = useState<'products' | 'services'>('products');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [results, setResults] = useState<any[]>([]);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [receiptCart, setReceiptCart] = useState<any>(null);
  const [receiptPayment, setReceiptPayment] = useState<any>(null);
  const [inpatientModalOpen, setInpatientModalOpen] = useState(false);
  const [inpatientRecordId, setInpatientRecordId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const cart = useCartStore((s) => s.cart);
  const paymentData = useCartStore((s) => s.paymentData);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const setItemDiscount = useCartStore((s) => s.setItemDiscount);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const setPaidAmount = useCartStore((s) => s.setPaidAmount);
  const setPaidAmountSecondary = useCartStore((s) => s.setPaidAmountSecondary);
  const setSecondaryMethod = useCartStore((s) => s.setSecondaryMethod);
  const toggleSplitPayment = useCartStore((s) => s.toggleSplitPayment);
  const setReference = useCartStore((s) => s.setReference);
  const setCustomer = useCartStore((s) => s.setCustomer);
  const setLoyaltyRedeem = useCartStore((s) => s.setLoyaltyRedeem);
  const loadInpatientBill = useCartStore((s) => s.loadInpatientBill);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    let mounted = true;

    async function search() {
      if (!debounced) {
        setResults([]);
        return;
      }

      try {
        const res = tab === 'products'
          ? await posService.searchProducts(debounced)
          : await posService.searchServices(debounced);

        if (mounted) setResults(res);
      } catch (error) {
        toast.error('Failed to search items. Please try again.');
      }
    }

    search();
    return () => { mounted = false; };
  }, [debounced, tab]);

  const addResultToCart = (result: any) => {
    const item: Omit<CartItem, 'id' | 'total'> = {
      name: result.name,
      itemType: tab === 'products' ? 'product' : 'service',
      referenceId: result.id,
      unitPrice: result.price,
      quantity: 1,
      discountAmount: 0
    };

    addItem(item);
  };

  const handleSelectCustomer = (customerId: string | null, customerName: string | null, loyaltyPoints: number, phone?: string | null) => {
    setCustomer(customerId, customerName, loyaltyPoints, phone ?? null);
    setLoyaltyRedeem(0);
  };

  const handleBillLoad = (items: CartItem[], recordId: string) => {
    loadInpatientBill(items);
    setInpatientRecordId(recordId);
  };

  const paymentInfo = useMemo(
    () => ({
      method: paymentData.method,
      methodSecondary: paymentData.methodSecondary ?? null,
      paidAmount: paymentData.paidAmount,
      paidAmountSecondary: paymentData.paidAmountSecondary ?? 0,
      changeAmount: paymentData.changeAmount,
      phone: cart.customerPhone ?? null,
      reference: paymentData.reference ?? null
    }),
    [cart.customerPhone, paymentData]
  );

  const checkout = async () => {
    if (!cart.items.length) {
      toast.error('Add items to the cart before checkout.');
      return;
    }

    const payload = {
      customer_id: cart.customerId ?? null,
      subtotal: cart.subtotal,
      discount_amount: cart.discountTotal,
      loyalty_points_used: cart.loyaltyPointsToRedeem || 0,
      loyalty_discount_amount: cart.loyaltyDiscount,
      total: cart.total,
      payment_method: paymentData.method,
      payment_method_secondary: paymentData.methodSecondary ?? null,
      paid_amount: paymentData.paidAmount + (paymentData.splitEnabled ? (paymentData.paidAmountSecondary || 0) : 0),
      change_amount: paymentData.changeAmount,
      status: 'paid',
      notes: paymentData.reference ?? null,
      inpatient_record_id: inpatientRecordId,
      items: cart.items.map((item) => ({
        item_type: item.itemType,
        reference_id: item.referenceId,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discountAmount,
        total: item.total
      }))
    };

    setCheckoutLoading(true);
    try {
      const invoice = await posService.createInvoice(payload as any);
      setInvoiceNumber(invoice.invoice_number || invoice.id);
      setReceiptCart({
        ...cart,
        items: cart.items.map((item) => ({ ...item }))
      });
      setReceiptPayment({ ...paymentInfo });
      setReceiptOpen(true);
      clearCart();
      setInpatientRecordId(null);
    } catch (error) {
      toast.error('Failed to complete checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Point of Sale" description="Create invoices and process payments." />

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1.2fr,1.4fr,420px]">
        <div className="space-y-4">
          <CustomerSearchPanel
            selectedCustomerId={cart.customerId ?? undefined}
            selectedCustomerName={cart.customerName ?? undefined}
            onSelect={handleSelectCustomer}
          />

          <LoyaltyRedeemPanel
            availablePoints={cart.loyaltyPointsAvailable ?? 0}
            currentTotal={cart.subtotal}
            pointsToRedeem={cart.loyaltyPointsToRedeem ?? 0}
            onRedeemChange={setLoyaltyRedeem}
          />

          <Card className="space-y-4 p-4 glass-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Search inventory</h3>
                <p className="text-sm text-slate-500">Add products or services to the cart.</p>
              </div>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as 'products' | 'services')}>
              <TabsList className="w-full bg-slate-100 rounded-xl p-1">
                <TabsTrigger value="products" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">Products</TabsTrigger>
                <TabsTrigger value="services" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">Services</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or SKU"
                className="pl-9"
                aria-label="Search products and services"
              />
            </div>

            <div className="space-y-2 pt-4 max-h-80 overflow-y-auto">
              {results.length ? (
                results.map((result) => (
                  <div key={result.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-150 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{result.name}</div>
                      <div className="text-sm text-slate-500">{formatCurrency(result.price)}</div>
                    </div>
                    <Button onClick={() => addResultToCart(result)} size="sm">
                      <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  {query ? 'No items found for this search.' : 'Search products or services to add to the cart.'}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setInpatientModalOpen(true)}>Load inpatient bill</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 glass-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Cart items</h3>
                <p className="text-sm text-slate-500">Review items before checkout.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearCart} disabled={!cart.items.length}>Clear cart</Button>
            </div>

            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
              {cart.items.length > 0 ? (
                cart.items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-blue-50/30 hover:border-blue-200 transition-all duration-150 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
                        <div className="text-sm text-slate-500">{formatCurrency(item.unitPrice)} x {item.quantity}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</Button>
                        <div className="w-10 text-center text-sm font-medium">{item.quantity}</div>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                        <Input
                          className="w-24"
                          type="number"
                          min={0}
                          value={item.discountAmount}
                          onChange={(event) => setItemDiscount(item.id, Number(event.target.value || 0))}
                        />
                        <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}>Remove</Button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">Line total: {formatCurrency(item.total)}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  Your cart is currently empty.
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
              <div className="flex justify-between py-1"><span className="text-slate-500">Subtotal</span><span className="font-medium">{formatCurrency(cart.subtotal)}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Discount</span><span className="font-medium text-rose-600">{formatCurrency(cart.discountTotal)}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Loyalty</span><span className="font-medium text-amber-600">{formatCurrency(cart.loyaltyDiscount)}</span></div>
              <div className="border-t border-slate-200 pt-3 mt-1 dark:border-slate-800">
                <div className="flex justify-between text-base font-bold"><span>Total</span><span className="text-blue-600 dark:text-blue-400">{formatCurrency(cart.total)}</span></div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <PaymentMethodPanel
            method={paymentData.method}
            methodSecondary={paymentData.methodSecondary}
            paidAmount={paymentData.paidAmount}
            paidAmountSecondary={paymentData.paidAmountSecondary}
            changeAmount={paymentData.changeAmount}
            splitEnabled={paymentData.splitEnabled}
            reference={paymentData.reference}
            onMethodChange={setPaymentMethod}
            onSecondaryMethodChange={setSecondaryMethod}
            onPaidAmountChange={setPaidAmount}
            onPaidAmountSecondaryChange={setPaidAmountSecondary}
            onSplitToggle={toggleSplitPayment}
            onReferenceChange={(reference) => setReference(reference)}
          />

          <Card className="space-y-4 p-4 glass-card">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Checkout</h3>
              <p className="text-sm text-slate-500">Confirm the invoice and complete payment.</p>
            </div>

            <div className="space-y-3 text-sm bg-slate-50 rounded-xl p-4 dark:bg-slate-900">
              <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="font-medium">{cart.customerName ?? 'Walk-in'}</span></div>
              {cart.customerPhone ? <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-medium">{cart.customerPhone}</span></div> : null}
              <div className="flex justify-between"><span className="text-slate-500">Payment method</span><span className="font-medium">{paymentData.method}{paymentData.splitEnabled && paymentData.methodSecondary ? ` + ${paymentData.methodSecondary}` : ''}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="font-medium text-emerald-600">{formatCurrency(paymentData.paidAmount + (paymentData.splitEnabled ? (paymentData.paidAmountSecondary || 0) : 0))}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Change</span><span className="font-medium text-amber-600">{formatCurrency(paymentData.changeAmount)}</span></div>
            </div>

            <Button
              onClick={checkout}
              disabled={!cart.items.length || checkoutLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 font-semibold py-3.5 rounded-xl text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/40 active:scale-[0.98]"
            >
              {checkoutLoading ? 'Processing…' : 'Complete checkout'}
            </Button>
          </Card>
        </div>
      </div>

      <LoadInpatientBillModal
        open={inpatientModalOpen}
        onOpenChange={setInpatientModalOpen}
        onLoad={handleBillLoad}
      />

      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        invoiceNumber={invoiceNumber}
        cashier="POS"
        customerName={receiptCart?.customerName ?? cart.customerName}
        cart={receiptCart ?? cart}
        paymentInfo={receiptPayment ?? paymentInfo}
      />
    </div>
  );
}
