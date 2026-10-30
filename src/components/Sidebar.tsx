import React from "react";
import { useRestaurant } from "../context/RestaurantContext";
import { BrandLogo } from "./BrandLogo";
import {
  Calculator,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  MapPin,
  Users,
  Grid,
  BarChart3,
  Package,
  HeartHandshake,
  BookOpen,
  Database,
  Radio,
  Coffee,
  X,
  CircleDot,
  Navigation,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    orders,
    tables,
    inventory,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentRole
  } = useRestaurant();

  const pendingKitchenOrders = orders.filter(
    (o) => o.status === "Cooking" || o.status === "Incoming" || o.status === "Accepted"
  ).length;

  const lowStockCount = inventory.filter((i) => i.status !== "Optimal").length;
  const activeDeliveries = orders.filter(
    (o) => o.orderType === "Home Delivery" && o.status !== "Delivered" && o.status !== "Cancelled"
  ).length;
  const occupiedTables = tables.filter((t) => t.status !== "available").length;

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs animate-in fade-in duration-150"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-gradient-to-b from-[#1c1917] via-[#291811] to-[#3d1e0f] text-amber-50 flex flex-col flex-shrink-0 shadow-2xl select-none border-r border-amber-900/40 transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header with Rich Logo */}
        <div className="p-4 border-b border-amber-500/20 bg-black/30 flex items-center justify-between">
          <BrandLogo size="md" variant="gold" showTagline={true} />

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Role Pill */}
        <div className="mx-3 my-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-[10px]">
          <span className="text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            Role: {currentRole}
          </span>
          <span className="text-amber-200/60 font-mono">v3.5 Active</span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-2.5 py-2 overflow-y-auto space-y-4">
          {/* Sales & Ordering */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-amber-300/50 tracking-wider uppercase">
              Sales & Ordering
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("pos")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "pos"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calculator className={`w-4 h-4 ${activeView === "pos" ? "text-amber-200" : "text-amber-400"}`} />
                  <span>POS Billing Terminal</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick("storefront")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "storefront"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className={`w-4 h-4 ${activeView === "storefront" ? "text-amber-200" : "text-amber-400"}`} />
                  <span>Customer Online Store</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick("tables")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "tables"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Grid className={`w-4 h-4 ${activeView === "tables" ? "text-amber-200" : "text-amber-400"}`} />
                  <span>Dine-In Tables (1-15)</span>
                </div>
                {occupiedTables > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                    {occupiedTables}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Aggregator Channels */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-amber-300/50 tracking-wider uppercase">
              Online Delivery Channels
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("swiggy")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "swiggy"
                    ? "bg-[#fc8019] text-white font-bold shadow-md shadow-[#fc8019]/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bike className={`w-4 h-4 ${activeView === "swiggy" ? "text-white" : "text-[#fc8019]"}`} />
                  <span>Swiggy Orders</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick("zomato")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "zomato"
                    ? "bg-[#e23744] text-white font-bold shadow-md shadow-[#e23744]/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className={`w-4 h-4 ${activeView === "zomato" ? "text-white" : "text-[#e23744]"}`} />
                  <span>Zomato Orders</span>
                </div>
              </button>
            </div>
          </div>

          {/* GPS Tracking & Fleet */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-amber-300/50 tracking-wider uppercase">
              GPS Delivery & Fleet
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("delivery-partner")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "delivery-partner"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Navigation className={`w-4 h-4 ${activeView === "delivery-partner" ? "text-white" : "text-emerald-400"}`} />
                  <span>Delivery Partner GPS</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  LIVE
                </span>
              </button>

              <button
                onClick={() => handleNavClick("tracking")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "tracking"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={`w-4 h-4 ${activeView === "tracking" ? "text-amber-200" : "text-amber-400"}`} />
                  <span>Customer Live Tracking</span>
                </div>
                {activeDeliveries > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                    {activeDeliveries}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick("fleet")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "fleet"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${activeView === "fleet" ? "text-amber-200" : "text-amber-400"}`} />
                  <span>Fleet & Riders</span>
                </div>
              </button>
            </div>
          </div>

          {/* Kitchen & Inventory Operations */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-amber-300/50 tracking-wider uppercase">
              Kitchen & Operations
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("kds")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "kds"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Coffee className={`w-4 h-4 ${activeView === "kds" ? "text-amber-200" : "text-amber-400"}`} />
                  <span>Kitchen Display (KDS)</span>
                </div>
                {pendingKitchenOrders > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                    {pendingKitchenOrders}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick("inventory")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "inventory"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className={`w-4 h-4 ${activeView === "inventory" ? "text-amber-200" : "text-amber-400"}`} />
                  <span>Inventory & Recipes</span>
                </div>
                {lowStockCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                    {lowStockCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick("crm")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "crm"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <HeartHandshake className={`w-4 h-4 ${activeView === "crm" ? "text-amber-200" : "text-amber-400"}`} />
                <span>Customer CRM</span>
              </button>
            </div>
          </div>

          {/* Administration & Database */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold text-amber-300/50 tracking-wider uppercase">
              Management & Database
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick("analytics")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "analytics"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <BarChart3 className={`w-4 h-4 ${activeView === "analytics" ? "text-amber-200" : "text-amber-400"}`} />
                <span>Reports & Analytics</span>
              </button>

              <button
                onClick={() => handleNavClick("menu-admin")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "menu-admin"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <BookOpen className={`w-4 h-4 ${activeView === "menu-admin" ? "text-amber-200" : "text-amber-400"}`} />
                <span>Menu Master Catalog</span>
              </button>

              <button
                onClick={() => handleNavClick("database")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === "database"
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md shadow-amber-900/30"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Database className={`w-4 h-4 ${activeView === "database" ? "text-amber-200" : "text-amber-400"}`} />
                  <span>Supabase & Cloud Sync</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300">
                  SQL
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* Commercial Footer */}
        <div className="p-3 bg-black/40 border-t border-amber-500/10 text-[11px] text-amber-200/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-emerald-400">
              <CircleDot className="w-3 h-3 fill-emerald-400 animate-pulse" />
              <span>POS Core Online</span>
            </div>
            <span className="text-[10px] text-amber-400/80 font-mono font-bold">Shru's OS v3.5</span>
          </div>
        </div>
      </aside>
    </>
  );
};
