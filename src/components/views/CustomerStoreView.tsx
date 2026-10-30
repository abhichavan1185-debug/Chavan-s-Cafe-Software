import React, { useState, useMemo } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { MENU_ITEMS, ALL_CATEGORIES, FALLBACK_FOOD_IMAGE, SVG_FOOD_FALLBACK } from "../../data/menuData";
import { CategoryName, MenuItem, OrderType } from "../../types";
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Clock,
  Sparkles,
  Tag,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Coffee,
  X,
  Phone,
  User,
  Ban,
  Star
} from "lucide-react";

export const CustomerStoreView: React.FC = () => {
  const {
    createOrder,
    setActiveView,
    setActiveTrackOrderId,
    tables,
    orders,
    openCancelModal,
    openFeedbackModal
  } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<CategoryName | "All">("All");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderType, setOrderType] = useState<OrderType>("Home Delivery");
  const [selectedTable, setSelectedTable] = useState<number>(1);

  // Cart & Drawer
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string>("");

  // Customer Checkout Details
  const [name, setName] = useState<string>("Tanvi Kulkarni");
  const [phone, setPhone] = useState<string>("+91 98812 77014");
  const [address, setAddress] = useState<string>("A-404, Gera Green Park, Viman Nagar, Pune");
  const [paymentMethod, setPaymentMethod] = useState<"UPI / QR" | "Cash" | "Credit Card">("UPI / QR");

  // Confirmation modal
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  // Filtered menu
  const filteredDishes = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchDiet =
        dietaryFilter === "all" ||
        (dietaryFilter === "veg" && item.isVeg) ||
        (dietaryFilter === "nonveg" && !item.isVeg);
      const matchSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchDiet && matchSearch;
    });
  }, [selectedCategory, dietaryFilter, searchQuery]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.item.id === itemId) {
            const nextQty = c.qty + delta;
            return nextQty > 0 ? { ...c, qty: nextQty } : null;
          }
          return c;
        })
        .filter(Boolean) as { item: MenuItem; qty: number }[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const deliveryFee = orderType === "Home Delivery" ? (subtotal > 300 ? 0 : 30) : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = +(taxableAmount * 0.05).toFixed(2);
  const grandTotal = +(taxableAmount + tax + deliveryFee).toFixed(2);

  const applyCoupon = () => {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (code === "SHRU50") {
      if (subtotal < 200) {
        setCouponError("Order subtotal must be at least ₹200 to apply SHRU50.");
        return;
      }
      setAppliedCoupon({ code: "SHRU50", discount: 50 });
    } else if (code === "WELCOME20") {
      const calcDiscount = +(subtotal * 0.2).toFixed(2);
      setAppliedCoupon({ code: "WELCOME20", discount: Math.min(calcDiscount, 100) });
    } else if (code === "SUPER100") {
      if (subtotal < 499) {
        setCouponError("Order subtotal must be at least ₹499 to apply SUPER100.");
        return;
      }
      setAppliedCoupon({ code: "SUPER100", discount: 100 });
    } else {
      setCouponError("Invalid coupon code. Try SHRU50, WELCOME20 or SUPER100.");
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrder = createOrder({
      platform: "Customer-Online",
      orderType,
      tableNumber: orderType === "Dine-In" ? selectedTable : undefined,
      customerName: name,
      customerPhone: phone,
      deliveryAddress: orderType === "Home Delivery" ? address : undefined,
      items: cart.map((c) => ({
        id: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.qty,
        isVeg: c.item.isVeg
      })),
      subtotal,
      tax,
      deliveryFee,
      discount: discountAmount,
      couponCode: appliedCoupon?.code,
      grandTotal,
      status: "Accepted",
      deliveryStage: "Restaurant Accepted",
      paymentMethod,
      paymentStatus: "Paid"
    });

    setConfirmedOrderId(newOrder.id);
    setActiveTrackOrderId(newOrder.id);
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="flex-1 h-full w-full overflow-y-auto bg-stone-50 flex flex-col min-h-0">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-[#220d02] via-[#3d1703] to-[#592205] text-white py-6 px-4 sm:px-8 border-b border-amber-900/40 shadow-sm shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-left flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Coffee className="w-3.5 h-3.5" />
              <span>Shru's Cafe Official Online Ordering</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-amber-100">
              Artisanal Roastery & Gourmet Kitchen
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-xl">
              Authentic Irani chai, signature coffees, wood-fired pizzas, sizzling misal, and gourmet delicacies delivered hot across Pune.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Featured Cafe Visual Card */}
            <div className="relative w-40 h-24 sm:w-48 sm:h-28 rounded-xl overflow-hidden border border-amber-500/30 shadow-xl bg-stone-900 hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80"
                alt="Shru's Cafe"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = SVG_FOOD_FALLBACK;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] font-bold text-amber-200">Deccan Gymkhana, Pune</span>
              </div>
            </div>

            {/* Quick Coupon Tag banner */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 text-center space-y-1 shadow-md">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">Flat ₹50 OFF</span>
              <div className="font-mono text-xs font-extrabold text-white bg-amber-600 px-2.5 py-1 rounded-lg">
                CODE: SHRU50
              </div>
              <p className="text-[9px] text-amber-100/70">On orders above ₹200</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Order Mode Switcher Tabs */}
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600">Fulfillment Mode:</span>
            <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold">
              {(["Home Delivery", "Takeaway", "Dine-In"] as OrderType[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setOrderType(mode)}
                  className={`px-4 py-1.5 rounded-lg transition-all ${
                    orderType === mode
                      ? "bg-amber-800 text-white shadow-xs"
                      : "text-stone-700 hover:text-stone-900"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {orderType === "Home Delivery" ? (
            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              <span>Delivering across Pune (Free above ₹300)</span>
            </div>
          ) : orderType === "Dine-In" ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-stone-700">Select Table:</span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(Number(e.target.value))}
                className="bg-stone-100 border border-stone-300 rounded-lg px-3 py-1 font-bold text-stone-900"
              >
                {tables.map((t) => (
                  <option key={t.number} value={t.number}>
                    Table #{t.number} ({t.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Ready for pickup at cafe counter in 15 mins</span>
            </div>
          )}
        </div>

        {/* Category Pills & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          {/* Categories Horizontal Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === "All"
                  ? "bg-amber-800 text-white shadow-xs"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              All Dishes (168)
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-800 text-white shadow-xs"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Veg Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
            <div className="relative flex-1 min-w-0 w-full sm:min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, beverages, desserts..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-700 focus:bg-white text-stone-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-medium">
                <button
                  onClick={() => setDietaryFilter("all")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    dietaryFilter === "all" ? "bg-white font-bold text-stone-900 shadow-xs" : "text-stone-600"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setDietaryFilter("veg")}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                    dietaryFilter === "veg" ? "bg-white font-bold text-emerald-800 shadow-xs" : "text-stone-600"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-xs border border-emerald-600 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </span>
                  <span>Pure Veg</span>
                </button>
                <button
                  onClick={() => setDietaryFilter("nonveg")}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                    dietaryFilter === "nonveg" ? "bg-white font-bold text-red-800 shadow-xs" : "text-stone-600"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-xs border border-red-600 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  </span>
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDishes.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group shrink-0"
              style={{ minHeight: "310px" }}
            >
              {/* Photo */}
              <div
                className="w-full relative bg-stone-900 overflow-hidden shrink-0"
                style={{ height: "144px", minHeight: "144px" }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  style={{ height: "100%", width: "100%", objectFit: "cover" }}
                />
                {/* Veg indicator */}
                <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs p-1 rounded-sm shadow-xs">
                  <span
                    className={`w-3.5 h-3.5 rounded-xs border ${
                      item.isVeg ? "border-emerald-600" : "border-red-600"
                    } flex items-center justify-center`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isVeg ? "bg-emerald-600" : "bg-red-600"
                      }`}
                    />
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{item.prepTime}</span>
                </div>

                {item.isBestseller && (
                  <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>CHEF'S PICK</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-900 leading-snug mt-0.5">
                    {item.name}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-base font-mono font-bold text-stone-950">
                    ₹{item.price}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl animate-in slide-in-from-bottom-6 duration-200">
          <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-amber-600/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold font-mono">
                {cart.reduce((s, c) => s + c.qty, 0)}
              </div>
              <div>
                <div className="text-xs font-medium text-amber-200">Total payable:</div>
                <div className="text-lg font-mono font-black text-white">₹{grandTotal}</div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all"
            >
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm tracking-wide">Your Shru's Cafe Feast</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map(({ item, qty }) => (
                <div
                  key={item.id}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`} />
                      <h5 className="text-xs font-bold text-stone-900 truncate">{item.name}</h5>
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono">₹{item.price} each</div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg px-1 py-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-mono font-bold text-stone-900">{qty}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-5 h-5 flex items-center justify-center text-stone-600 hover:text-stone-900"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs font-mono font-bold text-stone-900 w-14 text-right">
                    ₹{item.price * qty}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-stone-400 hover:text-red-600 p-1 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Coupon input */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Apply Promotional Coupon</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter SHRU50 or WELCOME20"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg uppercase font-mono font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-3 py-1.5 bg-amber-800 text-white rounded-lg text-xs font-bold hover:bg-amber-900 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Coupon {appliedCoupon.code} applied (-₹{appliedCoupon.discount})</span>
                  </p>
                )}
                {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
              </div>

              {/* Delivery Details Form */}
              <form onSubmit={handleCheckout} id="checkout-form" className="space-y-2.5 pt-2 border-t border-stone-200">
                <div className="text-xs font-bold text-stone-900">Contact & Address</div>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contact Number (+91)"
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:bg-white"
                    />
                  </div>
                  {orderType === "Home Delivery" && (
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                      <textarea
                        required
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Complete Delivery Address in Pune"
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:bg-white"
                      />
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-stone-900 pt-1">Payment Method</div>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  {(["UPI / QR", "Cash", "Credit Card"] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 rounded-lg border text-center transition-all ${
                        paymentMethod === method
                          ? "bg-amber-100 border-amber-600 text-amber-950 font-bold"
                          : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Calculations & Submit */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2 flex-shrink-0">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Item Subtotal:</span>
                  <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Charge:</span>
                    <span className="font-mono">₹{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>GST (5%):</span>
                  <span className="font-mono">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-950 pt-1 border-t border-stone-200">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base text-amber-900">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all mt-2"
              >
                <span>Confirm & Place Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmed Modal */}
      {confirmedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">Order Confirmed!</h3>
              <p className="text-xs text-stone-500 mt-1">
                Your food is being prepared with passion at Shru's Cafe.
              </p>
              <div className="mt-3 p-2 bg-stone-100 rounded-xl font-mono text-xs font-bold text-amber-900">
                Order ID: #{confirmedOrderId}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setActiveTrackOrderId(confirmedOrderId);
                  setActiveView("tracking");
                  setConfirmedOrderId(null);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Track Live Delivery Progress</span>
              </button>

              <button
                onClick={() => {
                  const targetOrder = orders.find((o) => o.id === confirmedOrderId);
                  if (targetOrder) {
                    openCancelModal(targetOrder);
                  }
                  setConfirmedOrderId(null);
                }}
                className="w-full py-2 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Ban className="w-3.5 h-3.5 text-red-600" />
                <span>Cancel Order</span>
              </button>

              <button
                onClick={() => setConfirmedOrderId(null)}
                className="w-full py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Back to Food Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
