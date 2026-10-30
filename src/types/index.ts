export type UserRole = "ADMIN" | "MANAGER" | "CASHIER" | "KITCHEN STAFF" | "DELIVERY PARTNER";

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  phone?: string;
  email?: string;
}

export type CategoryName =
  | "Coffee"
  | "Tea"
  | "Cold Coffee"
  | "Milkshakes"
  | "Fresh Juices"
  | "Mocktails"
  | "Breakfast"
  | "Sandwiches"
  | "Burgers"
  | "Pizza"
  | "Chinese"
  | "Momos"
  | "Noodles"
  | "Manchurian"
  | "South Indian"
  | "North Indian"
  | "Veg Food"
  | "Non-Veg Food"
  | "Biryani"
  | "Desserts"
  | "Cakes"
  | "Snacks"
  | "Fast Food"
  // Legacy mappings for backwards compatibility
  | "Tea & Coffee"
  | "Hot Beverages"
  | "Chinese Veg"
  | "Chinese Non-Veg"
  | "Indian Veg"
  | "Indian Non-Veg"
  | "Burger"
  | "Pasta"
  | "Maggi"
  | "French Fries"
  | "Rolls & Wraps"
  | "Bakery"
  | "Cakes & Pastries"
  | "Ice Cream"
  | "Soft Drinks"
  | "Combos & Family Meals";

export interface RecipeIngredient {
  inventoryItemId: string;
  quantity: number; // Qty deducted per unit ordered
}

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryName;
  price: number;
  costPrice?: number;
  isVeg: boolean;
  desc: string;
  prepTime: string;
  image: string;
  isBestseller?: boolean;
  isAvailable: boolean;
  rating: number;
  stockQty?: number;
  recipe?: RecipeIngredient[];
}

export type OrderPlatform = "POS" | "Customer-Online" | "Swiggy" | "Zomato";
export type OrderType = "Dine-In" | "Takeaway" | "Home Delivery" | "Online order";

export type DeliveryStage =
  | "Order Placed"
  | "Restaurant Accepted"
  | "Food Preparing"
  | "Food Ready"
  | "Delivery Partner Assigned"
  | "Delivery Partner Arrived"
  | "Order Picked Up"
  | "On The Way"
  | "Near Customer"
  | "Delivered";

export type OrderStatus =
  | "Incoming"
  | "Accepted"
  | "Cooking"
  | "Ready"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicleType: "Motorbike" | "Electric Scooter" | "Bicycle";
  vehicleNumber: string;
  status: "Available" | "Assigned" | "Picking Up" | "Delivering" | "Offline";
  assignedOrderId?: string;
  completedDeliveries: number;
  rating: number;
  lastLatitude?: number;
  lastLongitude?: number;
  lastGpsUpdate?: string;
  isGpsActive?: boolean;
  isRealGps?: boolean;
}

export interface PartnerLocationUpdate {
  partnerId: string;
  orderId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  isRealGps: boolean;
}

export interface Order {
  id: string;
  invoiceNumber?: string;
  platform: OrderPlatform;
  orderType: OrderType;
  tableNumber?: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryCoords?: { lat: number; lng: number };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  grandTotal: number;
  status: OrderStatus;
  deliveryStage: DeliveryStage;
  deliveryPartnerId?: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
  paymentMethod: "Cash" | "UPI / QR" | "Credit Card" | "Prepaid" | "Split (Cash + UPI)";
  paymentStatus: "Paid" | "Pending";
  // Route coordinates for live map tracking
  riderProgress?: number;
  riderCurrentLocation?: { lat: number; lng: number; isRealGps?: boolean };
  notes?: string;
  cancelReason?: string;
  cancelledAt?: string;
  feedbackSubmitted?: boolean;
  rating?: number;
}

export interface OrderFeedback {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface RestaurantTable {
  id: number;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "billing";
  currentOrderId?: string;
  currentBill?: number;
  dinerCount?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Dairy" | "Beverages" | "Pantry" | "Vegetables" | "Poultry" | "Packaging" | "Coffee & Tea";
  currentStock: number;
  unit: string;
  minThreshold: number;
  status: "Optimal" | "Low Stock" | "Critical";
  costPerUnit: number;
  supplierName?: string;
  lastRestockedAt?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  tier: "Regular" | "Silver" | "Gold VIP" | "Platinum Elite";
  lastOrderedAt: string;
}

export interface CafeExpense {
  id: string;
  title: string;
  category: "Raw Materials" | "Dairy & Milk" | "Kitchen Fuel / Gas" | "Staff Salary" | "Rent & Utilities" | "Maintenance" | "Other";
  amount: number;
  paidTo: string;
  paymentMode: "Cash" | "UPI" | "Bank Transfer";
  date: string;
  notes?: string;
}

export interface CafeSettings {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  fssai: string;
  upiId: string;
  gstRatePercent: number;
  packagingCharge: number;
  deliveryCharge: number;
  latitude: number;
  longitude: number;
}
