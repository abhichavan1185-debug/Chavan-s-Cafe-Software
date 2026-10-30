import {
  DeliveryPartner,
  Order,
  RestaurantTable,
  InventoryItem,
  CustomerProfile,
  CafeExpense,
  UserProfile,
  CafeSettings,
  OrderFeedback
} from "../types";

export const CAFE_SETTINGS: CafeSettings = {
  name: "SHRU'S CAFE",
  tagline: "Artisanal Roastery & Gourmet Kitchen",
  phone: "+91 98220 12345",
  email: "orders@shruscafe.com",
  address: "FC Road, Deccan Gymkhana, Pune, Maharashtra 411004",
  gstin: "27AABCU9603R1ZM",
  fssai: "11521034000412",
  upiId: "shruscafe@upi",
  gstRatePercent: 5.0,
  packagingCharge: 15.0,
  deliveryCharge: 30.0,
  latitude: 18.5196,
  longitude: 73.8415
};

export const INITIAL_STAFF: UserProfile[] = [
  { id: "EMP-101", name: "Shruti (Founder & Owner)", role: "ADMIN", pin: "1185", phone: "+91 98220 12345", email: "admin@shruscafe.com" },
  { id: "EMP-102", name: "Rohan Deshmukh", role: "MANAGER", pin: "2201", phone: "+91 98221 44556", email: "manager@shruscafe.com" },
  { id: "EMP-103", name: "Kavita Rao", role: "CASHIER", pin: "3302", phone: "+91 98900 11223", email: "cashier@shruscafe.com" },
  { id: "EMP-104", name: "Chef Santosh K.", role: "KITCHEN STAFF", pin: "4403", phone: "+91 97654 33221", email: "kitchen@shruscafe.com" },
  { id: "EMP-105", name: "Ramesh Shinde", role: "DELIVERY PARTNER", pin: "5504", phone: "+91 98220 14210", email: "delivery@shruscafe.com" }
];

