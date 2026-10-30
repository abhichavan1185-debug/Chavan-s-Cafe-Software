import React from "react";
import { useRestaurant } from "../context/RestaurantContext";
import { Printer, X, CheckCircle2 } from "lucide-react";

export const ThermalReceiptModal: React.FC = () => {
  const { selectedBillOrder, closeBillModal } = useRestaurant();

  if (!selectedBillOrder) return null;

  const order = selectedBillOrder;
  const cgst = +(order.tax / 2).toFixed(2);
  const sgst = +(order.tax / 2).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Modal Dialog */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header bar (no-print) */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold tracking-wide">Tax Invoice & KOT Receipt</span>
          </div>
          <button
            onClick={closeBillModal}
            className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 overflow-y-auto bg-stone-100 flex justify-center">
          <div
            id="thermal-print-area"
            className="w-full max-w-[340px] bg-white p-5 shadow-md border border-stone-200 text-stone-950 font-mono text-[11px] leading-snug"
          >
            {/* Cafe Logo & Header */}
            <div className="text-center space-y-0.5 pb-3 border-b border-dashed border-stone-800">
              <h2 className="text-lg font-black tracking-wider uppercase">SHRU'S CAFE</h2>
              <p className="text-[10px] italic">Artisanal Roastery & Gourmet Kitchen</p>
              <p className="text-[9px] text-stone-600">FC Road, Deccan Gymkhana, Pune - 411004</p>
              <p className="text-[9px] text-stone-600 font-semibold">GSTIN: 27AABCU9603R1ZM</p>
              <p className="text-[8px] text-stone-500">FSSAI Lic: 11521034000412</p>
            </div>

            {/* Meta Information */}
            <div className="py-2.5 space-y-1 text-[10px] border-b border-dashed border-stone-800">
              <div className="flex justify-between">
                <span>INVOICE NO:</span>
                <strong className="font-bold">{order.invoiceNumber || `SHRU-INV-${order.id}`}</strong>
              </div>
              <div className="flex justify-between">
                <span>CHANNEL / TYPE:</span>
                <span>{order.platform} • {order.orderType}</span>
              </div>
              {order.tableNumber && (
                <div className="flex justify-between font-bold text-amber-900">
                  <span>TABLE NUMBER:</span>
                  <span>TABLE #{order.tableNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span>{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>PHONE:</span>
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE & TIME:</span>
                <span>{new Date().toLocaleDateString("en-IN")} {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-stone-800">
              <div className="grid grid-cols-12 font-bold text-[10px] pb-1 border-b border-stone-400">
                <span className="col-span-6">ITEM</span>
                <span className="col-span-2 text-center">QTY</span>
                <span className="col-span-2 text-right">RATE</span>
                <span className="col-span-2 text-right">AMT</span>
              </div>

              <div className="divide-y divide-stone-200 py-1 space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 text-[10px] py-1 items-center">
                    <span className="col-span-6 truncate font-medium">
                      {item.isVeg ? "[V]" : "[NV]"} {item.name}
                    </span>
                    <span className="col-span-2 text-center">{item.quantity}</span>
                    <span className="col-span-2 text-right">₹{item.price}</span>
                    <span className="col-span-2 text-right font-semibold">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Calculation Breakdown */}
            <div className="py-2.5 space-y-1 text-[10px] border-b border-dashed border-stone-800">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>CGST (2.5%):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>SGST (2.5%):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>DELIVERY CHARGE:</span>
                  <span>₹{order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>DISCOUNT ({order.couponCode || "PROMO"}):</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-stone-800 text-stone-950">
                <span>NET PAYABLE AMOUNT:</span>
                <span>₹{order.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Footer */}
            <div className="pt-2 text-center space-y-1 text-[9px] text-stone-600">
              <div className="flex items-center justify-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />
                <span>PAYMENT STATUS: {order.paymentStatus.toUpperCase()} ({order.paymentMethod})</span>
              </div>
              <p>*** THANK YOU! VISIT AGAIN ***</p>
              <p className="text-[8px] text-stone-400">Powered by Shru's Cafe Enterprise Restaurant Suite</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (no-print) */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={closeBillModal}
            className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print 80mm Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
