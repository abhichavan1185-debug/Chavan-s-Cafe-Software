import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import {
  ChefHat,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Utensils,
  Ban
} from "lucide-react";

export const KdsView: React.FC = () => {
  const { orders, updateOrderStatus, showToast, openCancelModal } = useRestaurant();

  const [filter, setFilter] = useState<"active" | "cooking" | "ready">("active");

  const kitchenOrders = orders.filter((o) => {
    if (filter === "active") return o.status === "Cooking" || o.status === "Accepted" || o.status === "Ready";
    if (filter === "cooking") return o.status === "Cooking" || o.status === "Accepted";
    if (filter === "ready") return o.status === "Ready";
    return true;
  });

  return (
    <div className="min-w-0 p-4 sm:p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6">
      {/* KDS Header Banner */}
      <div className="bg-stone-900 text-white p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center">
            <ChefHat className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-wide">KITCHEN DISPLAY SYSTEM (KDS)</h2>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                Live Kitchen Bump Bar
              </span>
            </div>
            <p className="text-xs text-stone-400 font-medium mt-0.5">
              Live preparation queues, timer alerts, recipe KOTs across Dine-In, Parcel & Delivery
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex max-w-full items-center overflow-x-auto bg-stone-800 p-1 rounded-xl text-xs font-bold border border-stone-700">
          <button
            onClick={() => setFilter("active")}
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg transition-all ${
              filter === "active" ? "bg-amber-500 text-stone-950" : "text-stone-400 hover:text-white"
            }`}
          >
            All Active ({orders.filter((o) => o.status === "Cooking" || o.status === "Accepted" || o.status === "Ready").length})
          </button>
          <button
            onClick={() => setFilter("cooking")}
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg transition-all ${
              filter === "cooking" ? "bg-amber-500 text-stone-950" : "text-stone-400 hover:text-white"
            }`}
          >
            Cooking ({orders.filter((o) => o.status === "Cooking" || o.status === "Accepted").length})
          </button>
          <button
            onClick={() => setFilter("ready")}
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg transition-all ${
              filter === "ready" ? "bg-amber-500 text-stone-950" : "text-stone-400 hover:text-white"
            }`}
          >
            Ready ({orders.filter((o) => o.status === "Ready").length})
          </button>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
          <Utensils className="w-12 h-12 mx-auto text-stone-300 mb-2 stroke-[1.5]" />
          <h4 className="text-sm font-bold text-stone-700">Kitchen Display is Clean!</h4>
          <p className="text-xs text-stone-400 mt-1">
            No pending cooking tickets in the queue. New orders will pop up with sound here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {kitchenOrders.map((order, idx) => {
            const isReady = order.status === "Ready";
            const isDelayed = idx === 0; // simulated elapsed timer indicator

            return (
              <div
                key={order.id}
                className={`rounded-2xl border-2 flex flex-col justify-between overflow-hidden shadow-md transition-all ${
                  isReady
                    ? "bg-emerald-50/50 border-emerald-500"
                    : isDelayed
                    ? "bg-amber-50/40 border-amber-500"
                    : "bg-white border-stone-300"
                }`}
              >
                {/* Ticket Header */}
                <div
                  className={`p-3.5 border-b flex items-center justify-between text-xs font-bold ${
                    isReady
                      ? "bg-emerald-600 text-white border-emerald-700"
                      : isDelayed
                      ? "bg-amber-600 text-white border-amber-700"
                      : "bg-stone-800 text-white border-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm tracking-wide">#{order.id}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-black/20">
                      {order.platform}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{order.createdAt}</span>
                  </div>
                </div>

                {/* Table or Delivery Banner */}
                <div className="px-4 py-2 bg-stone-100 border-b border-stone-200 text-xs font-bold text-stone-800 flex justify-between items-center">
                  <span>
                    {order.orderType === "Dine-In"
                      ? `TABLE #${order.tableNumber || 1}`
                      : `${order.orderType.toUpperCase()} PARCEL`}
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500">
                    {order.customerName}
                  </span>
                </div>

                {/* Order Items Checklist */}
                <div className="p-4 flex-1 space-y-2.5">
                  {order.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between text-xs font-medium pb-1.5 border-b border-dashed border-stone-200"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            item.isVeg ? "bg-emerald-600" : "bg-red-600"
                          }`}
                        />
                        <span className="font-bold text-stone-900">
                          {item.quantity} × {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 font-mono text-stone-600">
                        Done
                      </span>
                    </div>
                  ))}
                </div>

                {/* Elapsed Warning Notice if Delayed */}
                {isDelayed && !isReady && (
                  <div className="mx-3 mb-2 p-2 rounded-xl bg-amber-100 border border-amber-300 flex items-center gap-1.5 text-amber-900 text-[10px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                    <span>12 mins elapsed • Priority order</span>
                  </div>
                )}

                {/* Bump Bar Action */}
                <div className="p-3 bg-stone-50 border-t border-stone-200 space-y-2">
                  {isReady ? (
                    <div className="text-center text-xs font-bold text-emerald-700 py-1 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ready for Pickup / Waiter</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        updateOrderStatus(order.id, "Ready", "Food Ready");
                        showToast(`Order #${order.id} bumped as READY`);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <Flame className="w-4 h-4" />
                      <span>Bump Ticket: Food Ready</span>
                    </button>
                  )}

                  <button
                    onClick={() => openCancelModal(order)}
                    className="w-full py-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Ban className="w-3 h-3 text-red-500" />
                    <span>Cancel Ticket</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
