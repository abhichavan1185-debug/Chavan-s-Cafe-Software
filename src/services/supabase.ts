import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import {
  Order,
  MenuItem,
  InventoryItem,
  DeliveryPartner,
  CustomerProfile,
  CafeExpense,
  PartnerLocationUpdate
} from "../types";

let cachedClient: SupabaseClient | null = null;
let activeLocationChannel: RealtimeChannel | null = null;

export const getSupabaseConfig = () => {
  const url =
    localStorage.getItem("shrus_supabase_url") ||
    (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : "") ||
    "";
  const key =
    localStorage.getItem("shrus_supabase_key") ||
    (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : "") ||
    "";
  return { url: url.trim(), key: key.trim() };
};

export const setSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem("shrus_supabase_url", url.trim());
  localStorage.setItem("shrus_supabase_key", key.trim());
  cachedClient = null; // reset cached client
};

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
    } catch (e) {
      console.warn("[Supabase] Failed to initialize client:", e);
      return null;
    }
  }
  return cachedClient;
};

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: "Supabase URL and Anon Key are required. Enter them below."
    };
  }

  try {
    // Quick test against any table or system ping
    const { data, error } = await client
      .from("shrus_cafe_settings")
      .select("id")
      .limit(1);

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      return {
        success: false,
        message: `Connection error: ${error.message}`
      };
    }

    if (error && error.code === "42P01") {
      // Table doesn't exist yet, but credentials ARE valid!
      return {
        success: true,
        message: "Supabase connected! Tables not created yet - run the SQL script below in Supabase SQL Editor."
      };
    }

    return {
      success: true,
      message: "Successfully connected to Shru's Cafe Supabase database!"
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Failed to reach Supabase endpoint."
    };
  }
};

// Save a real device GPS location update to Supabase
export const pushGpsLocationToSupabase = async (
  update: PartnerLocationUpdate
): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("shrus_partner_locations").insert([
      {
        partner_id: update.partnerId,
        order_id: update.orderId || null,
        latitude: update.latitude,
        longitude: update.longitude,
        accuracy: update.accuracy || null,
        speed: update.speed || null,
        heading: update.heading || null,
        timestamp: update.timestamp,
        is_real_gps: update.isRealGps
      }
    ]);

    if (error) {
      console.warn("[Supabase GPS] Location insert notice:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

// Subscribe to real-time GPS location updates from delivery partners
export const subscribeToGpsLocations = (
  onLocationUpdate: (update: PartnerLocationUpdate) => void
): (() => void) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    if (activeLocationChannel) {
      activeLocationChannel.unsubscribe();
    }

    const channel = client
      .channel("shrus-realtime-gps")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shrus_partner_locations"
        },
        (payload) => {
          const rec = payload.new;
          if (rec && rec.partner_id && rec.latitude && rec.longitude) {
            onLocationUpdate({
              partnerId: rec.partner_id,
              orderId: rec.order_id,
              latitude: Number(rec.latitude),
              longitude: Number(rec.longitude),
              accuracy: rec.accuracy ? Number(rec.accuracy) : undefined,
              speed: rec.speed ? Number(rec.speed) : undefined,
              heading: rec.heading ? Number(rec.heading) : undefined,
              timestamp: rec.timestamp || new Date().toISOString(),
              isRealGps: rec.is_real_gps ?? true
            });
          }
        }
      )
      .subscribe();

    activeLocationChannel = channel;

    return () => {
      channel.unsubscribe();
    };
  } catch (err) {
    console.warn("[Supabase] Failed to subscribe to GPS changes:", err);
    return () => {};
  }
};

