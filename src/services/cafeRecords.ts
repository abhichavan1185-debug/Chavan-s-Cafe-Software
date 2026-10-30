import { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase";

export type CafeCollection =
  | "settings"
  | "orders"
  | "partners"
  | "tables"
  | "inventory"
  | "customers"
  | "expenses"
  | "feedbacks"
  | "menu";

export interface CafeRecordRow {
  collection: CafeCollection;
  record_id: string;
  data: Record<string, unknown>;
}

const requireClient = () => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Supabase is not configured. Add the project URL and public anon key first.");
  }
  return client;
};

export const isCafeMember = async (userId: string): Promise<boolean> => {
  const { data, error } = await requireClient()
    .from("cafe_members")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Could not verify cafe access: ${error.message}`);
  return Boolean(data);
};

export const loadCafeRecords = async (): Promise<CafeRecordRow[]> => {
  const client = requireClient();
  const pageSize = 1000;
  const records: CafeRecordRow[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client
      .from("cafe_records")
      .select("collection, record_id, data")
      .order("collection")
      .order("record_id")
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error(`Could not load cafe data: ${error.message}`);
    const page = (data || []) as CafeRecordRow[];
    records.push(...page);
    if (page.length < pageSize) return records;
  }
};

export const saveCafeRecord = async (
  collection: CafeCollection,
  recordId: string,
  record: Record<string, unknown>
): Promise<void> => {
  await saveCafeRecords(collection, [{ recordId, data: record }]);
};

export const saveCafeRecords = async (
  collection: CafeCollection,
  records: Array<{ recordId: string; data: Record<string, unknown> }>
): Promise<void> => {
  if (!records.length) return;

  const client = requireClient();
  const batchSize = 500;
  for (let offset = 0; offset < records.length; offset += batchSize) {
    const batch = records.slice(offset, offset + batchSize);
    const { error } = await client.from("cafe_records").upsert(
      batch.map(({ recordId, data }) => ({
        collection,
        record_id: recordId,
        data,
        updated_at: new Date().toISOString()
      })),
      { onConflict: "collection,record_id" }
    );
    if (error) throw new Error(`Could not save ${collection} data: ${error.message}`);
  }
};

export const deleteCafeRecord = async (
  collection: CafeCollection,
  recordId: string
): Promise<void> => {
  const { error } = await requireClient()
    .from("cafe_records")
    .delete()
    .eq("collection", collection)
    .eq("record_id", recordId);

  if (error) throw new Error(`Could not delete ${collection} data: ${error.message}`);
};

export const subscribeToCafeRecords = (
  onChange: (event: "INSERT" | "UPDATE" | "DELETE", record: CafeRecordRow) => void
): (() => void) => {
  const channel: RealtimeChannel = requireClient()
    .channel("cafe-records")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "cafe_records" },
      (payload) => {
        const row = (payload.eventType === "DELETE" ? payload.old : payload.new) as CafeRecordRow;
        if (row?.collection && row.record_id) {
          onChange(payload.eventType, row);
        }
      }
    )
    .subscribe((status, error) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("[Supabase] Cafe realtime subscription failed:", error?.message || status);
      }
    });

  return () => {
    void channel.unsubscribe();
  };
};
