import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { DeliveryPartner } from "../../types";
import {
  Users2,
  Plus,
  Phone,
  Bike,
  CheckCircle2,
  Clock,
  Star,
  MapPin,
  X
} from "lucide-react";

export const FleetView: React.FC = () => {
  const { partners, updatePartnerStatus, addDeliveryPartner, orders } = useRestaurant();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<"Motorbike" | "Electric Scooter" | "Bicycle">("Motorbike");
  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const [avatar, setAvatar] = useState<string>(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !vehicleNumber) return;
    addDeliveryPartner({
      name,
      phone,
      vehicleType,
      vehicleNumber,
      avatar
    });
    setName("");
    setPhone("");
    setVehicleNumber("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-w-0 p-4 sm:p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Users2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Delivery Partner Fleet Operations
            </h3>
            <p className="text-xs text-stone-500">
              Manage in-house and partner riders, vehicle telemetry, active dispatch and availability
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Enroll New Delivery Partner</span>
        </button>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {partners.map((partner) => {
          const currentOrder = orders.find((o) => o.id === partner.assignedOrderId);

          const statusColors: Record<DeliveryPartner["status"], string> = {
            Available: "bg-emerald-100 text-emerald-800 border-emerald-300",
            Assigned: "bg-amber-100 text-amber-800 border-amber-300",
            "Picking Up": "bg-blue-100 text-blue-800 border-blue-300",
            Delivering: "bg-purple-100 text-purple-800 border-purple-300",
            Offline: "bg-stone-100 text-stone-600 border-stone-300"
          };

          return (
            <div
              key={partner.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
            >
              {/* Partner Profile Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-13 h-13 rounded-2xl object-cover border border-stone-200 shadow-xs"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{partner.name}</h4>
                    <p className="text-xs text-stone-500 font-mono">{partner.phone}</p>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{partner.rating}</span>
                      <span className="text-stone-400 font-normal">
                        ({partner.completedDeliveries} completed)
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    statusColors[partner.status]
                  }`}
                >
                  {partner.status}
                </span>
              </div>

              {/* Vehicle & Assignment Meta */}
              <div className="p-3 bg-stone-50 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-stone-700">
                  <span className="flex items-center gap-1.5 text-stone-500">
                    <Bike className="w-3.5 h-3.5" />
                    <span>Vehicle:</span>
                  </span>
                  <span className="font-semibold text-stone-900 font-mono">
                    {partner.vehicleType} • {partner.vehicleNumber}
                  </span>
                </div>

                {currentOrder ? (
                  <div className="pt-2 border-t border-stone-200/80 flex justify-between items-center text-[11px]">
                    <span className="text-amber-800 font-bold">Assigned Order:</span>
                    <span className="font-mono font-bold text-stone-900">
                      #{currentOrder.id} ({currentOrder.platform})
                    </span>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-stone-200/80 text-[11px] text-stone-400 italic">
                    Ready for next delivery assignment
                  </div>
                )}
              </div>

              {/* Status Selector Bar */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-100">
                <label className="text-[11px] font-bold text-stone-600">Status:</label>
                <select
                  value={partner.status}
                  onChange={(e) =>
                    updatePartnerStatus(partner.id, e.target.value as DeliveryPartner["status"])
                  }
                  className="text-xs bg-stone-100 border border-stone-300 rounded-lg px-2.5 py-1 font-semibold text-stone-800 focus:outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Picking Up">Picking Up</option>
                  <option value="Delivering">Delivering</option>
                  <option value="Offline">Offline</option>
                </select>

                <a
                  href={`tel:${partner.phone}`}
                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  title="Call partner"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enroll Partner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900">
                Enroll New Delivery Partner
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-stone-100 text-stone-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sunil Patil"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mobile Phone (+91)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98220 12345"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) =>
                      setVehicleType(e.target.value as "Motorbike" | "Electric Scooter" | "Bicycle")
                    }
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                  >
                    <option value="Motorbike">Motorbike</option>
                    <option value="Electric Scooter">Electric Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="MH 12 XY 9999"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg uppercase focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-sm"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
