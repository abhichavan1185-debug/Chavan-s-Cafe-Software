import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import {
  Boxes,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Truck,
  PlusCircle,
  AlertTriangle,
  Receipt,
  RotateCcw,
  Sparkles
} from "lucide-react";

export const InventoryView: React.FC = () => {
  const { inventory, restockItem, expenses, addExpense, showToast } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isRestockModalOpen, setIsRestockModalOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [supplierName, setSupplierName] = useState<string>("");
  const [purchaseCost, setPurchaseCost] = useState<number>(0);

  const lowStockItems = inventory.filter((i) => i.status !== "Optimal");

  const categories = ["All", "Dairy", "Coffee & Tea", "Beverages", "Pantry", "Poultry", "Packaging"];

  const filteredItems = inventory.filter(
    (i) => selectedCategory === "All" || i.category === selectedCategory
  );

  const handleOpenRestock = (item: any) => {
    setActiveItem(item);
    setRestockQty(item.minThreshold * 2);
    setSupplierName(item.supplierName || "Standard Vendor");
    setPurchaseCost(item.costPerUnit * item.minThreshold * 2);
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    restockItem(activeItem.id, Number(restockQty));

    // Also record expense
    if (purchaseCost > 0) {
      addExpense({
        title: `Purchase: ${restockQty} ${activeItem.unit} of ${activeItem.name}`,
        category: "Raw Materials",
        amount: Number(purchaseCost),
        paidTo: supplierName || "Vendor",
        paymentMode: "UPI",
        date: "Today",
        notes: `Replenished SKU ${activeItem.id}`
      });
    }

    setIsRestockModalOpen(false);
    showToast(`Replenished ${restockQty} ${activeItem.unit} of ${activeItem.name}`);
  };

  return (
    <div className="p-4 sm:p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6 font-sans">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-xs">
            <Boxes className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">
                Kitchen Raw Materials & Recipe Inventory
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Auto Recipe-Deduction
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Live stock depletion per order (Chai, Coffee, Misal, Biryani), low-stock thresholds, and purchase logging
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-950">
              Low Stock Warning: {lowStockItems.length} ingredients below safe reserve!
            </h4>
            <p className="text-[11px] text-amber-800 mt-0.5">
              {lowStockItems.map((i) => `${i.name} (${i.currentStock} ${i.unit} left)`).join(", ")}.
              Restock promptly to prevent kitchen service delays.
            </p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-amber-900 text-white shadow-xs"
                : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Material / Ingredient</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Current Stock</th>
                <th className="px-5 py-3">Min Reserve</th>
                <th className="px-5 py-3">Cost / Unit</th>
                <th className="px-5 py-3">Preferred Supplier</th>
                <th className="px-5 py-3">Health Status</th>
                <th className="px-5 py-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {filteredItems.map((item) => {
                const isCritical = item.status === "Critical";
                const isLow = item.status === "Low Stock" || isCritical;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-stone-900">{item.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">SKU: {item.id}</div>
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">{item.category}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-stone-900">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-stone-500">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-stone-900">
                      ₹{item.costPerUnit} / {item.unit}
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">
                      {item.supplierName || "Direct Market"}
                    </td>
                    <td className="px-5 py-3.5">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          <AlertCircle className="w-3 h-3" />
                          Critical Low
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertCircle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Optimal
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenRestock(item)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">
                Restock Ingredient: {activeItem.name}
              </span>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="p-1 rounded hover:bg-white/20 text-stone-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRestock} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Quantity to Add ({activeItem.unit}) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={restockQty}
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    setRestockQty(q);
                    setPurchaseCost(+(q * activeItem.costPerUnit).toFixed(2));
                  }}
                  className="w-full p-2 border border-stone-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Supplier / Vendor</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Total Purchase Cost (₹)</label>
                <input
                  type="number"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(Number(e.target.value))}
                  className="w-full p-2 border border-stone-300 rounded-lg font-mono font-bold"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Automatically logged into Cafe Expenses ledger
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-bold shadow-md"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
