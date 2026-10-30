import React, { useState, useMemo } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { MENU_ITEMS, DISPLAY_CATEGORIES, matchCategory, FALLBACK_FOOD_IMAGE } from "../../data/menuData";
import { CategoryName, MenuItem, OrderType, Order } from "../../types";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Utensils,
  Clock,
  Sparkles,
  Layers,
  ChefHat,
  ShoppingBag,
  X,
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  Percent,
  CheckCircle2,
  History,
  Tag,
  ArrowRight,
  Ban
} from "lucide-react";

export const PosView: React.FC = () => {
  const {
    createOrder,
    openBillModal,
    showToast,
    tables,
    orders,
    settings,
    openCancelModal
  } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");

  // Cart state
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("Dine-In");
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("Walk-In Guest");
  const [customerPhone, setCustomerPhone] = useState<string>("+91 98220 00000");

  // Discount
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  // Mobile cart drawer
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI / QR" | "Credit Card" | "Split (Cash + UPI)">("Cash");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [isTestPaymentSuccess, setIsTestPaymentSuccess] = useState<boolean>(false);

  // Bill History Modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Filtered menu using 23 category matcher
  const filteredDishes = useMemo(() => {
    let result = MENU_ITEMS.filter((item) => {
      const catMatch = selectedCategory === "All" || matchCategory(item.category, selectedCategory);
      const dietMatch =
        dietaryFilter === "all" ||
        (dietaryFilter === "veg" && item.isVeg) ||
        (dietaryFilter === "nonveg" && !item.isVeg);
      const searchMatch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return catMatch && dietMatch && searchMatch;
    });

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategory, dietaryFilter, searchQuery, sortBy]);

  // Cart actions
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
            const newQty = c.qty + delta;
            return newQty > 0 ? { ...c, qty: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as { item: MenuItem; qty: number }[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedDiscount(0);
    setCouponCode("");
  };

  // Calculations
  const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const tax = +(subtotal * (settings.gstRatePercent / 100)).toFixed(2);
  const deliveryFee = orderType === "Home Delivery" ? settings.deliveryCharge : 0;
  const grandTotal = Math.max(0, +(subtotal + tax + deliveryFee - appliedDiscount).toFixed(2));
  const totalCartCount = cart.reduce((s, c) => s + c.qty, 0);

  // Apply Coupon
  const handleApplyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === "SHRU50") {
      if (subtotal < 200) {
        showToast("Minimum subtotal of ₹200 required for SHRU50");
        return;
      }
      setAppliedDiscount(50);
      setCouponCode("SHRU50");
      showToast("Coupon SHRU50 applied! ₹50 OFF");
    } else if (clean === "WELCOME20") {
      const disc = +(subtotal * 0.2).toFixed(2);
      setAppliedDiscount(disc);
      setCouponCode("WELCOME20");
      showToast(`Coupon WELCOME20 applied! ₹${disc} OFF`);
    } else if (clean === "COFFEE10") {
      const disc = +(subtotal * 0.1).toFixed(2);
      setAppliedDiscount(disc);
      setCouponCode("COFFEE10");
      showToast(`Coupon COFFEE10 applied! ₹${disc} OFF`);
    } else {
      showToast("Invalid code. Try SHRU50, WELCOME20, or COFFEE10.");
    }
  };

  // KOT action
  const handleSendKOT = () => {
    if (cart.length === 0) {
      showToast("Cart is empty. Add dishes first.");
      return;
    }
    createOrder({
      platform: "POS",
      orderType,
      tableNumber: orderType === "Dine-In" ? selectedTable : undefined,
      customerName,
      customerPhone,
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
      discount: appliedDiscount,
      couponCode: couponCode || undefined,
      grandTotal,
      status: "Cooking",
      deliveryStage: "Food Preparing",
      paymentMethod: "Cash",
      paymentStatus: "Pending"
    });
    showToast(`KOT generated for Kitchen Display System`);
    clearCart();
    setIsMobileCartOpen(false);
  };

  // Open Payment Settle Modal
  const handleOpenSettle = () => {
    if (cart.length === 0) {
      showToast("Cart is empty. Add dishes first.");
      return;
    }
    setCashTendered(String(grandTotal));
    setIsTestPaymentSuccess(false);
    setIsPaymentModalOpen(true);
  };

  // Confirm Final Payment
  const handleCompleteOrder = () => {
    const order = createOrder({
      platform: "POS",
      orderType,
      tableNumber: orderType === "Dine-In" ? selectedTable : undefined,
      customerName,
      customerPhone,
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
      discount: appliedDiscount,
      couponCode: couponCode || undefined,
      grandTotal,
      status: "Delivered",
      deliveryStage: "Delivered",
      paymentMethod: paymentMode,
      paymentStatus: "Paid"
    });

    setIsPaymentModalOpen(false);
    openBillModal(order);
    clearCart();
    setIsMobileCartOpen(false);
    showToast(`Order settled successfully! Receipt #${order.id}`);
  };

  // Cart Content
  const CartContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Order Meta Header */}
      <div className="p-3.5 border-b border-stone-200 bg-stone-50/80 space-y-2.5">
        <div className="grid grid-cols-3 bg-stone-200 p-0.5 rounded-lg text-xs font-bold">
          {(["Dine-In", "Takeaway", "Home Delivery"] as OrderType[]).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`py-1.5 rounded-md text-center transition-all ${
                orderType === type
                  ? "bg-amber-900 text-white shadow-xs"
                  : "text-stone-700 hover:text-stone-950"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {orderType === "Dine-In" && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-500 whitespace-nowrap">TABLE:</span>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(Number(e.target.value))}
              className="w-full bg-white border border-stone-300 rounded-lg py-1 px-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-amber-700"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.number}>
                  Table #{t.number} ({t.capacity} Seats) - {t.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <input
            type="text"
            placeholder="Guest Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs focus:outline-none focus:border-amber-700"
          />
          <input
            type="text"
            placeholder="Mobile (+91)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs focus:outline-none focus:border-amber-700 font-mono"
          />
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 py-12">
            <ShoppingBag className="w-10 h-10 mb-2 stroke-1 text-stone-300" />
            <p className="text-xs font-semibold">Your POS Cart is Empty</p>
            <p className="text-[11px] text-stone-400 mt-1">Tap dishes to add to this order</p>
          </div>
        ) : (
          cart.map(({ item, qty }) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 bg-white rounded-xl border border-stone-200/80 shadow-xs hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                    item.isVeg ? "border-emerald-600" : "border-red-600"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`} />
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate">{item.name}</h4>
                  <span className="text-[11px] font-mono text-stone-500">₹{item.price} each</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center bg-stone-100 rounded-lg border border-stone-200 p-0.5">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-stone-700 active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold font-mono text-stone-900">{qty}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white text-stone-700 active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-stone-400 hover:text-red-500 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Coupons */}
      <div className="p-3.5 bg-stone-50 border-t border-stone-200 space-y-2">
        {/* Quick Promo Selector */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Coupon (SHRU50, WELCOME20)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs uppercase font-mono font-bold"
          />
          <button
            onClick={() => handleApplyCoupon(couponCode)}
            className="px-2.5 py-1 bg-amber-800 text-white text-xs font-bold rounded-lg hover:bg-amber-900"
          >
            Apply
          </button>
        </div>

        {/* Calculation Table */}
        <div className="space-y-1 text-xs pt-1 border-t border-stone-200">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal ({totalCartCount} items):</span>
            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>GST ({settings.gstRatePercent}%):</span>
            <span className="font-mono">₹{tax.toFixed(2)}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between text-stone-600">
              <span>Delivery Charge:</span>
              <span className="font-mono">₹{deliveryFee.toFixed(2)}</span>
            </div>
          )}
          {appliedDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Discount ({couponCode}):</span>
              <span className="font-mono">-₹{appliedDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-1.5 border-t border-stone-300">
            <span>Grand Total:</span>
            <span className="font-mono text-amber-950">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Settle & KOT Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleSendKOT}
            disabled={cart.length === 0}
            className="py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-800" />
            <span>Send KOT</span>
          </button>
          <button
            onClick={handleOpenSettle}
            disabled={cart.length === 0}
            className="py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Receipt className="w-3.5 h-3.5 text-amber-300" />
            <span>Settle Bill (₹{grandTotal})</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-stone-100 font-sans">
      {/* Center Left: Menu Food Catalog Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-stone-200 bg-white">
        {/* Search & Filter Header Bar */}
        <div className="p-3 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Masala Chai, Misal, Biryani, Coffee)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-700"
            />
          </div>

          {/* Quick Dietary Filters & Past Bills Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDietaryFilter("all")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                dietaryFilter === "all" ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietaryFilter("veg")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                dietaryFilter === "veg"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white border-stone-200 text-emerald-700"
              }`}
            >
              Veg
            </button>
            <button
              onClick={() => setDietaryFilter("nonveg")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                dietaryFilter === "nonveg"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white border-stone-200 text-red-700"
              }`}
            >
              Non-Veg
            </button>

            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="ml-2 flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300"
              title="View past invoices and reprint bills"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reprint</span>
            </button>
          </div>
        </div>

        {/* 23 Requested Categories Horizontal Ribbon */}
        <div className="px-3 py-2 border-b border-stone-200 bg-white overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "All"
                ? "bg-amber-900 text-white shadow-xs"
                : "bg-stone-100 hover:bg-stone-200 text-stone-700"
            }`}
          >
            All Items
          </button>
          {DISPLAY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-amber-900 text-white shadow-xs"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Dishes Grid */}
        <div className="flex-1 overflow-y-auto p-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filteredDishes.map((dish) => {
              const inCart = cart.find((c) => c.item.id === dish.id);
              return (
                <div
                  key={dish.id}
                  onClick={() => addToCart(dish)}
                  className={`group relative bg-white rounded-xl border p-2 flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer transition-all duration-150 ${
                    inCart ? "border-amber-600 ring-2 ring-amber-100" : "border-stone-200 hover:border-amber-400"
                  }`}
                >
                  {/* Dish Thumbnail */}
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-100 mb-2">
                    <img
                      src={dish.image || FALLBACK_FOOD_IMAGE}
                      alt={dish.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    {/* Veg / Non-Veg badge */}
                    <span
                      className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-sm border bg-white/90 backdrop-blur-xs flex items-center justify-center ${
                        dish.isVeg ? "border-emerald-600" : "border-red-600"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? "bg-emerald-600" : "bg-red-600"}`} />
                    </span>

                    {/* Quantity Badge if in cart */}
                    {inCart && (
                      <span className="absolute top-1.5 right-1.5 bg-amber-900 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                        x{inCart.qty}
                      </span>
                    )}

                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs">
                      {dish.prepTime}
                    </span>
                  </div>

                  {/* Dish Name & Description */}
                  <div>
                    <h3 className="font-bold text-xs text-stone-900 leading-snug line-clamp-1 group-hover:text-amber-900">
                      {dish.name}
                    </h3>
                    <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                      {dish.desc}
                    </p>
                  </div>

                  {/* Price & Add Action */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100">
                    <span className="text-xs font-extrabold font-mono text-stone-900">
                      ₹{dish.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(dish);
                      }}
                      className="px-2 py-0.5 bg-amber-50 group-hover:bg-amber-900 group-hover:text-white text-amber-900 text-[10px] font-bold rounded-md border border-amber-300 transition-colors"
                    >
                      + ADD
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Desktop Cart Panel */}
      <div className="hidden lg:flex w-80 xl:w-96 bg-white flex-col h-full shrink-0 shadow-sm">
        {CartContent}
      </div>

      {/* Mobile Floating Cart Button (< lg screens) */}
      <div className="lg:hidden fixed bottom-16 right-4 z-40">
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="flex items-center gap-2 bg-amber-900 text-white px-4 py-2.5 rounded-full shadow-2xl font-bold text-xs active:scale-95"
        >
          <ShoppingBag className="w-4 h-4 text-amber-300" />
          <span>Cart ({totalCartCount})</span>
          <span className="font-mono bg-amber-800 px-2 py-0.5 rounded-full">₹{grandTotal}</span>
        </button>
      </div>

      {/* Mobile Cart Drawer (< lg screens) */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setIsMobileCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="p-3 bg-stone-900 text-white flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>POS Order Cart</span>
              </span>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {CartContent}
            </div>
          </div>
        </div>
      )}

      {/* Payment & Settlement Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 block tracking-wider">
                  Payment Gateway & Settle
                </span>
                <h3 className="font-bold text-base">Net Payable: ₹{grandTotal.toFixed(2)}</h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="p-4 bg-stone-50 border-b border-stone-200 grid grid-cols-4 gap-1.5">
              {[
                { id: "Cash", label: "Cash", icon: Banknote },
                { id: "UPI / QR", label: "UPI QR", icon: QrCode },
                { id: "Credit Card", label: "Card", icon: CreditCard },
                { id: "Split (Cash + UPI)", label: "Split", icon: Layers }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMode(id as any)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMode === id
                      ? "bg-amber-900 text-white shadow-sm"
                      : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Mode Specific Body */}
            <div className="p-5 space-y-4">
              {paymentMode === "Cash" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">
                      Cash Tendered by Customer (₹)
                    </label>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-full text-lg font-bold font-mono p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                    />
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-950">Change Due to Customer:</span>
                    <span className="font-mono font-extrabold text-base text-amber-950">
                      ₹{Math.max(0, +(Number(cashTendered || 0) - grandTotal)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {paymentMode === "UPI / QR" && (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-white border-2 border-dashed border-stone-300 rounded-2xl shadow-sm">
                    {/* Live SVG QR representation */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `upi://pay?pa=${settings.upiId}&pn=ShrusCafe&am=${grandTotal}&cu=INR`
                      )}`}
                      alt="UPI QR Code"
                      className="w-40 h-40 object-contain rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Scan to pay ₹{grandTotal.toFixed(2)}</p>
                    <p className="text-[11px] font-mono text-stone-500 mt-0.5">{settings.upiId}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-1">GPay • PhonePe • Paytm • BHIM</p>
                  </div>
                </div>
              )}

              {paymentMode === "Credit Card" && (
                <div className="space-y-3">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-center">
                    <CreditCard className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-stone-800">Swipe, Dip or Tap Card on Terminal</p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Charge ₹{grandTotal.toFixed(2)} on POS EDC device
                    </p>
                  </div>
                </div>
              )}

              {paymentMode === "Split (Cash + UPI)" && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-600">Split payment across Cash and UPI:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 block mb-1">CASH PORTION</span>
                      <input
                        type="number"
                        placeholder="₹ Cash"
                        defaultValue={(grandTotal / 2).toFixed(2)}
                        className="w-full p-2 border border-stone-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 block mb-1">UPI PORTION</span>
                      <input
                        type="number"
                        placeholder="₹ UPI"
                        defaultValue={(grandTotal / 2).toFixed(2)}
                        className="w-full p-2 border border-stone-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Complete & Print Action */}
              <button
                onClick={handleCompleteOrder}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Payment & Generate Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>Recent Invoices & Bills</span>
              </span>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1 rounded hover:bg-white/20 text-stone-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {orders.slice(0, 15).map((o) => (
                <div
                  key={o.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    o.status === "Cancelled"
                      ? "bg-red-50/50 border-red-200"
                      : "bg-stone-50 border-stone-200 hover:bg-amber-50/50"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900 truncate">{o.invoiceNumber || `SHRU-INV-${o.id}`}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 shrink-0">
                        {o.orderType}
                      </span>
                      {o.status === "Cancelled" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 shrink-0">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                      {o.customerName} • {o.items.length} items • ₹{o.grandTotal}
                    </p>
                    {o.status === "Cancelled" && o.cancelReason && (
                      <p className="text-[10px] text-red-700 font-medium truncate mt-0.5">
                        Reason: {o.cancelReason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {o.status !== "Cancelled" && (
                      <button
                        onClick={() => {
                          setIsHistoryModalOpen(false);
                          openCancelModal(o);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-lg transition-colors shadow-xs"
                        title="Cancel Order"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsHistoryModalOpen(false);
                        openBillModal(o);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Bill</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