export const INITIAL_PARTNERS: DeliveryPartner[] = [
  {
    id: "DP-101",
    name: "Ramesh Shinde",
    phone: "+91 98220 14210",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    vehicleType: "Motorbike",
    vehicleNumber: "MH 12 AB 4819",
    status: "Delivering",
    assignedOrderId: "SW-8421",
    completedDeliveries: 412,
    rating: 4.9,
    lastLatitude: 18.528,
    lastLongitude: 73.855,
    lastGpsUpdate: new Date().toISOString(),
    isGpsActive: true,
    isRealGps: true
  },
  {
    id: "DP-102",
    name: "Sachin Kadam",
    phone: "+91 99214 78033",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    vehicleType: "Electric Scooter",
    vehicleNumber: "MH 12 EV 9012",
    status: "Available",
    completedDeliveries: 285,
    rating: 4.8,
    lastLatitude: 18.5196,
    lastLongitude: 73.8415,
    lastGpsUpdate: new Date().toISOString(),
    isGpsActive: false,
    isRealGps: false
  },
  {
    id: "DP-103",
    name: "Rahul Patil",
    phone: "+91 98501 32984",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    vehicleType: "Motorbike",
    vehicleNumber: "MH 14 DX 3310",
    status: "Picking Up",
    assignedOrderId: "ZM-3910",
    completedDeliveries: 530,
    rating: 4.95,
    lastLatitude: 18.521,
    lastLongitude: 73.843,
    lastGpsUpdate: new Date().toISOString(),
    isGpsActive: true,
    isRealGps: true
  },
  {
    id: "DP-104",
    name: "Amit Verma",
    phone: "+91 97632 55190",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    vehicleType: "Motorbike",
    vehicleNumber: "MH 12 QW 6109",
    status: "Available",
    completedDeliveries: 198,
    rating: 4.7,
    lastLatitude: 18.5196,
    lastLongitude: 73.8415,
    lastGpsUpdate: new Date().toISOString(),
    isGpsActive: false,
    isRealGps: false
  },
  {
    id: "DP-105",
    name: "Vikram Jadhav",
    phone: "+91 98902 44102",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    vehicleType: "Electric Scooter",
    vehicleNumber: "MH 12 EV 7721",
    status: "Available",
    completedDeliveries: 340,
    rating: 4.85,
    lastLatitude: 18.5196,
    lastLongitude: 73.8415,
    lastGpsUpdate: new Date().toISOString(),
    isGpsActive: false,
    isRealGps: false
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "SW-8421",
    invoiceNumber: "SHRU-INV-2026-8421",
    platform: "Swiggy",
    orderType: "Home Delivery",
    customerName: "Ananya Roy",
    customerPhone: "+91 98192 34510",
    deliveryAddress: "Flat 402, Clover Highlands, NIBM Road, Pune",
    deliveryCoords: { lat: 18.5362, lng: 73.8942 },
    items: [
      { id: "TC-101", name: "Special Irani Chai", price: 25, quantity: 2, isVeg: true },
      { id: "BK-2401", name: "Irani Bun Maska", price: 45, quantity: 2, isVeg: true },
      { id: "BF-2301", name: "Puneri Misal Pav with Farsan", price: 80, quantity: 1, isVeg: true }
    ],
    subtotal: 220,
    tax: 11,
    deliveryFee: 30,
    discount: 0,
    grandTotal: 261,
    status: "Out for Delivery",
    deliveryStage: "On The Way",
    deliveryPartnerId: "DP-101",
    createdAt: "10 mins ago",
    estimatedDeliveryTime: "12 mins",
    paymentMethod: "Prepaid",
    paymentStatus: "Paid",
    riderProgress: 0.65,
    riderCurrentLocation: { lat: 18.528, lng: 73.855, isRealGps: true }
  },
  {
    id: "ZM-3910",
    invoiceNumber: "SHRU-INV-2026-3910",
    platform: "Zomato",
    orderType: "Home Delivery",
    customerName: "Aditya Sawant",
    customerPhone: "+91 99201 45678",
    deliveryAddress: "Lane 7, Koregaon Park, Near Starbucks, Pune",
    deliveryCoords: { lat: 18.5362, lng: 73.8942 },
    items: [
      { id: "BY-1401", name: "Chicken Dum Biryani", price: 230, quantity: 2, isVeg: false },
      { id: "CC-301", name: "Classic Cold Coffee", price: 90, quantity: 2, isVeg: true },
      { id: "DS-2701", name: "Sizzling Brownie with Ice Cream", price: 140, quantity: 1, isVeg: true }
    ],
    subtotal: 780,
    tax: 39,
    deliveryFee: 35,
    discount: 50,
    couponCode: "ZOMATO50",
    grandTotal: 804,
    status: "Ready",
    deliveryStage: "Delivery Partner Arrived",
    deliveryPartnerId: "DP-103",
    createdAt: "18 mins ago",
    estimatedDeliveryTime: "20 mins",
    paymentMethod: "Prepaid",
    paymentStatus: "Paid",
    riderProgress: 0.2,
    riderCurrentLocation: { lat: 18.521, lng: 73.843, isRealGps: true }
  },
  {
    id: "POS-1001",
    invoiceNumber: "SHRU-INV-2026-1001",
    platform: "POS",
    orderType: "Dine-In",
    tableNumber: 3,
    customerName: "Vikrant More",
    customerPhone: "+91 98221 89012",
    items: [
      { id: "SI-1201", name: "Butter Masala Dosa", price: 95, quantity: 2, isVeg: true },
      { id: "TC-103", name: "South Indian Filter Coffee", price: 45, quantity: 2, isVeg: true }
    ],
    subtotal: 280,
    tax: 14,
    deliveryFee: 0,
    discount: 0,
    grandTotal: 294,
    status: "Cooking",
    deliveryStage: "Food Preparing",
    createdAt: "8 mins ago",
    paymentMethod: "UPI / QR",
    paymentStatus: "Paid"
  },
  {
    id: "ONL-5520",
    invoiceNumber: "SHRU-INV-2026-5520",
    platform: "Customer-Online",
    orderType: "Home Delivery",
    customerName: "Pooja Kulkarni",
    customerPhone: "+91 98901 23456",
    deliveryAddress: "B-12, Rohan Mithila, Viman Nagar, Pune",
    deliveryCoords: { lat: 18.5679, lng: 73.9143 },
    items: [
      { id: "PZ-1502", name: "Paneer Tikka Pizza", price: 210, quantity: 1, isVeg: true },
      { id: "FF-2102", name: "Peri Peri Masala Fries", price: 95, quantity: 1, isVeg: true },
      { id: "MS-401", name: "Thick Chocolate Shake", price: 120, quantity: 1, isVeg: true }
    ],
    subtotal: 425,
    tax: 21.25,
    deliveryFee: 25,
    discount: 50,
    couponCode: "SHRU50",
    grandTotal: 421.25,
    status: "Accepted",
    deliveryStage: "Restaurant Accepted",
    createdAt: "4 mins ago",
    estimatedDeliveryTime: "28 mins",
    paymentMethod: "UPI / QR",
    paymentStatus: "Paid",
    riderProgress: 0.05
  }
];