// Sync order to Supabase
export const saveOrderToSupabase = async (order: Order): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("shrus_orders").upsert(
      [
        {
          id: order.id,
          invoice_number: order.invoiceNumber || `SHRU-INV-${order.id}`,
          platform: order.platform,
          order_type: order.orderType,
          table_number: order.tableNumber || null,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          delivery_address: order.deliveryAddress || null,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          delivery_fee: order.deliveryFee,
          discount: order.discount,
          coupon_code: order.couponCode || null,
          grand_total: order.grandTotal,
          status: order.status,
          delivery_stage: order.deliveryStage,
          delivery_partner_id: order.deliveryPartnerId || null,
          payment_method: order.paymentMethod,
          payment_status: order.paymentStatus,
          created_at: order.createdAt
        }
      ],
      { onConflict: "id" }
    );

    if (error) {
      console.warn("[Supabase] Order upsert notice:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

// Complete Production SQL Schema for Shru's Cafe
export const generateSupabaseSchemaSql = (): string => {
  return `-- ====================================================================
-- SHRU'S CAFE - POSTGRESQL SCHEMA FOR SUPABASE FREE PLAN
-- Professional Cafe POS, Billing, Management, Inventory & GPS Tracking
-- ====================================================================

-- 1. CAFE SETTINGS
CREATE TABLE IF NOT EXISTS public.shrus_cafe_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    name TEXT NOT NULL DEFAULT 'SHRU''S CAFE',
    tagline TEXT DEFAULT 'Artisanal Roastery & Gourmet Kitchen',
    phone TEXT DEFAULT '+91 98220 12345',
    email TEXT DEFAULT 'contact@shruscafe.com',
    address TEXT DEFAULT 'FC Road, Deccan Gymkhana, Pune, Maharashtra 411004',
    gstin TEXT DEFAULT '27AABCU9603R1ZM',
    fssai TEXT DEFAULT '11521034000412',
    upi_id TEXT DEFAULT 'shruscafe@upi',
    gst_rate_percent NUMERIC(4,2) DEFAULT 5.00,
    packaging_charge NUMERIC(6,2) DEFAULT 15.00,
    delivery_charge NUMERIC(6,2) DEFAULT 30.00,
    latitude NUMERIC(9,6) DEFAULT 18.5196,
    longitude NUMERIC(9,6) DEFAULT 73.8415,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FOOD MENU ITEMS
CREATE TABLE IF NOT EXISTS public.shrus_menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(8,2) NOT NULL,
    cost_price NUMERIC(8,2) DEFAULT 0,
    is_veg BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    prep_time TEXT DEFAULT '10 mins',
    image_url TEXT,
    is_bestseller BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    rating NUMERIC(3,2) DEFAULT 4.8,
    stock_qty INTEGER DEFAULT 999,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on category for rapid POS filtering
CREATE INDEX IF NOT EXISTS idx_shrus_menu_category ON public.shrus_menu_items(category);

-- 3. CUSTOMER PROFILES (CRM)
CREATE TABLE IF NOT EXISTS public.shrus_customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    address TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(10,2) DEFAULT 0.00,
    tier TEXT DEFAULT 'Regular',
    last_ordered_at TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shrus_customers_phone ON public.shrus_customers(phone);

-- 4. DELIVERY PARTNERS
CREATE TABLE IF NOT EXISTS public.shrus_delivery_partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar TEXT,
    vehicle_type TEXT DEFAULT 'Motorbike',
    vehicle_number TEXT,
    status TEXT DEFAULT 'Available',
    assigned_order_id TEXT,
    completed_deliveries INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 4.9,
    last_latitude NUMERIC(9,6),
    last_longitude NUMERIC(9,6),
    last_gps_update TIMESTAMPTZ,
    is_gps_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS & INVOICES
CREATE TABLE IF NOT EXISTS public.shrus_orders (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE,
    platform TEXT NOT NULL DEFAULT 'POS',
    order_type TEXT NOT NULL DEFAULT 'Dine-In',
    table_number INTEGER,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    coupon_code TEXT,
    grand_total NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Accepted',
    delivery_stage TEXT NOT NULL DEFAULT 'Order Placed',
    delivery_partner_id TEXT REFERENCES public.shrus_delivery_partners(id) ON DELETE SET NULL,
    payment_method TEXT NOT NULL DEFAULT 'Cash',
    payment_status TEXT NOT NULL DEFAULT 'Paid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shrus_orders_status ON public.shrus_orders(status);
CREATE INDEX IF NOT EXISTS idx_shrus_orders_created_at ON public.shrus_orders(created_at);

-- 6. REAL-TIME GPS PARTNER LOCATIONS (Actual Device Coordinates)
CREATE TABLE IF NOT EXISTS public.shrus_partner_locations (
    id BIGSERIAL PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES public.shrus_delivery_partners(id) ON DELETE CASCADE,
    order_id TEXT,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    accuracy NUMERIC(8,2),
    speed NUMERIC(6,2),
    heading NUMERIC(6,2),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_real_gps BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_shrus_gps_partner_time ON public.shrus_partner_locations(partner_id, timestamp DESC);

-- 7. INVENTORY & STOCK
CREATE TABLE IF NOT EXISTS public.shrus_inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'kg',
    min_threshold NUMERIC(10,2) NOT NULL DEFAULT 5,
    status TEXT DEFAULT 'Optimal',
    cost_per_unit NUMERIC(8,2) NOT NULL DEFAULT 0,
    supplier_name TEXT,
    last_restocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXPENSES
CREATE TABLE IF NOT EXISTS public.shrus_expenses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    paid_to TEXT NOT NULL,
    payment_mode TEXT DEFAULT 'UPI',
    date TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DINE-IN TABLES
CREATE TABLE IF NOT EXISTS public.shrus_tables (
    id INTEGER PRIMARY KEY,
    number INTEGER NOT NULL UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'available',
    current_order_id TEXT,
    current_bill NUMERIC(8,2) DEFAULT 0,
    diner_count INTEGER DEFAULT 0
);

-- 10. ENABLE ROW LEVEL SECURITY & OPEN POLICIES FOR SUPABASE FREE PLAN
ALTER TABLE public.shrus_cafe_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shrus_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shrus_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shrus_delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shrus_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shrus_partner_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shrus_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shrus_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shrus_tables ENABLE ROW LEVEL SECURITY;

-- Allow read & write with standard anon key
CREATE POLICY "Anon Full Access Settings" ON public.shrus_cafe_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Menu" ON public.shrus_menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Customers" ON public.shrus_customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Partners" ON public.shrus_delivery_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Orders" ON public.shrus_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access GPS" ON public.shrus_partner_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Inventory" ON public.shrus_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Expenses" ON public.shrus_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Tables" ON public.shrus_tables FOR ALL USING (true) WITH CHECK (true);

-- 11. ENABLE REALTIME BROADCAST FOR GPS AND ORDERS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'shrus_partner_locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shrus_partner_locations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'shrus_orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shrus_orders;
  END IF;
END $$;
`;
};
