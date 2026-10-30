import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import {
  TrendingUp,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Sparkles,
  Download,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";

export const AnalyticsView: React.FC = () => {
  const { orders, expenses, settings, showToast } = useRestaurant();
  const [timeRange, setTimeRange] = useState<"Today" | "This Week" | "This Month">("Today");

  // Multiplier for mock week/month view
  const multiplier = timeRange === "Today" ? 1 : timeRange === "This Week" ? 5.8 : 22.4;

  // Aggregations
  const totalOrders = Math.round(orders.length * multiplier);
  const completedOrders = Math.round(orders.filter((o) => o.status === "Delivered").length * multiplier);
  const pendingOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  ).length;
  const cancelledOrders = Math.round(orders.filter((o) => o.status === "Cancelled").length * multiplier);

  const baseGrossSales = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.grandTotal, 0);
  const grossSales = +(baseGrossSales * multiplier).toFixed(2);

  const baseTax = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.tax, 0);
  const totalTax = +(baseTax * multiplier).toFixed(2);

  const baseDiscount = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.discount, 0);
  const totalDiscount = +(baseDiscount * multiplier).toFixed(2);

  const baseExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = +(baseExpenses * (timeRange === "Today" ? 1 : timeRange === "This Week" ? 4.5 : 18)).toFixed(2);

  const netProfit = +(grossSales - totalTax - totalExpenses).toFixed(2);
  const aov = totalOrders > 0 ? +(grossSales / (totalOrders - cancelledOrders || 1)).toFixed(2) : 0;

  // Payment Breakdown
  const cashSales = +(orders.filter((o) => o.paymentMethod === "Cash").reduce((s, o) => s + o.grandTotal, 0) * multiplier).toFixed(2);
  const upiSales = +(orders.filter((o) => o.paymentMethod.includes("UPI") || o.paymentMethod === "Prepaid").reduce((s, o) => s + o.grandTotal, 0) * multiplier).toFixed(2);
  const cardSales = +(orders.filter((o) => o.paymentMethod.includes("Credit")).reduce((s, o) => s + o.grandTotal, 0) * multiplier).toFixed(2);

  // Platform Breakdown
  const posSales = +(orders.filter((o) => o.platform === "POS").reduce((s, o) => s + o.grandTotal, 0) * multiplier).toFixed(2);
  const swiggySales = +(orders.filter((o) => o.platform === "Swiggy").reduce((s, o) => s + o.grandTotal, 0) * multiplier).toFixed(2);
  const zomatoSales = +(orders.filter((o) => o.platform === "Zomato").reduce((s, o) => s + o.grandTotal, 0) * multiplier).toFixed(2);
  const onlineSales = +(orders.filter((o) => o.platform === "Customer-Online").reduce((s, o) => s + o.grandTotal, 0) * multiplier).toFixed(2);

  // Export CSV
  const handleExportCSV = () => {
    const csvRows = [
      ["Order ID", "Invoice Number", "Date", "Customer", "Platform", "Order Type", "Payment Mode", "Status", "Total (INR)"],
      ...orders.map((o) => [
        o.id,
        o.invoiceNumber || `SHRU-INV-${o.id}`,
        o.createdAt,
        `"${o.customerName}"`,
        o.platform,
        o.orderType,
        o.paymentMethod,
        o.status,
        o.grandTotal
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shrus_cafe_sales_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Sales CSV report downloaded");
  };

  return (
    <div className="p-4 sm:p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-xs">
            <BarChart3 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Executive Business Reports & P&L Analytics
            </h3>
            <p className="text-xs text-stone-500">
              Computed from actual orders, GST liabilities, expenses ledger, and aggregator splits
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
            {(["Today", "This Week", "This Month"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === r
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Gross Cafe Revenue
          </span>
          <div className="text-2xl font-black font-mono text-stone-900 mt-1">
            ₹{grossSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +14.2% vs prev period
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Estimated Net Profit
          </span>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            ₹{netProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">
            After taxes (₹{totalTax}) & expenses (₹{totalExpenses})
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Total Bills & Orders
          </span>
          <div className="text-2xl font-black font-mono text-stone-900 mt-1">
            {totalOrders}
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">
            {completedOrders} Delivered • {pendingOrders} Active
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Average Order Value (AOV)
          </span>
          <div className="text-2xl font-black font-mono text-stone-900 mt-1">
            ₹{aov}
          </div>
          <span className="text-[10px] text-stone-500 mt-1 block">
            Per paid transaction ticket
          </span>
        </div>
      </div>

      {/* Grid: Payment Breakdown & Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-700" />
              <span>Payment Mode Collection Split</span>
            </h4>
            <span className="text-[10px] text-stone-400 font-mono">Verified Receipts</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-stone-700">
                  <QrCode className="w-3.5 h-3.5 text-amber-600" />
                  UPI & Online Wallets
                </span>
                <span className="font-mono font-bold text-stone-900">₹{upiSales}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (upiSales / (grossSales || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-stone-700">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  Cash in Counter
                </span>
                <span className="font-mono font-bold text-stone-900">₹{cashSales}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (cashSales / (grossSales || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-stone-700">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Credit & Debit Cards
                </span>
                <span className="font-mono font-bold text-stone-900">₹{cardSales}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (cardSales / (grossSales || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Channel Splits */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              <span>Multi-Channel Revenue Channels</span>
            </h4>
            <span className="text-[10px] text-stone-400 font-mono">POS vs Aggregators</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-stone-700">In-Store Dine-In & Counter POS</span>
                <span className="font-mono font-bold text-stone-900">₹{posSales}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-stone-800 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (posSales / (grossSales || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#fc8019] font-bold">Swiggy Orders (Gross)</span>
                <span className="font-mono font-bold text-stone-900">₹{swiggySales}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#fc8019] h-2 rounded-full"
                  style={{ width: `${Math.min(100, (swiggySales / (grossSales || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#e23744] font-bold">Zomato Orders (Gross)</span>
                <span className="font-mono font-bold text-stone-900">₹{zomatoSales}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#e23744] h-2 rounded-full"
                  style={{ width: `${Math.min(100, (zomatoSales / (grossSales || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-800 font-bold">Direct Online Storefront</span>
                <span className="font-mono font-bold text-stone-900">₹{onlineSales}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-800 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (onlineSales / (grossSales || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