export const INITIAL_TABLES: RestaurantTable[] = Array.from({ length: 15 }, (_, i) => {
  const tableNum = i + 1;
  const isOcc = tableNum === 3;
  return {
    id: tableNum,
    number: tableNum,
    capacity: tableNum <= 4 ? 2 : tableNum <= 10 ? 4 : 6,
    status: isOcc ? "occupied" : "available",
    currentOrderId: isOcc ? "POS-1001" : undefined,
    currentBill: isOcc ? 294 : 0,
    dinerCount: isOcc ? 2 : 0
  };
});

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "INV-1", name: "Amul Pasteurised Butter", category: "Dairy", currentStock: 35, unit: "kg", minThreshold: 10, status: "Optimal", costPerUnit: 480, supplierName: "Amul Pune Depot" },
  { id: "INV-2", name: "Fresh Cow Milk (Full Cream)", category: "Dairy", currentStock: 80, unit: "litres", minThreshold: 20, status: "Optimal", costPerUnit: 64, supplierName: "Chitale Dairy" },
  { id: "INV-3", name: "Fresh Malai Paneer", category: "Dairy", currentStock: 18, unit: "kg", minThreshold: 5, status: "Optimal", costPerUnit: 340, supplierName: "Chitale Dairy" },
  { id: "INV-4", name: "Arabica & Chicory Coffee Blend", category: "Coffee & Tea", currentStock: 12.5, unit: "kg", minThreshold: 4, status: "Optimal", costPerUnit: 850, supplierName: "Blue Tokai Wholesale" },
  { id: "INV-5", name: "Assam CTC Chai Leaves", category: "Coffee & Tea", currentStock: 22, unit: "kg", minThreshold: 6, status: "Optimal", costPerUnit: 420, supplierName: "Wagh Bakri Traders" },
  { id: "INV-6", name: "Fresh Farm Chicken Breast", category: "Poultry", currentStock: 25, unit: "kg", minThreshold: 8, status: "Optimal", costPerUnit: 240, supplierName: "Venky's Farms" },
  { id: "INV-7", name: "Aged Daawat Basmati Rice", category: "Pantry", currentStock: 65, unit: "kg", minThreshold: 15, status: "Optimal", costPerUnit: 125, supplierName: "Market Yard Wholesale" },
  { id: "INV-8", name: "Fresh Pav (Bakery Pairs)", category: "Packaging", currentStock: 140, unit: "pairs", minThreshold: 30, status: "Optimal", costPerUnit: 8, supplierName: "Hindustan Bakery" },
  { id: "INV-9", name: "Eco Kraft Delivery Boxes & Bags", category: "Packaging", currentStock: 350, unit: "pcs", minThreshold: 100, status: "Optimal", costPerUnit: 12, supplierName: "EcoPack Solutions" },
  { id: "INV-10", name: "Belgian Cocoa Couverture", category: "Pantry", currentStock: 6.5, unit: "kg", minThreshold: 3, status: "Optimal", costPerUnit: 950, supplierName: "Callebaut Importers" }
];

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  { id: "CUST-1", name: "Vikrant More", phone: "+91 98221 89012", email: "vikrant.m@gmail.com", address: "Kothrud, Pune", totalOrders: 24, totalSpent: 7850, tier: "Gold VIP", lastOrderedAt: "Today, 10:45 AM" },
  { id: "CUST-2", name: "Ananya Roy", phone: "+91 98192 34510", email: "ananya.roy@yahoo.com", address: "Clover Highlands, Pune", totalOrders: 16, totalSpent: 5200, tier: "Silver", lastOrderedAt: "Today, 10:15 AM" },
  { id: "CUST-3", name: "Pooja Kulkarni", phone: "+91 98901 23456", email: "pooja.k@outlook.com", address: "Rohan Mithila, Viman Nagar", totalOrders: 38, totalSpent: 14200, tier: "Platinum Elite", lastOrderedAt: "Today, 11:02 AM" },
  { id: "CUST-4", name: "Aditya Sawant", phone: "+91 99201 45678", email: "aditya.sawant@gmail.com", address: "Lane 7, Koregaon Park", totalOrders: 9, totalSpent: 3650, tier: "Regular", lastOrderedAt: "Today, 09:50 AM" }
];

