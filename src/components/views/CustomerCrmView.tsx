import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { Contact2, Phone, Mail, Award, Clock, Star, MessageSquareQuote, CheckCircle2, Heart, ThumbsUp } from "lucide-react";

export const CustomerCrmView: React.FC = () => {
  const { customers, feedbacks } = useRestaurant();
  const [activeTab, setActiveTab] = useState<"customers" | "reviews">("customers");

  const tierColors: Record<string, string> = {
    Regular: "bg-stone-100 text-stone-700 border-stone-200",
    Silver: "bg-slate-100 text-slate-800 border-slate-300",
    "Gold VIP": "bg-amber-100 text-amber-900 border-amber-300 font-bold",
    "Platinum Elite": "bg-purple-100 text-purple-900 border-purple-300 font-black"
  };

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : "5.0";

  return (
    <div className="min-w-0 p-4 sm:p-6 bg-stone-100 flex-1 overflow-y-auto space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Contact2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Customer CRM & Cafe Feedback Hub
            </h3>
            <p className="text-xs text-stone-500">
              Diner profiles, repeat visit metrics, customer reviews and star ratings
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-bold border border-stone-200 shrink-0">
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "customers"
                ? "bg-amber-900 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Customer Profiles ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "reviews"
                ? "bg-amber-900 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Ratings & Reviews ({feedbacks.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "customers" ? (
        /* Customers Table */
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Customer Profile</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Delivery Zone</th>
                  <th className="px-5 py-3">Orders</th>
                  <th className="px-5 py-3">Total Spend</th>
                  <th className="px-5 py-3">Loyalty Tier</th>
                  <th className="px-5 py-3">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-stone-900">{c.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">ID: {c.id}</div>
                    </td>
                    <td className="px-5 py-3.5 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-stone-600 font-mono">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{c.phone}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">{c.address || "Pune Central"}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-stone-900">{c.totalOrders}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-amber-950">
                      ₹{c.totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${
                          tierColors[c.tier] || "bg-stone-100 text-stone-700"
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        <span>{c.tier}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{c.lastOrderedAt}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Reviews & Ratings Section */
        <div className="space-y-6">
          {/* Rating KPI Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex flex-col items-center justify-center font-black">
                <span className="text-xl font-bold">{avgRating}</span>
                <span className="text-[10px]">★ ★ ★ ★ ★</span>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase">Average Cafe Rating</p>
                <p className="text-sm font-bold text-stone-900 mt-0.5">Based on verified orders</p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">98% positive reviews</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                <ThumbsUp className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase">Total Feedbacks Logged</p>
                <p className="text-xl font-mono font-bold text-stone-900 mt-0.5">{feedbacks.length} Reviews</p>
                <p className="text-[11px] text-stone-500">Recorded across In-Store & Delivery</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                <Heart className="w-7 h-7 fill-amber-700 text-amber-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase">Top Commended</p>
                <p className="text-sm font-bold text-stone-900 mt-0.5">Signature Coffee & Fast Delivery</p>
                <p className="text-[11px] text-stone-500">Most highlighted customer tags</p>
              </div>
            </div>
          </div>

          {/* Feedback Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-400 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">{fb.customerName}</h4>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                        Order #{fb.orderId} • {fb.customerPhone}
                      </p>
                    </div>

                    <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-700">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-bold font-mono">{fb.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 italic mt-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
                    "{fb.comment}"
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="flex flex-wrap gap-1">
                    {fb.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] text-stone-400 flex items-center justify-between pt-1">
                    <span>Verified Buyer Review</span>
                    <span>{fb.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
