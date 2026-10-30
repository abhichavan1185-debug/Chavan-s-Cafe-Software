import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  Order,
  DeliveryPartner,
  RestaurantTable,
  InventoryItem,
  CustomerProfile,
  OrderStatus,
  DeliveryStage,
  OrderPlatform,
  UserRole,
  UserProfile,
  CafeExpense,
  CafeSettings,
  PartnerLocationUpdate,
  OrderFeedback
} from "../types";
import {
  INITIAL_ORDERS,
  INITIAL_PARTNERS,
  INITIAL_TABLES,
  INITIAL_INVENTORY,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_STAFF,
  CAFE_SETTINGS,
  INITIAL_FEEDBACKS
} from "../data/initialData";
import { MENU_ITEMS } from "../data/menuData";
import { playChime } from "../utils/audio";
import {
  getSupabaseClient,
  saveOrderToSupabase,
  pushGpsLocationToSupabase,
  subscribeToGpsLocations
} from "../services/supabase";

export const DELIVERY_STAGES: DeliveryStage[] = [
  "Order Placed",
  "Restaurant Accepted",
  "Food Preparing",
  "Food Ready",
  "Delivery Partner Assigned",
  "Delivery Partner Arrived",
  "Order Picked Up",
  "On The Way",
  "Near Customer",
  "Delivered"
];

interface RestaurantContextType {
  // Brand & Settings
  settings: CafeSettings;
  updateSettings: (newSettings: Partial<CafeSettings>) => void;

  // Role & Staff
  currentRole: UserRole;
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  staffList: UserProfile[];

  // Core Data
  orders: Order[];
  partners: DeliveryPartner[];
  tables: RestaurantTable[];
  inventory: InventoryItem[];
  customers: CustomerProfile[];
  expenses: CafeExpense[];

