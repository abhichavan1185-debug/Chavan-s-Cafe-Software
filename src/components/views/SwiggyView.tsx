import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { OrderStatus } from "../../types";
import {
  Bike,
  CheckCircle2,
  XCircle,
  ChefHat,
  PackageCheck,
  Send,
  Navigation,
  Clock,
  Phone,
  MapPin,
  TrendingUp,
  Receipt
} from "lucide-react";

export const SwiggyView: React.FC = () => {
  const {
    orders,
    partners,
    updateOrderStatus,
    advanceDeliveryStage,
    assignPartner,
    simulateIncomingOrder,
    setActiveView,
    setActiveTrackOrderId
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<"All" | "Incoming" | "Cooking" | "Ready" | "Out for Delivery" | "Delivered">("All");

  const swiggyOrders = orders.filter((o) => o.platform === "Swiggy");

  const totalSwiggyRev = swiggyOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const displayedOrders = swiggyOrders.filter((o) => {
    if (activeTab === "All") return true;
    return o.status === activeTab;
  });

  return (
    <div className="min-w-0 p-4 sm:p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6">
      {/* Swiggy Merchant Banner */}
      <div className="bg-gradient-to-r from-[#fc8019] to-[#e05c06] text-white p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white text-[#fc8019] flex items-center justify-center shadow-md">
            <Bike className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black tracking-wide">SWIGGY MERCHANT HUB</h2>
              <span className="hidden sm:inline-flex bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Store #41908 • Live
              </span>
            </div>
            <p className="text-xs text-orange-100 font-medium mt-0.5">
              Direct API Integration Gateway • Real-time dispatch and order lifecycle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => simulateIncomingOrder("Swiggy")}
            className="px-4 py-2 bg-white text-[#fc8019] hover:bg-orange-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>+ Simulate Swiggy Order</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 text-[#fc8019]">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-500">Total Swiggy Orders</div>
            <div className="text-lg font-mono font-black text-stone-900">{swiggyOrders.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-500">Swiggy Sales</div>
            <div className="text-lg font-mono font-black text-stone-900">
              ₹{totalSwiggyRev.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-500">In Preparation</div>
            <div className="text-lg font-mono font-black text-stone-900">
              {swiggyOrders.filter((o) => o.status === "Cooking" || o.status === "Accepted").length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-500">Out on Road</div>
            <div className="text-lg font-mono font-black text-stone-900">
              {swiggyOrders.filter((o) => o.status === "Out for Delivery").length}
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-stone-200">
        {(["All", "Incoming", "Cooking", "Ready", "Out for Delivery", "Delivered"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-[#fc8019] text-white shadow-xs"
                : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
            }`}
          >
            {tab} (
            {tab === "All"
              ? swiggyOrders.length
              : swiggyOrders.filter((o) => o.status === tab).length}
            )
          </button>
        ))}
      </div>

      {/* Order Cards Grid */}
      {displayedOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
          <Bike className="w-12 h-12 mx-auto text-stone-300 mb-2 stroke-[1.5]" />
          <h4 className="text-sm font-bold text-stone-600">No orders in this stage</h4>
          <p className="text-xs text-stone-400 mt-1">
            Click "+ Simulate Swiggy Order" above to generate a new live delivery order
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedOrders.map((order) => {
            const partner = partners.find((p) => p.id === order.deliveryPartnerId);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Top strip */}
                <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-stone-900">
                        #{order.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#fc8019]">
                        {order.deliveryStage}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{order.createdAt}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-mono font-black text-[#fc8019]">
                      ₹{order.grandTotal.toFixed(2)}
                    </span>
                    <span className="block text-[9px] uppercase font-bold text-emerald-700">
                      {order.paymentStatus} ({order.paymentMethod})
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="py-2.5 text-xs space-y-1 text-stone-700">
                  <div className="font-bold text-stone-900 flex items-center justify-between">
                    <span>{order.customerName}</span>
                    <span className="text-stone-500 font-mono text-[11px] flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.customerPhone}
                    </span>
                  </div>
                  {order.deliveryAddress && (
                    <div className="flex items-start gap-1.5 text-stone-500 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-amber-700 mt-0.5" />
                      <span className="line-clamp-1">{order.deliveryAddress}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="p-2.5 bg-stone-50 rounded-xl space-y-1 text-xs">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span className="truncate">
                        {i.quantity}x {i.name}
                      </span>
                      <span className="font-mono font-semibold text-stone-800">
                        ₹{i.price * i.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Assigned Rider info if present */}
                {partner && (
                  <div className="mt-2 p-2 bg-blue-50/70 rounded-xl border border-blue-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-blue-950 text-[11px]">{partner.name}</div>
                        <div className="text-[10px] text-blue-800/80 font-mono">
                          {partner.vehicleNumber}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700">{partner.status}</span>
                  </div>
                )}

                {/* Actions Lifecycle Bar */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 mt-3">
                  <button
                    onClick={() => {
                      setActiveTrackOrderId(order.id);
                      setActiveView("tracking");
                    }}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Track Live GPS</span>
                  </button>

                  <div className="flex items-center gap-1.5 ml-auto">
                    {order.status === "Incoming" && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, "Cancelled")}
                          className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, "Cooking", "Food Preparing")}
                          className="px-3 py-1 text-xs font-bold text-white bg-[#fc8019] hover:bg-orange-600 rounded-lg shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept & Cook</span>
                        </button>
                      </>
                    )}

                    {order.status === "Cooking" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "Ready", "Food Ready")}
                        className="px-3 py-1 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    )}

                    {order.status === "Ready" && !order.deliveryPartnerId && (
                      <div className="flex items-center gap-1">
                        <select
                          onChange={(e) => {
                            if (e.target.value) assignPartner(order.id, e.target.value);
                          }}
                          defaultValue=""
                          className="text-[11px] font-bold bg-stone-100 border border-stone-300 rounded-lg px-2 py-1"
                        >
                          <option value="" disabled>
                            Assign Partner
                          </option>
                          {partners
                            .filter((p) => p.status === "Available")
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.vehicleType})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {order.status === "Ready" && order.deliveryPartnerId && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "Out for Delivery", "On The Way")}
                        className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Partner</span>
                      </button>
                    )}

                    {order.status === "Out for Delivery" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "Delivered", "Delivered")}
                        className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Delivered</span>
                      </button>
                    )}

                    {order.status !== "Delivered" && order.status !== "Cancelled" && (
                      <button
                        onClick={() => advanceDeliveryStage(order.id)}
                        title="Step to next lifecycle stage"
                        className="px-2 py-1 text-[10px] font-bold text-stone-600 hover:bg-stone-100 rounded-md border border-stone-200"
                      >
                        Next Step &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
