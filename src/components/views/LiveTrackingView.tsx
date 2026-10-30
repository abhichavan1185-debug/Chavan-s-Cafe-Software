import React, { useState, useEffect, useRef } from "react";
import { useRestaurant, DELIVERY_STAGES } from "../../context/RestaurantContext";
import {
  MapPin,
  Bike,
  Navigation,
  Clock,
  Phone,
  Search,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Compass,
  Radio,
  Sparkles,
  ExternalLink,
  Ban,
  Star,
  ThumbsUp
} from "lucide-react";
import L from "leaflet";

export const LiveTrackingView: React.FC = () => {
  const {
    orders,
    partners,
    settings,
    activeTrackOrderId,
    setActiveTrackOrderId,
    advanceDeliveryStage,
    updateOrderStatus,
    activeLocationUpdate,
    showToast,
    openCancelModal,
    openFeedbackModal
  } = useRestaurant();

  const [searchIdInput, setSearchIdInput] = useState<string>("");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [demoProgress, setDemoProgress] = useState<number>(0.4);

  // Find active order or default to first delivery order
  const activeOrder =
    orders.find((o) => o.id === activeTrackOrderId) ||
    orders.find((o) => o.orderType === "Home Delivery" && o.status !== "Delivered") ||
    orders[0];

  const assignedPartner = partners.find((p) => p.id === activeOrder?.deliveryPartnerId);

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const bikeMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const cafeCoords: [number, number] = [
    settings.latitude || 18.5196,
    settings.longitude || 73.8415
  ];
  const destCoords: [number, number] = activeOrder?.deliveryCoords
    ? [activeOrder.deliveryCoords.lat, activeOrder.deliveryCoords.lng]
    : [18.5362, 73.8942];

  // Leaflet map setup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(cafeCoords, 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(map);

      // Custom Cafe Icon
      const cafeIcon = L.divIcon({
        className: "custom-cafe-icon",
        html: `
          <div style="background-color: #451a03; border: 2.5px solid #f59e0b; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: white; font-size: 16px;">
            ☕
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      // Customer Destination Icon
      const destIcon = L.divIcon({
        className: "custom-dest-icon",
        html: `
          <div style="background-color: #dc2626; border: 2.5px solid white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: white; font-size: 16px;">
            📍
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      // Animated Bike Marker Icon
      const bikeIcon = L.divIcon({
        className: "custom-bike-icon",
        html: `
          <div style="background-color: #059669; border: 2.5px solid white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(5,150,105,0.4); color: white; font-size: 18px;">
            🛵
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      L.marker(cafeCoords, { icon: cafeIcon })
        .addTo(map)
        .bindPopup(`<b>${settings.name}</b><br>Pickup Hub (Kitchen)`);

      L.marker(destCoords, { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>${activeOrder?.customerName || "Customer"}</b><br>${activeOrder?.deliveryAddress || "Pune"}`);

      const bikeMarker = L.marker(cafeCoords, { icon: bikeIcon }).addTo(map);
      bikeMarkerRef.current = bikeMarker;

      const polyline = L.polyline([cafeCoords, destCoords], {
        color: "#d97706",
        weight: 4,
        dashArray: "6, 8",
        opacity: 0.85
      }).addTo(map);
      polylineRef.current = polyline;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTrackOrderId]);

  // Update bike position on map
  useEffect(() => {
    if (!bikeMarkerRef.current || !mapInstanceRef.current) return;

    if (activeLocationUpdate && activeLocationUpdate.partnerId === activeOrder?.deliveryPartnerId) {
      const pos: [number, number] = [activeLocationUpdate.latitude, activeLocationUpdate.longitude];
      bikeMarkerRef.current.setLatLng(pos);
      mapInstanceRef.current.panTo(pos, { animate: true });
    } else {
      // Use progress ratio along line
      const lat = cafeCoords[0] + (destCoords[0] - cafeCoords[0]) * demoProgress;
      const lng = cafeCoords[1] + (destCoords[1] - cafeCoords[1]) * demoProgress;
      bikeMarkerRef.current.setLatLng([lat, lng]);
    }
  }, [activeLocationUpdate, demoProgress, activeOrder]);

  // Demo progress simulation loop
  useEffect(() => {
    if (!isDemoMode || !activeOrder || activeOrder.status === "Delivered") return;
    const interval = setInterval(() => {
      setDemoProgress((prev) => {
        if (prev >= 0.95) return 0.15;
        return +(prev + 0.03).toFixed(2);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isDemoMode, activeOrder]);

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === searchIdInput.trim().toLowerCase() ||
        o.customerPhone.includes(searchIdInput.trim())
    );
    if (found) {
      setActiveTrackOrderId(found.id);
      showToast(`Tracking order #${found.id}`);
    } else {
      showToast("Order ID not found");
    }
  };

  const currentStageIndex = DELIVERY_STAGES.indexOf(activeOrder?.deliveryStage || "Order Placed");

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row h-full overflow-hidden bg-stone-100 font-sans">
      {/* Left Sidebar: Order Journey & Status */}
      <div className="w-full h-1/2 lg:h-full lg:w-[420px] min-h-0 bg-white border-r border-stone-200 flex flex-col overflow-y-auto shrink-0 shadow-sm">
        {/* Search Header */}
        <div className="p-4 border-b border-stone-200 bg-stone-900 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              Live Order & GPS Tracking Hub
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              {orders.filter((o) => o.orderType === "Home Delivery" && o.status !== "Delivered").length} Active Deliveries
            </span>
          </div>

          <form onSubmit={handleSearchOrder} className="relative">
            <input
              type="text"
              placeholder="Search by Order ID (e.g. SW-8421, POS-1001)..."
              value={searchIdInput}
              onChange={(e) => setSearchIdInput(e.target.value)}
              className="w-full bg-stone-800 text-white text-xs pl-8 pr-16 py-2.5 rounded-xl border border-stone-700 focus:outline-none focus:border-amber-500 placeholder-stone-500"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg transition-colors"
            >
              Track
            </button>
          </form>
        </div>

        {/* Active Order Details Card */}
        {activeOrder ? (
          <div className="p-4 border-b border-stone-200 bg-amber-50/40">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-stone-900 text-base">
                    #{activeOrder.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      activeOrder.platform === "Swiggy"
                        ? "bg-[#fc8019]/20 text-[#fc8019]"
                        : activeOrder.platform === "Zomato"
                        ? "bg-[#e23744]/20 text-[#e23744]"
                        : activeOrder.platform === "Customer-Online"
                        ? "bg-amber-800/10 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {activeOrder.platform}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5 font-medium">
                  Invoice: {activeOrder.invoiceNumber || `SHRU-INV-${activeOrder.id}`}
                </p>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-stone-900 block">
                  ₹{activeOrder.grandTotal}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">
                  {activeOrder.paymentMethod} • {activeOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="p-3 bg-white rounded-xl border border-stone-200 mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Customer</span>
                  <p className="font-bold text-stone-800">{activeOrder.customerName}</p>
                  <p className="text-stone-500 text-[11px]">{activeOrder.customerPhone}</p>
                </div>
                <a
                  href={`tel:${activeOrder.customerPhone}`}
                  className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Delivery Address</span>
                <p className="text-stone-700 text-xs mt-0.5 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span>{activeOrder.deliveryAddress || "Pune City Center"}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                <span>Estimated Arrival:</span>
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-700" />
                  {activeOrder.estimatedDeliveryTime || "15-20 mins"}
                </span>
              </div>
            </div>

            {/* Assigned Partner Bar */}
            {assignedPartner ? (
              <div className="mt-3 p-3 bg-stone-900 text-white rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <img
                    src={assignedPartner.avatar}
                    alt={assignedPartner.name}
                    className="w-9 h-9 rounded-full object-cover border border-amber-400"
                  />
                  <div>
                    <p className="font-bold text-xs text-stone-100">{assignedPartner.name}</p>
                    <p className="text-[10px] text-amber-400 font-mono">
                      {assignedPartner.vehicleType} • {assignedPartner.vehicleNumber}
                    </p>
                  </div>
                </div>
                <a
                  href={`tel:${assignedPartner.phone}`}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="mt-3 p-2.5 bg-amber-100/60 text-amber-900 rounded-xl text-xs flex items-center justify-between">
                <span>No rider assigned yet</span>
                <button
                  onClick={() => advanceDeliveryStage(activeOrder.id)}
                  className="text-[10px] font-bold text-white bg-amber-800 hover:bg-amber-900 px-2 py-1 rounded"
                >
                  Assign Next Available Rider
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-stone-400">
            <p>No active delivery order selected.</p>
          </div>
        )}

        {/* 10-Stage Delivery Journey Breadcrumb */}
        {activeOrder && (
          <div className="p-4 flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center justify-between">
              <span>Order Fulfillment Journey</span>
              <span className="text-[10px] text-stone-400 font-mono">Stage {currentStageIndex + 1} of 10</span>
            </h4>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {DELIVERY_STAGES.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stage} className="relative flex items-start gap-2.5">
                    <span
                      className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                        isCurrent
                          ? "bg-amber-600 border-amber-600 text-white ring-4 ring-amber-100"
                          : isPassed
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white border-stone-300 text-stone-400"
                      }`}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </span>
                    <div className="flex-1">
                      <p
                        className={`text-xs ${
                          isCurrent
                            ? "font-bold text-amber-900"
                            : isPassed
                            ? "font-semibold text-stone-800"
                            : "text-stone-400"
                        }`}
                      >
                        {stage}
                      </p>
                      {isCurrent && (
                        <p className="text-[10px] text-amber-700 mt-0.5">
                          In progress • Live updates streaming
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Status Action Panel */}
            <div className="mt-5 pt-4 border-t border-stone-200 space-y-2.5">
              {activeOrder.status === "Cancelled" ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1.5 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    <Ban className="w-3.5 h-3.5" />
                    <span>Order Cancelled</span>
                  </div>
                  <p className="text-xs font-semibold text-red-950">
                    Reason: {activeOrder.cancelReason || "Cancelled by staff/customer"}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    Tables and riders have been restored to available.
                  </p>
                </div>
              ) : activeOrder.status === "Delivered" ? (
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-emerald-950">Delivered Successfully!</p>
                        <p className="text-[10px] text-emerald-700">Food reached customer hot & fresh</p>
                      </div>
                    </div>
                    {activeOrder.feedbackSubmitted && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold">
                        <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span>{activeOrder.rating}/5</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openFeedbackModal(activeOrder)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{activeOrder.feedbackSubmitted ? "Edit Customer Feedback" : "Rate Food & Submit Feedback"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => advanceDeliveryStage(activeOrder.id)}
                    className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Advance to Next Stage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openCancelModal(activeOrder)}
                    className="w-full py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Ban className="w-3.5 h-3.5 text-red-600" />
                    <span>Cancel This Order</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Leaflet Map Viewport */}
      <div className="flex-1 min-h-0 min-w-0 relative flex flex-col lg:h-full bg-stone-200">
        {/* Map Header Floating Overlay */}
        <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-stone-200/80 pointer-events-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-stone-800">
                {settings.name} Live Map
              </span>
            </div>
            <span className="text-stone-300">|</span>
            <span className="text-xs text-stone-600">
              OpenStreetMap Real-Time Delivery Tracking
            </span>
          </div>

          <div className="bg-stone-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-stone-800 pointer-events-auto text-xs flex items-center gap-2">
            <Bike className="w-3.5 h-3.5 text-amber-400" />
            <span>Rider: {assignedPartner?.name || "Rider Assigned"}</span>
          </div>
        </div>

        {/* Map View */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Bottom Mode Switch & Stats */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-800 font-bold">
              <Compass className="w-5 h-5 text-amber-700 animate-spin-slow" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">
                Origin: {settings.name} (FC Road) → Dest: {activeOrder?.deliveryAddress || "Pune"}
              </p>
              <p className="text-[11px] text-stone-500">
                {isDemoMode ? "Demo Simulation Mode: coordinates interpolating along active road route" : "Live GPS Mode"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsDemoMode(!isDemoMode);
                showToast(isDemoMode ? "Switched to Standby Mode" : "Switched to Demo Simulation Mode");
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isDemoMode ? "Simulation Active" : "Enable Simulation"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
