import React, { useState, useEffect } from "react";
import { useRestaurant } from "../context/RestaurantContext";
import { UserRole } from "../types";
import {
  Volume2,
  VolumeX,
  PlusCircle,
  Clock,
  TrendingUp,
  Receipt,
  Store,
  Menu,
  Shield,
  Radio,
  UserCheck,
  ChevronDown
} from "lucide-react";

export const TopNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    orders,
    tables,
    soundEnabled,
    setSoundEnabled,
    simulateIncomingOrder,
    setIsMobileMenuOpen,
    settings,
    currentRole,
    currentUser,
    switchRole,
    staffList,
    supabaseConnected
  } = useRestaurant();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalGrossSales = orders.reduce(
    (sum, o) => sum + (o.status !== "Cancelled" ? o.grandTotal : 0),
    0
  );
  const totalOrdersCount = orders.length;
  const occupiedTables = tables.filter((t) => t.status !== "available").length;

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    pos: {
      title: "POS Billing Terminal",
      subtitle: "Fast food selection, 23 categories, UPI/Card/Cash & thermal billing"
    },
    storefront: {
      title: "Customer Online Menu",
      subtitle: "Customer-facing web menu, instant cart, and live tracking"
    },
    swiggy: {
      title: "Swiggy Order Management",
      subtitle: "Live Swiggy partner dashboard • Commissions & dispatch"
    },
    zomato: {
      title: "Zomato Order Management",
      subtitle: "Live Zomato order management • Valet tracking & settlements"
    },
    tracking: {
      title: "Customer Order Tracking",
      subtitle: "10-stage delivery lifecycle with OpenStreetMap & moving bike"
    },
    "delivery-partner": {
      title: "Delivery Partner GPS Portal",
      subtitle: "Live device GPS broadcasting, assignments, and Leaflet routing"
    },
    fleet: {
      title: "Fleet Dispatch & Riders",
      subtitle: "Rider dispatch, vehicle assignments, and availability"
    },
    kds: {
      title: "Kitchen Display (KDS)",
      subtitle: "Real-time kitchen order tickets and preparation timers"
    },
    tables: {
      title: "Table Service (1-15)",
      subtitle: "Real-time dine-in table occupancy and running bills"
    },
    analytics: {
      title: "Reports & Analytics",
      subtitle: "Gross sales, category reports, GST summary, and PDF exports"
    },
    inventory: {
      title: "Inventory & Recipe Management",
      subtitle: "Raw material stock, recipe ingredient deductions & suppliers"
    },
    crm: {
      title: "Customer CRM",
      subtitle: "Customer profiles, repeat visits and loyalty tiers"
    },
    "menu-admin": {
      title: "Food Menu Master Catalog",
      subtitle: "Add, edit, and update products with accurate food photography"
    },
    database: {
      title: "Supabase & Data Storage",
      subtitle: "Permanent PostgreSQL storage and live GPS tracking integration"
    }
  };

  const currentMeta = viewTitles[activeView] || {
    title: `${settings.name}`,
    subtitle: "Enterprise Restaurant POS & Delivery Suite"
  };

  const roles: UserRole[] = ["ADMIN", "MANAGER", "CASHIER", "KITCHEN STAFF"];

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-3 sm:px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-xs">
      {/* Left: Mobile Hamburger & Page Titles */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center justify-center shrink-0"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-amber-900" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-stone-900 leading-tight truncate">
            {currentMeta.title}
          </h1>
          <p className="text-[10px] sm:text-xs text-stone-500 font-medium truncate hidden xs:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Live Metrics Bar */}
      <div className="hidden xl:flex items-center gap-6 bg-stone-100/80 px-4 py-1.5 rounded-full border border-stone-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-700" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500">Gross Sales</span>
            <span className="text-xs font-mono font-bold text-amber-900">
              ₹{totalGrossSales.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-stone-300" />

        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-700" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500">Today's Orders</span>
            <span className="text-xs font-mono font-bold text-stone-800">{totalOrdersCount}</span>
          </div>
        </div>

        <div className="h-4 w-px bg-stone-300" />

        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-600" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500">Dine-In Tables</span>
            <span className="text-xs font-mono font-bold text-stone-800">{occupiedTables} / 15 Occupied</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Role Switcher & Utilities */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-900/10 hover:bg-amber-900/20 text-amber-950 border border-amber-900/20 text-xs font-bold transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-amber-800" />
            <span className="hidden sm:inline">{currentRole}</span>
            <span className="text-[10px] text-amber-700 font-normal">({currentUser.name.split(" ")[0]})</span>
            <ChevronDown className="w-3 h-3 text-stone-500" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-stone-100">
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                  Switch Active Role
                </span>
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-amber-50 transition-colors ${
                    currentRole === r ? "bg-amber-100/70 text-amber-900 font-bold" : "text-stone-700"
                  }`}
                >
                  <span>{r}</span>
                  {currentRole === r && <span className="text-[10px] text-amber-700 font-mono">ACTIVE</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Supabase Cloud Indicator */}
        <button
          onClick={() => setActiveView("database")}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            supabaseConnected
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              : "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200"
          }`}
          title="Supabase PostgreSQL & Realtime Storage Status"
        >
          <span className={`w-2 h-2 rounded-full ${supabaseConnected ? "bg-emerald-500 animate-pulse" : "bg-stone-400"}`} />
          <span className="text-[11px] font-mono">{supabaseConnected ? "Supabase Live" : "Local Database"}</span>
        </button>

        {/* Live Digital Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-mono font-medium">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span>{currentTime}</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl transition-all ${
            soundEnabled
              ? "bg-amber-100/60 text-amber-900 hover:bg-amber-100"
              : "bg-stone-100 text-stone-400 hover:bg-stone-200"
          }`}
          title={soundEnabled ? "Audio Chimes Enabled" : "Audio Muted"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Simulate Order Button */}
        <button
          onClick={() => simulateIncomingOrder()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold shadow-sm transition-all active:scale-95"
          title="Generate test incoming multi-channel order"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Test Order</span>
        </button>
      </div>
    </header>
  );
};