  // Navigation & UI
  activeView: string;
  setActiveView: (view: string) => void;
  activeTrackOrderId: string | null;
  setActiveTrackOrderId: (id: string | null) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  selectedBillOrder: Order | null;
  openBillModal: (order: Order) => void;
  closeBillModal: () => void;
  notificationToast: string | null;
  showToast: (msg: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Order Lifecycle
  createOrder: (newOrder: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, stage?: DeliveryStage) => void;
  advanceDeliveryStage: (orderId: string) => void;
  assignPartner: (orderId: string, partnerId: string) => void;
  simulateIncomingOrder: (platform?: OrderPlatform) => void;

  // Table Actions
  toggleTableStatus: (tableNum: number) => void;
  vacateAllTables: () => void;
  settleTable: (tableNum: number) => void;

  // Fleet & Delivery Partner
  addDeliveryPartner: (partner: {
    name: string;
    phone: string;
    avatar: string;
    vehicleType: "Motorbike" | "Electric Scooter" | "Bicycle";
    vehicleNumber: string;
  }) => void;
  updatePartnerStatus: (partnerId: string, status: DeliveryPartner["status"]) => void;

  // Real GPS Tracking
  isRealGpsTrackingActive: boolean;
  gpsTrackingError: string | null;
  startRealGpsTracking: (partnerId: string, orderId?: string) => Promise<boolean>;
  stopRealGpsTracking: () => void;
  activeLocationUpdate: PartnerLocationUpdate | null;

  // Inventory & Expenses
  restockItem: (itemId: string, qty: number) => void;
  addExpense: (expense: Omit<CafeExpense, "id">) => void;
  deleteExpense: (id: string) => void;

  // Order Cancellation & Customer Feedback
  cancelOrder: (orderId: string, reason: string) => void;
  selectedCancelOrder: Order | null;
  openCancelModal: (order: Order) => void;
  closeCancelModal: () => void;
  feedbacks: OrderFeedback[];
  submitFeedback: (feedback: Omit<OrderFeedback, "id" | "createdAt">) => void;
  selectedFeedbackOrder: Order | null;
  openFeedbackModal: (order: Order) => void;
  closeFeedbackModal: () => void;

  // Supabase Status
  supabaseConnected: boolean;
  checkSupabaseStatus: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings
  const [settings, setSettings] = useState<CafeSettings>(() => {
    const saved = localStorage.getItem("shrus_settings_v3");
    return saved ? JSON.parse(saved) : CAFE_SETTINGS;
  });

  // Current Role (Staff roles only)
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("shrus_active_role") as UserRole;
    return saved && saved !== "DELIVERY PARTNER" ? saved : "ADMIN";
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return INITIAL_STAFF.find((s) => s.role === currentRole) || INITIAL_STAFF[0];
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("shrus_orders_v3");
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Delivery Partners
  const [partners, setPartners] = useState<DeliveryPartner[]>(() => {
    const saved = localStorage.getItem("shrus_partners_v3");
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  // Tables
  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem("shrus_tables_v3");
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem("shrus_inventory_v3");
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  // Customers
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    const saved = localStorage.getItem("shrus_customers_v3");
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  // Expenses
  const [expenses, setExpenses] = useState<CafeExpense[]>(() => {
    const saved = localStorage.getItem("shrus_expenses_v3");
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // UI States
  const [activeView, setActiveView] = useState<string>("pos");
  const [activeTrackOrderId, setActiveTrackOrderId] = useState<string | null>("SW-8421");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedBillOrder, setSelectedBillOrder] = useState<Order | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  // Real GPS tracking state
  const [isRealGpsTrackingActive, setIsRealGpsTrackingActive] = useState<boolean>(false);
  const [gpsTrackingError, setGpsTrackingError] = useState<string | null>(null);
  const [activeLocationUpdate, setActiveLocationUpdate] = useState<PartnerLocationUpdate | null>(null);
  const watchPositionIdRef = useRef<number | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("shrus_settings_v3", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("shrus_active_role", currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem("shrus_orders_v3", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("shrus_partners_v3", JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem("shrus_tables_v3", JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem("shrus_inventory_v3", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("shrus_customers_v3", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("shrus_expenses_v3", JSON.stringify(expenses));
  }, [expenses]);

  // Feedbacks state
  const [feedbacks, setFeedbacks] = useState<OrderFeedback[]>(() => {
    const saved = localStorage.getItem("shrus_feedbacks_v1");
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACKS;
  });

  const [selectedCancelOrder, setSelectedCancelOrder] = useState<Order | null>(null);
  const [selectedFeedbackOrder, setSelectedFeedbackOrder] = useState<Order | null>(null);

  useEffect(() => {
    localStorage.setItem("shrus_feedbacks_v1", JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Check Supabase connection and subscribe to realtime GPS updates
  const checkSupabaseStatus = useCallback(() => {
    const client = getSupabaseClient();
    setSupabaseConnected(!!client);
  }, []);

  useEffect(() => {
    checkSupabaseStatus();

    // Subscribe to live GPS broadcasts from any active delivery partner device
    const unsubscribe = subscribeToGpsLocations((locationUpdate) => {
      setActiveLocationUpdate(locationUpdate);

      // Update partner state with latest GPS
      setPartners((prev) =>
        prev.map((p) =>
          p.id === locationUpdate.partnerId
            ? {
                ...p,
                lastLatitude: locationUpdate.latitude,
                lastLongitude: locationUpdate.longitude,
                lastGpsUpdate: locationUpdate.timestamp,
                isGpsActive: true,
                isRealGps: locationUpdate.isRealGps
              }
            : p
        )
      );

      // Update active order rider coordinate
      if (locationUpdate.orderId) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === locationUpdate.orderId
              ? {
                  ...o,
                  riderCurrentLocation: {
                    lat: locationUpdate.latitude,
                    lng: locationUpdate.longitude,
                    lastUpdated: locationUpdate.timestamp,
                    isRealGps: locationUpdate.isRealGps
                  }
                }
              : o
          )
        );
      }
    });

    return () => {
      unsubscribe();
      if (watchPositionIdRef.current !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
      }
    };
  }, [checkSupabaseStatus]);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const openBillModal = (order: Order) => setSelectedBillOrder(order);
  const closeBillModal = () => setSelectedBillOrder(null);

  const updateSettings = (newSettings: Partial<CafeSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast("Cafe settings saved successfully");
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const staff = INITIAL_STAFF.find((s) => s.role === role) || INITIAL_STAFF[0];
    setCurrentUser(staff);

    // Route dynamically based on role focus
    if (role === "KITCHEN STAFF") setActiveView("kds");
    else if (role === "DELIVERY PARTNER") setActiveView("fleet");
    else if (role === "CASHIER") setActiveView("pos");

    showToast(`Switched profile: ${role} (${staff.name})`);
  };

  // Recipe-based ingredient deduction helper
  const deductRecipeIngredients = (orderedItems: { name: string; quantity: number }[]) => {
    setInventory((prev) => {
      const updated = [...prev];
      for (const item of orderedItems) {
        const lowerName = item.name.toLowerCase();
        const qty = item.quantity;

        // Chai / Coffee deductions
        if (lowerName.includes("chai") || lowerName.includes("tea")) {
          const milk = updated.find((i) => i.id === "INV-2");
          const teaLeaves = updated.find((i) => i.id === "INV-5");
          if (milk) milk.currentStock = Math.max(0, +(milk.currentStock - 0.15 * qty).toFixed(2));
          if (teaLeaves) teaLeaves.currentStock = Math.max(0, +(teaLeaves.currentStock - 0.02 * qty).toFixed(2));
        } else if (lowerName.includes("coffee")) {
          const milk = updated.find((i) => i.id === "INV-2");
          const coffeeBeans = updated.find((i) => i.id === "INV-4");
          if (milk) milk.currentStock = Math.max(0, +(milk.currentStock - 0.18 * qty).toFixed(2));
          if (coffeeBeans) coffeeBeans.currentStock = Math.max(0, +(coffeeBeans.currentStock - 0.025 * qty).toFixed(2));
        }

        // Misal Pav / Bun Maska deductions
        if (lowerName.includes("bun") || lowerName.includes("pav") || lowerName.includes("misal")) {
          const butter = updated.find((i) => i.id === "INV-1");
          const pav = updated.find((i) => i.id === "INV-8");
          if (butter) butter.currentStock = Math.max(0, +(butter.currentStock - 0.03 * qty).toFixed(2));
          if (pav) pav.currentStock = Math.max(0, pav.currentStock - 2 * qty);
        }

        // Biryani / Chicken deductions
        if (lowerName.includes("biryani") || lowerName.includes("chicken")) {
          const chicken = updated.find((i) => i.id === "INV-6");
          const rice = updated.find((i) => i.id === "INV-7");
          if (chicken) chicken.currentStock = Math.max(0, +(chicken.currentStock - 0.25 * qty).toFixed(2));
          if (rice) rice.currentStock = Math.max(0, +(rice.currentStock - 0.15 * qty).toFixed(2));
        }

        // Packaging deductions for deliveries & takeaway
        const packaging = updated.find((i) => i.id === "INV-9");
        if (packaging) packaging.currentStock = Math.max(0, packaging.currentStock - 1);
      }

      // Update status tags (Optimal vs Low Stock vs Critical)
      return updated.map((i) => {
        let status: InventoryItem["status"] = "Optimal";
        if (i.currentStock <= i.minThreshold * 0.4) status = "Critical";
        else if (i.currentStock <= i.minThreshold) status = "Low Stock";
        return { ...i, status };
      });
    });
  };

  // Create new order
  const createOrder = (orderData: Partial<Order>): Order => {
    const idPrefix =
      orderData.platform === "Swiggy"
        ? "SW"
        : orderData.platform === "Zomato"
        ? "ZM"
        : orderData.platform === "Customer-Online"
        ? "ONL"
        : "POS";

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `${idPrefix}-${randomNum}`;
    const invoiceNumber = `SHRU-INV-${new Date().getFullYear()}-${randomNum}`;

    const fullOrder: Order = {
      id: newId,
      invoiceNumber,
      platform: orderData.platform || "POS",
      orderType: orderData.orderType || "Dine-In",
      tableNumber: orderData.tableNumber,
      customerName: orderData.customerName || "Walk-In Guest",
      customerPhone: orderData.customerPhone || "+91 98000 00000",
      deliveryAddress: orderData.deliveryAddress,
      deliveryCoords: orderData.deliveryCoords || { lat: 18.5362, lng: 73.8942 },
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      deliveryFee: orderData.deliveryFee || 0,
      discount: orderData.discount || 0,
      couponCode: orderData.couponCode,
      grandTotal: orderData.grandTotal || 0,
      status: orderData.status || "Accepted",
      deliveryStage: orderData.deliveryStage || "Restaurant Accepted",
      createdAt: "Just now",
      estimatedDeliveryTime: orderData.orderType === "Home Delivery" ? "25 mins" : "15 mins",
      paymentMethod: orderData.paymentMethod || "Cash",
      paymentStatus: orderData.paymentStatus || "Paid",
      riderProgress: 0.05,
      riderCurrentLocation: {
        lat: settings.latitude,
        lng: settings.longitude,
        isRealGps: false
      }
    };

    setOrders((prev) => [fullOrder, ...prev]);

    // Automatic recipe ingredient deduction
    deductRecipeIngredients(fullOrder.items);

    // If dine-in, mark table occupied
    if (fullOrder.orderType === "Dine-In" && fullOrder.tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.number === fullOrder.tableNumber
            ? {
                ...t,
                status: "occupied",
                currentOrderId: fullOrder.id,
                currentBill: fullOrder.grandTotal,
                dinerCount: Math.max(1, fullOrder.items.length)
              }
            : t
        )
      );
    }

    // Update customer CRM records
    if (fullOrder.customerPhone && fullOrder.customerPhone !== "+91 98000 00000") {
      setCustomers((prev) => {
        const cleanPhone = fullOrder.customerPhone.replace(/[\s-]/g, "");
        const existingIdx = prev.findIndex((c) => c.phone.replace(/[\s-]/g, "") === cleanPhone);
        const nowStr = "Today, " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

        if (existingIdx >= 0) {
          const old = prev[existingIdx];
          const newSpent = +(old.totalSpent + fullOrder.grandTotal).toFixed(2);
          const newOrders = old.totalOrders + 1;
          const tier =
            newSpent >= 12000
              ? "Platinum Elite"
              : newSpent >= 7000
              ? "Gold VIP"
              : newSpent >= 3000
              ? "Silver"
              : "Regular";
          const updated = [...prev];
          updated[existingIdx] = {
            ...old,
            name: fullOrder.customerName || old.name,
            totalOrders: newOrders,
            totalSpent: newSpent,
            tier,
            lastOrderedAt: nowStr
          };
          return updated;
        } else if (fullOrder.customerName && fullOrder.customerName !== "Walk-In Guest") {
          const newCust: CustomerProfile = {
            id: `CUST-${prev.length + 1}`,
            name: fullOrder.customerName,
            phone: fullOrder.customerPhone,
            address: fullOrder.deliveryAddress,
            totalOrders: 1,
            totalSpent: fullOrder.grandTotal,
            tier: fullOrder.grandTotal >= 3000 ? "Silver" : "Regular",
            lastOrderedAt: nowStr
          };
          return [newCust, ...prev];
        }
        return prev;
      });
    }

    // Auto-sync order to Supabase
    saveOrderToSupabase(fullOrder);

    if (soundEnabled) playChime("new-order");
    showToast(`Order #${fullOrder.id} generated (${fullOrder.platform})`);
    return fullOrder;
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus, stage?: DeliveryStage) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        let newStage = stage || o.deliveryStage;
        if (!stage) {
          if (status === "Cooking") newStage = "Food Preparing";
          else if (status === "Ready") newStage = "Food Ready";
          else if (status === "Out for Delivery") newStage = "On The Way";
          else if (status === "Delivered") newStage = "Delivered";
        }
        const updated = {
          ...o,
          status,
          deliveryStage: newStage,
          riderProgress: status === "Delivered" ? 1.0 : o.riderProgress
        };
        saveOrderToSupabase(updated);
        return updated;
      })
    );
    if (soundEnabled) {
      if (status === "Ready") playChime("ready");
      else playChime("success");
    }
  };

  // Move through the 10 stages
  const advanceDeliveryStage = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const currentIdx = DELIVERY_STAGES.indexOf(o.deliveryStage);
        if (currentIdx < DELIVERY_STAGES.length - 1) {
          const nextStage = DELIVERY_STAGES[currentIdx + 1];
          let nextStatus: OrderStatus = o.status;
          if (nextStage === "Food Preparing") nextStatus = "Cooking";
          if (
            nextStage === "Food Ready" ||
            nextStage === "Delivery Partner Assigned" ||
            nextStage === "Delivery Partner Arrived"
          )
            nextStatus = "Ready";
          if (
            nextStage === "Order Picked Up" ||
            nextStage === "On The Way" ||
            nextStage === "Near Customer"
          )
            nextStatus = "Out for Delivery";
          if (nextStage === "Delivered") nextStatus = "Delivered";

          const progressMap: Record<DeliveryStage, number> = {
            "Order Placed": 0.0,
            "Restaurant Accepted": 0.1,
            "Food Preparing": 0.25,
            "Food Ready": 0.35,
            "Delivery Partner Assigned": 0.45,
            "Delivery Partner Arrived": 0.55,
            "Order Picked Up": 0.65,
            "On The Way": 0.8,
            "Near Customer": 0.95,
            "Delivered": 1.0
          };

          const updated = {
            ...o,
            deliveryStage: nextStage,
            status: nextStatus,
            riderProgress: progressMap[nextStage] || 0.5
          };
          saveOrderToSupabase(updated);
          return updated;
        }
        return o;
      })
    );
    if (soundEnabled) playChime("success");
  };

  // Assign delivery partner
  const assignPartner = (orderId: string, partnerId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              deliveryPartnerId: partnerId,
              deliveryStage: "Delivery Partner Assigned"
            }
          : o
      )
    );

    setPartners((prev) =>
      prev.map((p) =>
        p.id === partnerId
          ? {
              ...p,
              status: "Assigned",
              assignedOrderId: orderId
            }
          : p
      )
    );
    if (soundEnabled) playChime("success");
    showToast(`Partner assigned to #${orderId}`);
  };

  // Start real device GPS tracking using Geolocation API
  const startRealGpsTracking = async (
    partnerId: string,
    orderId?: string
  ): Promise<boolean> => {
    if (!("geolocation" in navigator)) {
      setGpsTrackingError("Geolocation is not supported by your browser or device.");
      showToast("GPS not available on this device");
      return false;
    }

    setGpsTrackingError(null);

    return new Promise((resolve) => {
      // First test current position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy, speed, heading } = pos.coords;
          const timestamp = new Date().toISOString();

          const update: PartnerLocationUpdate = {
            partnerId,
            orderId,
            latitude,
            longitude,
            accuracy: accuracy || undefined,
            speed: speed || undefined,
            heading: heading || undefined,
            timestamp,
            isRealGps: true
          };

          setActiveLocationUpdate(update);
          setIsRealGpsTrackingActive(true);

          // Push initial coordinate
          pushGpsLocationToSupabase(update);

          // Watch position continuously
          const watchId = navigator.geolocation.watchPosition(
            (livePos) => {
              const liveUpdate: PartnerLocationUpdate = {
                partnerId,
                orderId,
                latitude: livePos.coords.latitude,
                longitude: livePos.coords.longitude,
                accuracy: livePos.coords.accuracy || undefined,
                speed: livePos.coords.speed || undefined,
                heading: livePos.coords.heading || undefined,
                timestamp: new Date().toISOString(),
                isRealGps: true
              };

              setActiveLocationUpdate(liveUpdate);
              pushGpsLocationToSupabase(liveUpdate);

              // Update partner in local state
              setPartners((prev) =>
                prev.map((p) =>
                  p.id === partnerId
                    ? {
                        ...p,
                        lastLatitude: livePos.coords.latitude,
                        lastLongitude: livePos.coords.longitude,
                        lastGpsUpdate: liveUpdate.timestamp,
                        isGpsActive: true,
                        isRealGps: true
                      }
                    : p
                )
              );
            },
            (err) => {
              console.warn("Watch position notice:", err.message);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 1000
            }
          );

          watchPositionIdRef.current = watchId;
          showToast("Live GPS tracking broadcasting to Supabase!");
          resolve(true);
        },
        (err) => {
          let msg = "Could not access device GPS.";
          if (err.code === 1) {
            msg = "Location permission denied. Please allow location access in your browser.";
          } else if (err.code === 2) {
            msg = "Location unavailable. Please verify GPS is enabled.";
          }
          setGpsTrackingError(msg);
          showToast(msg);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  const stopRealGpsTracking = () => {
    if (watchPositionIdRef.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchPositionIdRef.current);
      watchPositionIdRef.current = null;
    }
    setIsRealGpsTrackingActive(false);
    showToast("GPS tracking stopped");
  };

  // Simulate an incoming order from Swiggy, Zomato or Online
  const simulateIncomingOrder = (forcedPlatform?: OrderPlatform) => {
    const platforms: OrderPlatform[] = ["Swiggy", "Zomato", "Customer-Online"];
    const platform = forcedPlatform || platforms[Math.floor(Math.random() * platforms.length)];
    const randomDish1 = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
    const randomDish2 = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];

    const customersNames = [
      { name: "Rohit Sardesai", phone: "+91 98223 99120", addr: "Bhandarkar Road, Pune" },
      { name: "Sneha Deshpande", phone: "+91 97654 31209", addr: "Baner Road, Pune" },
      { name: "Tanmay Joshi", phone: "+91 98810 56743", addr: "Senapati Bapat Road, Pune" },
      { name: "Priyanka Shinde", phone: "+91 99231 87654", addr: "Kalyani Nagar, Pune" }
    ];
    const customer = customersNames[Math.floor(Math.random() * customersNames.length)];

    const qty1 = 1;
    const qty2 = Math.random() > 0.5 ? 1 : 2;
    const subtotal = randomDish1.price * qty1 + randomDish2.price * qty2;
    const tax = +(subtotal * 0.05).toFixed(2);
    const deliveryFee = 30;

    createOrder({
      platform,
      orderType: "Home Delivery",
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: customer.addr,
      items: [
        { id: randomDish1.id, name: randomDish1.name, price: randomDish1.price, quantity: qty1, isVeg: randomDish1.isVeg },
        { id: randomDish2.id, name: randomDish2.name, price: randomDish2.price, quantity: qty2, isVeg: randomDish2.isVeg }
      ],
      subtotal,
      tax,
      deliveryFee,
      discount: 0,
      grandTotal: subtotal + tax + deliveryFee,
      status: "Incoming",
      deliveryStage: "Order Placed",
      paymentMethod: "Prepaid",
      paymentStatus: "Paid"
    });
  };

  // Table actions
  const toggleTableStatus = (tableNum: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.number !== tableNum) return t;
        const nextStatus = t.status === "available" ? "occupied" : "available";
        return {
          ...t,
          status: nextStatus,
          currentBill: nextStatus === "available" ? 0 : 350,
          dinerCount: nextStatus === "available" ? 0 : 2
        };
      })
    );
  };

  const vacateAllTables = () => {
    setTables((prev) =>
      prev.map((t) => ({
        ...t,
        status: "available",
        currentOrderId: undefined,
        currentBill: 0,
        dinerCount: 0
      }))
    );
    showToast("All 15 tables marked Available");
  };

  const settleTable = (tableNum: number) => {
    const table = tables.find((t) => t.number === tableNum);
    if (!table || table.status === "available") return;
    const relatedOrder = orders.find((o) => o.tableNumber === tableNum && o.status !== "Delivered");
    if (relatedOrder) {
      openBillModal(relatedOrder);
      updateOrderStatus(relatedOrder.id, "Delivered");
    }
    setTables((prev) =>
      prev.map((t) =>
        t.number === tableNum
          ? {
              ...t,
              status: "available",
              currentOrderId: undefined,
              currentBill: 0,
              dinerCount: 0
            }
          : t
      )
    );
    showToast(`Table ${tableNum} settled and cleared`);
  };

  // Fleet management
  const addDeliveryPartner = (data: {
    name: string;
    phone: string;
    avatar: string;
    vehicleType: "Motorbike" | "Electric Scooter" | "Bicycle";
    vehicleNumber: string;
  }) => {
    const newPartner: DeliveryPartner = {
      id: `DP-${100 + partners.length + 1}`,
      ...data,
      status: "Available",
      completedDeliveries: 0,
      rating: 5.0,
      lastLatitude: settings.latitude,
      lastLongitude: settings.longitude,
      lastGpsUpdate: new Date().toISOString(),
      isGpsActive: false,
      isRealGps: false
    };
    setPartners((prev) => [...prev, newPartner]);
    showToast(`Delivery partner ${data.name} enrolled`);
  };

  const updatePartnerStatus = (partnerId: string, status: DeliveryPartner["status"]) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === partnerId ? { ...p, status } : p))
    );
    showToast("Partner status updated");
  };

  // Restock inventory
  const restockItem = (itemId: string, qty: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              currentStock: +(item.currentStock + qty).toFixed(2),
              status: "Optimal"
            }
          : item
      )
    );
    showToast("Stock inventory replenished");
  };

  // Expenses
  const addExpense = (exp: Omit<CafeExpense, "id">) => {
    const newExp: CafeExpense = {
      id: `EXP-${100 + expenses.length + 1}`,
      ...exp
    };
    setExpenses((prev) => [newExp, ...prev]);
    showToast(`Expense recorded: ₹${exp.amount}`);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast("Expense removed");
  };

  // Order Cancellation Handlers
  const openCancelModal = (order: Order) => setSelectedCancelOrder(order);
  const closeCancelModal = () => setSelectedCancelOrder(null);

  const cancelOrder = (orderId: string, reason: string) => {
    const orderToCancel = orders.find((o) => o.id === orderId);
    if (!orderToCancel) return;

    const updatedOrders = orders.map((o) => {
      if (o.id !== orderId) return o;
      const cancelled: Order = {
        ...o,
        status: "Cancelled",
        cancelReason: reason,
        cancelledAt: new Date().toISOString()
      };
      saveOrderToSupabase(cancelled);
      return cancelled;
    });

    setOrders(updatedOrders);

    // If dine-in, free table
    if (orderToCancel.tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.number === orderToCancel.tableNumber
            ? { ...t, status: "available", currentOrderId: undefined, currentBill: 0, dinerCount: 0 }
            : t
        )
      );
    }

    // If partner assigned, set partner back to Available
    if (orderToCancel.deliveryPartnerId) {
      setPartners((prev) =>
        prev.map((p) =>
          p.id === orderToCancel.deliveryPartnerId
            ? { ...p, status: "Available", assignedOrderId: undefined }
            : p
        )
      );
    }

    closeCancelModal();
    showToast(`Order #${orderId} was cancelled (${reason})`);
  };

  // Feedback Handlers
  const openFeedbackModal = (order: Order) => setSelectedFeedbackOrder(order);
  const closeFeedbackModal = () => setSelectedFeedbackOrder(null);

  const submitFeedback = (fbData: Omit<OrderFeedback, "id" | "createdAt">) => {
    const newFeedback: OrderFeedback = {
      id: `FB-${100 + feedbacks.length + 1}`,
      createdAt: "Just now",
      ...fbData
    };

    setFeedbacks((prev) => [newFeedback, ...prev]);

    // Mark order as rated
    setOrders((prev) =>
      prev.map((o) =>
        o.id === fbData.orderId
          ? { ...o, feedbackSubmitted: true, rating: fbData.rating }
          : o
      )
    );

    closeFeedbackModal();
    showToast(`Thank you! Feedback received (${fbData.rating} ★)`);
  };

  return (
    <RestaurantContext.Provider
      value={{
        settings,
        updateSettings,
        currentRole,
        currentUser,
        switchRole,
        staffList: INITIAL_STAFF,
        orders,
        partners,
        tables,
        inventory,
        customers,
        expenses,
        activeView,
        setActiveView,
        activeTrackOrderId,
        setActiveTrackOrderId,
        soundEnabled,
        setSoundEnabled,
        selectedBillOrder,
        openBillModal,
        closeBillModal,
        notificationToast,
        showToast,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        createOrder,
        updateOrderStatus,
        advanceDeliveryStage,
        assignPartner,
        simulateIncomingOrder,
        toggleTableStatus,
        vacateAllTables,
        settleTable,
        addDeliveryPartner,
        updatePartnerStatus,
        isRealGpsTrackingActive,
        gpsTrackingError,
        startRealGpsTracking,
        stopRealGpsTracking,
        activeLocationUpdate,
        restockItem,
        addExpense,
        deleteExpense,
        cancelOrder,
        selectedCancelOrder,
        openCancelModal,
        closeCancelModal,
        feedbacks,
        submitFeedback,
        selectedFeedbackOrder,
        openFeedbackModal,
        closeFeedbackModal,
        supabaseConnected,
        checkSupabaseStatus
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error("useRestaurant must be used within RestaurantProvider");
  return context;
};
