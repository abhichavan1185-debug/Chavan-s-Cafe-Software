import React from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import {
  LayoutGrid,
  Users,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles
} from "lucide-react";

export const TablesView: React.FC = () => {
  const { tables, toggleTableStatus, vacateAllTables, settleTable, orders, openBillModal } = useRestaurant();

  const occupiedCount = tables.filter((t) => t.status !== "available").length;

  return (
    <div className="p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <LayoutGrid className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Restaurant Table Floor Plan (Tables 1 - 15)
            </h3>
            <p className="text-xs text-stone-500">
              Real-time table seating occupancy, running diner accounts & instant cashier settlement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-stone-100 rounded-xl text-xs font-bold text-stone-700 border border-stone-200">
            Occupied: <span className="text-amber-900 font-black">{occupiedCount}/15</span>
          </div>

          <button
            onClick={vacateAllTables}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-colors"
          >
            Vacate All Tables
          </button>
        </div>
      </div>

      {/* 15 Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => {
          const isOccupied = table.status !== "available";
          const relatedOrder = orders.find(
            (o) => o.tableNumber === table.number && o.status !== "Delivered"
          );

          return (
            <div
              key={table.id}
              className={`rounded-2xl border-2 p-4 flex flex-col justify-between shadow-xs transition-all ${
                isOccupied
                  ? "bg-red-50/50 border-red-300 hover:border-red-400"
                  : "bg-white border-emerald-300 hover:border-emerald-400"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-stone-900 font-mono">
                    TABLE #{table.number}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                    <Users className="w-3 h-3" />
                    <span>Cap: {table.capacity} Guests</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    isOccupied
                      ? "bg-red-100 text-red-800 border-red-200"
                      : "bg-emerald-100 text-emerald-800 border-emerald-200"
                  }`}
                >
                  {isOccupied ? "Occupied" : "Available"}
                </span>
              </div>

              {/* Bill & Diners Info */}
              <div className="my-3 py-2.5 px-3 bg-white/80 rounded-xl border border-stone-200/80 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-stone-500">Current Bill:</span>
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    ₹{table.currentBill || 0}
                  </span>
                </div>
                {isOccupied && (
                  <div className="flex justify-between items-center text-[10px] text-amber-800 font-semibold pt-1 border-t border-stone-100">
                    <span>Order #{relatedOrder?.id || "POS"}</span>
                    <span>{relatedOrder?.items.length || 2} dishes</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                {isOccupied ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => settleTable(table.number)}
                      className="py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Settle</span>
                    </button>
                    <button
                      onClick={() => toggleTableStatus(table.number)}
                      className="py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[11px] rounded-lg transition-colors"
                    >
                      Release
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleTableStatus(table.number)}
                    className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg shadow-xs transition-all"
                  >
                    Seat Guests
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