export const INITIAL_EXPENSES: CafeExpense[] = [
  { id: "EXP-101", title: "Daily Morning Chitale Milk (50 Litres)", category: "Dairy & Milk", amount: 3200, paidTo: "Chitale Dairy Center", paymentMode: "UPI", date: "Today, 06:30 AM", notes: "Regular morning batch" },
  { id: "EXP-102", title: "Commercial LPG Cylinder Refill (19kg)", category: "Kitchen Fuel / Gas", amount: 1850, paidTo: "Bharat Gas Agency", paymentMode: "UPI", date: "Yesterday", notes: "Kitchen cylinder #2" },
  { id: "EXP-103", title: "Market Yard Fresh Veg & Spices Batch", category: "Raw Materials", amount: 4600, paidTo: "Ganesh Traders Market Yard", paymentMode: "Cash", date: "2 days ago", notes: "Tomatoes, onions, paneer, coriander" },
  { id: "EXP-104", title: "Espresso Machine Deep Servicing", category: "Maintenance", amount: 1500, paidTo: "Sanremo Tech Pune", paymentMode: "Bank Transfer", date: "3 days ago", notes: "Group head gasket and descaling" }
];

export const INITIAL_FEEDBACKS: OrderFeedback[] = [
  {
    id: "FB-101",
    orderId: "SW-8421",
    customerName: "Ananya Roy",
    customerPhone: "+91 98192 34510",
    rating: 5,
    tags: ["Authentic Irani Chai", "Hot & Fresh", "Super Fast Delivery"],
    comment: "The Special Irani Chai and Bun Maska was out of the world! Truly authentic Pune taste.",
    createdAt: "Today, 11:30 AM"
  },
  {
    id: "FB-102",
    orderId: "POS-1001",
    customerName: "Vikrant More",
    customerPhone: "+91 98221 89012",
    rating: 5,
    tags: ["Crispy Dosa", "Filter Coffee"],
    comment: "Best filter coffee on FC Road. Crisp butter masala dosa served with hot sambar.",
    createdAt: "Today, 10:50 AM"
  },
  {
    id: "FB-103",
    orderId: "ZM-3910",
    customerName: "Aditya Sawant",
    customerPhone: "+91 99201 45678",
    rating: 4,
    tags: ["Aromatic Biryani", "Great Portion"],
    comment: "Loved the chicken dum biryani, packaging was neat and intact.",
    createdAt: "Yesterday, 08:15 PM"
  }
];

