/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { RestaurantProvider, useRestaurant } from "./context/RestaurantContext";
import { AuthGate } from "./components/AuthGate";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { PosView } from "./components/views/PosView";
import { CustomerStoreView } from "./components/views/CustomerStoreView";
import { SwiggyView } from "./components/views/SwiggyView";
import { ZomatoView } from "./components/views/ZomatoView";
import { LiveTrackingView } from "./components/views/LiveTrackingView";
import { FleetView } from "./components/views/FleetView";
import { KdsView } from "./components/views/KdsView";
import { TablesView } from "./components/views/TablesView";
import { AnalyticsView } from "./components/views/AnalyticsView";
import { InventoryView } from "./components/views/InventoryView";
import { CustomerCrmView } from "./components/views/CustomerCrmView";
import { MenuAdminView } from "./components/views/MenuAdminView";
import { DatabaseView } from "./components/views/DatabaseView";
import { DeliveryPartnerView } from "./components/views/DeliveryPartnerView";
import { ThermalReceiptModal } from "./components/ThermalReceiptModal";
import { OrderCancelModal } from "./components/OrderCancelModal";
import { FeedbackModal } from "./components/FeedbackModal";
import {
  Bell,
  Calculator,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  MapPin,
  Menu
} from "lucide-react";
import { LoaderCircle } from "lucide-react";

function MainApp() {
  const {
    activeView,
    setActiveView,
    notificationToast,
    setIsMobileMenuOpen,
    dataLoading
  } = useRestaurant();

  if (dataLoading) {
    return (
      <div className="flex h-screen items-center justify-center gap-3 bg-stone-100 text-sm font-semibold text-stone-700">
        <LoaderCircle className="h-5 w-5 animate-spin text-amber-800" />
        Loading cafe data...
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "pos":
        return <PosView />;
      case "storefront":
        return <CustomerStoreView />;
      case "swiggy":
        return <SwiggyView />;
      case "zomato":
        return <ZomatoView />;
      case "tracking":
        return <LiveTrackingView />;
      case "fleet":
        return <FleetView />;
      case "kds":
        return <KdsView />;
      case "tables":
        return <TablesView />;
      case "analytics":
        return <AnalyticsView />;
      case "inventory":
        return <InventoryView />;
      case "crm":
        return <CustomerCrmView />;
      case "menu-admin":
        return <MenuAdminView />;
      case "delivery-partner":
        return <DeliveryPartnerView />;
      case "database":
        return <DatabaseView />;
      default:
        return <PosView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-100 font-sans antialiased text-stone-900 select-none">
      {/* Enterprise Commercial Sidebar (Responsive Drawer on Mobile) */}
      <Sidebar />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Real-time Top Navigation */}
        <TopNav />

        {/* Dynamic View Panel */}
        <main className="flex-1 overflow-hidden relative flex flex-col min-h-0">
          {renderActiveView()}
        </main>

        {/* Mobile Bottom Quick Navigation Bar (< lg screens) */}
        <nav className="lg:hidden h-14 bg-white border-t border-stone-200 flex items-center justify-around px-1 z-30 shadow-lg shrink-0">
          <button
            onClick={() => setActiveView("pos")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold transition-colors ${
              activeView === "pos" ? "text-amber-800" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Calculator className={`w-4 h-4 mb-0.5 ${activeView === "pos" ? "text-amber-800" : "text-stone-400"}`} />
            <span>POS</span>
          </button>

          <button
            onClick={() => setActiveView("storefront")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold transition-colors ${
              activeView === "storefront" ? "text-amber-800" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <ShoppingBag className={`w-4 h-4 mb-0.5 ${activeView === "storefront" ? "text-amber-800" : "text-stone-400"}`} />
            <span>Store</span>
          </button>

          <button
            onClick={() => setActiveView("swiggy")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold transition-colors ${
              activeView === "swiggy" ? "text-[#fc8019]" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Bike className={`w-4 h-4 mb-0.5 ${activeView === "swiggy" ? "text-[#fc8019]" : "text-stone-400"}`} />
            <span>Swiggy</span>
          </button>

          <button
            onClick={() => setActiveView("zomato")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold transition-colors ${
              activeView === "zomato" ? "text-[#e23744]" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <UtensilsCrossed className={`w-4 h-4 mb-0.5 ${activeView === "zomato" ? "text-[#e23744]" : "text-stone-400"}`} />
            <span>Zomato</span>
          </button>

          <button
            onClick={() => setActiveView("tracking")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold transition-colors ${
              activeView === "tracking" ? "text-amber-800" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <MapPin className={`w-4 h-4 mb-0.5 ${activeView === "tracking" ? "text-amber-800" : "text-stone-400"}`} />
            <span>Track</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold text-stone-500 hover:text-stone-800 transition-colors"
          >
            <Menu className="w-4 h-4 mb-0.5 text-stone-500" />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* 80mm Printable Tax Invoice Modal */}
      <ThermalReceiptModal />

      {/* Order Cancellation Modal */}
      <OrderCancelModal />

      {/* Customer Feedback & Rating Modal */}
      <FeedbackModal />

      {/* Global Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-16 lg:bottom-6 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-stone-950 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-stone-800 flex items-center gap-2.5 text-xs font-semibold">
            <span className="p-1 rounded-full bg-amber-500/20 text-amber-400">
              <Bell className="w-3.5 h-3.5" />
            </span>
            <span>{notificationToast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      {(staff) => (
        <RestaurantProvider userEmail={staff.email} onSignOut={staff.signOut}>
          <MainApp />
        </RestaurantProvider>
      )}
    </AuthGate>
  );
}
