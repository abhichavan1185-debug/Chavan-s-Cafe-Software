import React, { useState } from "react";
import { useRestaurant } from "../context/RestaurantContext";
import { AlertTriangle, X, Check, Ban } from "lucide-react";

const CANCEL_REASONS = [
  "Customer Changed Mind / Requested Cancellation",
  "Item Out of Stock / Kitchen Inventory Exhausted",
  "Duplicate Order Created by Mistake",
  "Kitchen Delay / Preparation Over SLA",
  "Delivery Address Outside Radius / Customer Unreachable",
  "Payment Failed or Unverified",
  "Other / Custom Reason"
];

export const OrderCancelModal: React.FC = () => {
  const { selectedCancelOrder, closeCancelModal, cancelOrder } = useRestaurant();
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [customNote, setCustomNote] = useState<string>("");

  if (!selectedCancelOrder) return null;

  const handleConfirmCancel = () => {
    const finalReason =
      selectedReason === "Other / Custom Reason" && customNote.trim()
        ? customNote.trim()
        : selectedReason + (customNote.trim() ? ` - ${customNote.trim()}` : "");

    cancelOrder(selectedCancelOrder.id, finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-red-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Ban className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Cancel Order #{selectedCancelOrder.id}</h3>
              <p className="text-[11px] text-red-100 font-medium">
                {selectedCancelOrder.orderType} • {selectedCancelOrder.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={closeCancelModal}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Summary Box */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-stone-700">Order Amount:</p>
              <p className="text-sm font-mono font-black text-amber-950">
                ₹{selectedCancelOrder.grandTotal.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-stone-700">Items:</p>
              <p className="text-xs font-semibold text-stone-600">
                {selectedCancelOrder.items.length} items ({selectedCancelOrder.items.map((i) => `${i.quantity}x ${i.name}`).slice(0, 2).join(", ")}
                {selectedCancelOrder.items.length > 2 ? "..." : ""})
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-red-50 rounded-2xl border border-red-200 flex gap-2.5 items-start text-red-900">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">Cancellation Effect:</span> This will mark the order as{" "}
              <span className="font-semibold underline">Cancelled</span>, vacate any reserved dine-in table, free any assigned delivery rider, and record the cancellation reason in Supabase.
            </div>
          </div>

          {/* Reason selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 text-xs block">Select Cancellation Reason:</label>
            <div className="space-y-1.5">
              {CANCEL_REASONS.map((reason) => (
                <button
                  type="button"
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                    selectedReason === reason
                      ? "bg-red-50 border-red-400 text-red-950 font-bold"
                      : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <span>{reason}</span>
                  {selectedReason === reason && (
                    <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Notes */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700 text-xs block">Additional Notes / Details (Optional):</label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Customer called to cancel due to emergency, or item milk ran out..."
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeCancelModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 transition-colors"
          >
            Keep Order Active
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Confirm Cancellation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
