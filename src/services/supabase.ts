import { createClient, RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { PartnerLocationUpdate } from "../types";

let cachedClient: SupabaseClient | null = null;
let activeLocationChannel: RealtimeChannel | null = null;

export const getSupabaseConfig = () => {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    localStorage.getItem("shrus_supabase_url") ||
    "";
  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem("shrus_supabase_key") ||
    "";
  return { url: url.trim(), key: key.trim() };
};

export const setSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem("shrus_supabase_url", url.trim());
  localStorage.setItem("shrus_supabase_key", key.trim());
  cachedClient = null;
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
    } catch (error) {
      console.error("[Supabase] Could not initialize the client:", error);
      return null;
    }
  }
  return cachedClient;
};

export const pushGpsLocationToSupabase = async (
  update: PartnerLocationUpdate
): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from("shrus_partner_locations").insert({
      partner_id: update.partnerId,
      order_id: update.orderId || null,
      latitude: update.latitude,
      longitude: update.longitude,
      accuracy: update.accuracy || null,
      speed: update.speed || null,
      heading: update.heading || null,
      timestamp: update.timestamp,
      is_real_gps: update.isRealGps
    });

    if (error) {
      console.error("[Supabase GPS] Could not save location:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[Supabase GPS] Could not save location:", error);
    return false;
  }
};

export const subscribeToGpsLocations = (
  onLocationUpdate: (update: PartnerLocationUpdate) => void
): (() => void) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  if (activeLocationChannel) void activeLocationChannel.unsubscribe();

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
        const row = payload.new;
        if (!row.partner_id || !Number.isFinite(Number(row.latitude)) || !Number.isFinite(Number(row.longitude))) {
          return;
        }

        onLocationUpdate({
          partnerId: row.partner_id,
          orderId: row.order_id || undefined,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          accuracy: row.accuracy == null ? undefined : Number(row.accuracy),
          speed: row.speed == null ? undefined : Number(row.speed),
          heading: row.heading == null ? undefined : Number(row.heading),
          timestamp: row.timestamp || new Date().toISOString(),
          isRealGps: row.is_real_gps ?? true
        });
      }
    )
    .subscribe((status, error) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("[Supabase GPS] Realtime subscription failed:", error?.message || status);
      }
    });

  activeLocationChannel = channel;

  return () => {
    if (activeLocationChannel === channel) activeLocationChannel = null;
    void channel.unsubscribe();
  };
};
