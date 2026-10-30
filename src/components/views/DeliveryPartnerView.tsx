import React, { useState, useEffect, useRef } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import {
  Bike,
  MapPin,
  Navigation,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Compass,
  Radio,
  Clock,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Award,
  ChevronRight
} from "lucide-react";
import L from "leaflet";

export const DeliveryPartnerView: React.FC = () => {
  const {
    partners,
    orders,
    settings,
    updateOrderStatus,
    advanceDeliveryStage,
    startRealGpsTracking,
    stopRealGpsTracking,
    isRealGpsTrackingActive,
    gpsTrackingError,
    activeLocationUpdate,
    showToast,
    supabaseConnected
  } = useRestaurant();

  // Selected delivery partner profile (defaults to Ramesh Shinde)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("DP-101");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(0.1);

  const activePartner =
    partners.find((p) => p.id === selectedPartnerId) || partners[0];

  // Assigned delivery for this partner
  const assignedOrder = orders.find(
    (o) =>
      o.deliveryPartnerId === activePartner?.id &&
      o.status !== "Delivered" &&
      o.status !== "Cancelled"
  );

  // Delivery history
  const completedOrders = orders.filter(
    (o) => o.deliveryPartnerId === activePartner?.id && o.status === "Delivered"
  );

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const bikeMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Default coordinates (Pune FC Road Cafe)
  const cafeCoords: [number, number] = [
    settings.latitude || 18.5196,
    settings.longitude || 73.8415
  ];
  const destCoords: [number, number] = assignedOrder?.deliveryCoords
    ? [assignedOrder.deliveryCoords.lat, assignedOrder.deliveryCoords.lng]
    : [18.5362, 73.8942];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(cafeCoords, 14);

      // OpenStreetMap high-definition tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(map);

      // Custom Cafe Icon
      const cafeIcon = L.divIcon({
        className: "custom-cafe-icon",
        html: `
          <div style="background-color: #451a03; border: 2px solid #f59e0b; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: white;">
            ☕
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      // Customer Destination Icon
      const destIcon = L.divIcon({
        className: "custom-dest-icon",
        html: `
          <div style="background-color: #dc2626; border: 2px solid white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: white;">
            📍
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      // Bike Marker Icon
      const bikeIcon = L.divIcon({
        className: "custom-bike-icon",
        html: `
          <div style="background-color: #059669; border: 2.5px solid #ffffff; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(5,150,105,0.4); color: white; font-size: 16px;">
            🛵
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      // Add Markers
      L.marker(cafeCoords, { icon: cafeIcon })
        .addTo(map)
        .bindPopup(`<b>${settings.name}</b><br>Pickup Hub (Kitchen)`);

      L.marker(destCoords, { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>Customer Location</b><br>${assignedOrder?.customerName || "Destination"}`);

      const bikeMarker = L.marker(cafeCoords, { icon: bikeIcon }).addTo(map);
      bikeMarkerRef.current = bikeMarker;

      // Add Route Polyline
      const polyline = L.polyline([cafeCoords, destCoords], {
        color: "#d97706",
        weight: 4,
        dashArray: "6, 8",
        opacity: 0.8
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
  }, [selectedPartnerId]);

  // Update bike marker when live GPS coordinate or simulated progress changes
  useEffect(() => {
    if (!bikeMarkerRef.current || !mapInstanceRef.current) return;

    if (isRealGpsTrackingActive && activeLocationUpdate) {
      const newPos: [number, number] = [
        activeLocationUpdate.latitude,
        activeLocationUpdate.longitude
      ];
      bikeMarkerRef.current.setLatLng(newPos);
      mapInstanceRef.current.panTo(newPos, { animate: true });
    } else if (isDemoMode) {
      // Interpolate along route for demo mode
      const lat = cafeCoords[0] + (destCoords[0] - cafeCoords[0]) * simulatedProgress;
      const lng = cafeCoords[1] + (destCoords[1] - cafeCoords[1]) * simulatedProgress;
      bikeMarkerRef.current.setLatLng([lat, lng]);
    }
  }, [activeLocationUpdate, simulatedProgress, isRealGpsTrackingActive, isDemoMode]);

  // Demo simulator interval
  useEffect(() => {
    if (!isDemoMode || !assignedOrder) return;
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 0.95) {
          return 0.1;
        }
        return +(prev + 0.05).toFixed(2);
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [isDemoMode, assignedOrder]);

  const handleStartTracking = async () => {
    if (isDemoMode) {
      showToast("Demo Simulation Active: moving along delivery route");
      return;
    }
    if (!activePartner) return;
    const ok = await startRealGpsTracking(activePartner.id, assignedOrder?.id);
    if (!ok) {
      setIsDemoMode(true);
      showToast("Switching to Demo Simulation due to GPS availability");
    }
  };

  const handleStopTracking = () => {
    stopRealGpsTracking();
    setIsDemoMode(false);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-stone-100 font-sans">
      {/* Left Control Panel: Partner Profile & Active Assignment */}
      <div className="w-full lg:w-96 bg-white border-r border-stone-200 flex flex-col h-full overflow-y-auto shrink-0 shadow-sm">
        {/* Partner Selector & Profile Header */}
        <div className="p-4 bg-gradient-to-r from-stone-900 to-amber-950 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 animate-pulse text-amber-400" />
              Delivery Partner Portal
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseConnected ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span className="text-[10px] text-stone-300">
                {supabaseConnected ? "Supabase Synced" : "Local Storage"}
              </span>
            </div>
          </div>

          {/* Select Partner Dropdown */}
          <div className="mb-3">
            <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
              Active Rider Profile
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full bg-stone-800 text-white text-xs rounded-lg p-2 border border-stone-700 focus:outline-none focus:border-amber-500 font-semibold"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.vehicleType} - {p.vehicleNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Partner Summary Card */}
          <div className="flex items-center gap-3 bg-stone-800/80 p-3 rounded-xl border border-stone-700/60">
            <img
              src={activePartner?.avatar}
              alt={activePartner?.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-stone-100 truncate">
                {activePartner?.name}
              </h3>
              <p className="text-[11px] text-stone-400">{activePartner?.phone}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  {activePartner?.vehicleNumber}
                </span>
                <span className="text-[10px] text-stone-300 flex items-center gap-0.5">
                  ★ {activePartner?.rating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* GPS Tracking Action Center */}
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-700" />
              Live Device GPS Hardware
            </span>
            {isRealGpsTrackingActive ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Live GPS Transmitting
              </span>
            ) : isDemoMode ? (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Demo Simulator Mode
              </span>
            ) : (
              <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded-full">
                GPS Standby
              </span>
            )}
          </div>

          {/* Mode Explainer & Notice */}
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 mb-3 text-[11px] text-amber-900 leading-snug">
            <p className="font-semibold mb-0.5">Device Permission Notice:</p>
            Real GPS tracking captures actual latitude & longitude via browser Geolocation. On desktop or indoors, you can toggle Demo Simulation for testing without moving.
          </div>

          {gpsTrackingError && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 mb-3 text-[11px] text-red-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{gpsTrackingError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {!isRealGpsTrackingActive && !isDemoMode ? (
              <>
                <button
                  onClick={handleStartTracking}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-800 to-stone-900 text-white font-bold text-xs hover:from-amber-700 hover:to-stone-800 shadow-md transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Start Device GPS
                </button>
                <button
                  onClick={() => {
                    setIsDemoMode(true);
                    showToast("Indoor Demo Simulation activated");
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-200 text-stone-800 font-bold text-xs hover:bg-stone-300 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Demo Simulate
                </button>
              </>
            ) : (
              <button
                onClick={handleStopTracking}
                className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-md transition-all active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                Stop Tracking Broadcast
              </button>
            )}
          </div>

          {/* Real GPS Sensor Readings */}
          {(isRealGpsTrackingActive && activeLocationUpdate) && (
            <div className="mt-3 p-2.5 bg-white rounded-lg border border-stone-200 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>
                <span className="text-stone-400 block">LATITUDE</span>
                <span className="font-bold text-stone-800">{activeLocationUpdate.latitude.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-stone-400 block">LONGITUDE</span>
                <span className="font-bold text-stone-800">{activeLocationUpdate.longitude.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-stone-400 block">ACCURACY</span>
                <span className="font-bold text-stone-800">±{activeLocationUpdate.accuracy ? Math.round(activeLocationUpdate.accuracy) : 10}m</span>
              </div>
              <div>
                <span className="text-stone-400 block">LAST BROADCAST</span>
                <span className="font-bold text-stone-800">
                  {new Date(activeLocationUpdate.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Assigned Delivery Card */}
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Current Delivery Assignment
            </h4>
            {assignedOrder && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                #{assignedOrder.id}
              </span>
            )}
          </div>

          {assignedOrder ? (
            <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 block uppercase">Customer</span>
                  <p className="font-bold text-sm text-stone-900">{assignedOrder.customerName}</p>
                  <p className="text-xs text-stone-500">{assignedOrder.customerPhone}</p>
                </div>
                <a
                  href={`tel:${assignedOrder.customerPhone}`}
                  className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs">
                <span className="text-[10px] font-bold text-stone-400 block mb-0.5 uppercase">Delivery Address</span>
                <p className="text-stone-700 leading-snug">{assignedOrder.deliveryAddress || "Pune City Center"}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                <span className="text-stone-500">Order Amount</span>
                <span className="font-bold text-stone-900">₹{assignedOrder.grandTotal} ({assignedOrder.paymentStatus})</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Current Stage</span>
                <span className="font-bold text-amber-700">{assignedOrder.deliveryStage}</span>
              </div>

              {/* Step Flow Buttons */}
              <div className="pt-2 border-t border-stone-100 space-y-1.5">
                {assignedOrder.deliveryStage === "Delivery Partner Assigned" && (
                  <button
                    onClick={() => advanceDeliveryStage(assignedOrder.id)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                  >
                    Confirm Arrival at Cafe
                  </button>
                )}

                {assignedOrder.deliveryStage === "Delivery Partner Arrived" && (
                  <button
                    onClick={() => advanceDeliveryStage(assignedOrder.id)}
                    className="w-full py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                  >
                    Confirm Order Picked Up
                  </button>
                )}

                {(assignedOrder.deliveryStage === "Order Picked Up" || assignedOrder.deliveryStage === "On The Way") && (
                  <button
                    onClick={() => advanceDeliveryStage(assignedOrder.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                  >
                    Mark Near Customer
                  </button>
                )}

                {assignedOrder.deliveryStage === "Near Customer" && (
                  <button
                    onClick={() => {
                      updateOrderStatus(assignedOrder.id, "Delivered");
                      stopRealGpsTracking();
                      setIsDemoMode(false);
                      showToast(`Order #${assignedOrder.id} successfully delivered!`);
                    }}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Delivery & Stop Tracking
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300 text-stone-500">
              <Bike className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-semibold">No Active Deliveries Assigned</p>
              <p className="text-[11px] text-stone-400 mt-1">
                Assign an order from POS or Delivery Hub to start tracking.
              </p>
            </div>
          )}

          {/* Past Delivery Records */}
          <div className="mt-4 pt-3 border-t border-stone-200">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center justify-between">
              <span>Completed Deliveries</span>
              <span className="text-stone-400 font-mono">{completedOrders.length} Completed</span>
            </h5>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {completedOrders.length > 0 ? (
                completedOrders.slice(0, 4).map((co) => (
                  <div key={co.id} className="p-2 bg-white rounded border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-800">#{co.id}</span>
                      <span className="text-[10px] text-stone-400 ml-1.5">{co.customerName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      ₹{co.grandTotal}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-stone-400 italic">No past delivery history yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Map Viewport */}
      <div className="flex-1 relative flex flex-col h-full bg-stone-200">
        {/* Map Top Floating Overlay */}
        <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-stone-200/80 pointer-events-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-stone-800">
                {settings.name} GPS Navigation Hub
              </span>
            </div>
            <span className="text-stone-300">|</span>
            <span className="text-xs text-stone-600">
              OpenStreetMap High-Resolution Engine
            </span>
          </div>

          <div className="bg-stone-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-stone-800 pointer-events-auto text-xs flex items-center gap-2">
            <Bike className="w-3.5 h-3.5 text-amber-400" />
            <span>Rider: {activePartner?.name}</span>
            <span className="text-amber-400 font-mono">({activePartner?.vehicleNumber})</span>
          </div>
        </div>

        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Bottom Route Stats Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-800 font-bold">
              <Compass className="w-5 h-5 text-amber-700 animate-spin-slow" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">
                {assignedOrder ? `Route to: ${assignedOrder.deliveryAddress || "Customer Destination"}` : "No Active Route"}
              </p>
              <p className="text-[11px] text-stone-500">
                {isRealGpsTrackingActive
                  ? "Real hardware GPS updating every 1000ms"
                  : isDemoMode
                  ? "Simulated delivery progress: ~15 mins remaining"
                  : "Tracking on standby"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 rounded-lg text-stone-700 border border-stone-200">
              Cafe: {cafeCoords[0].toFixed(3)}, {cafeCoords[1].toFixed(3)}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 rounded-lg text-amber-900 border border-amber-200">
              Dest: {destCoords[0].toFixed(3)}, {destCoords[1].toFixed(3)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
