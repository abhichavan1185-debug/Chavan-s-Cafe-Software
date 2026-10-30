import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import {
  getSupabaseConfig,
  setSupabaseConfig,
  testSupabaseConnection,
  generateSupabaseSchemaSql,
  saveOrderToSupabase
} from "../../services/supabase";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Server,
  HardDrive,
  Copy,
  Check,
  Sparkles,
  Radio,
  Lock,
  Layers
} from "lucide-react";

export const DatabaseView: React.FC = () => {
  const {
    orders,
    partners,
    tables,
    inventory,
    customers,
    expenses,
    settings,
    showToast,
    checkSupabaseStatus,
    supabaseConnected
  } = useRestaurant();

  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState<string>(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState<string>(currentConfig.key);
  const [syncStatus, setSyncStatus] = useState<"idle" | "testing" | "connected" | "error">(
    supabaseConnected ? "connected" : "idle"
  );
  const [statusMessage, setStatusMessage] = useState<string>(
    supabaseConnected ? "Connected to Shru's Cafe Supabase project" : ""
  );
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [isBulkSyncing, setIsBulkSyncing] = useState<boolean>(false);

  // Export full JSON backup
  const handleExportBackup = () => {
    const backupData = {
      version: "3.5",
      timestamp: new Date().toISOString(),
      restaurant: settings.name,
      settings,
      data: {
        orders,
        partners,
        tables,
        inventory,
        customers,
        expenses
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `shrus_cafe_permanent_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Full database backup downloaded successfully");
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data) {
          if (parsed.data.orders) localStorage.setItem("shrus_orders_v3", JSON.stringify(parsed.data.orders));
          if (parsed.data.partners) localStorage.setItem("shrus_partners_v3", JSON.stringify(parsed.data.partners));
          if (parsed.data.tables) localStorage.setItem("shrus_tables_v3", JSON.stringify(parsed.data.tables));
          if (parsed.data.inventory) localStorage.setItem("shrus_inventory_v3", JSON.stringify(parsed.data.inventory));
          if (parsed.data.customers) localStorage.setItem("shrus_customers_v3", JSON.stringify(parsed.data.customers));
          if (parsed.data.expenses) localStorage.setItem("shrus_expenses_v3", JSON.stringify(parsed.data.expenses));

          showToast("Backup restored! Reloading data...");
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          showToast("Invalid backup file format");
        }
      } catch (err) {
        showToast("Error reading backup JSON file");
      }
    };
    reader.readAsText(file);
  };

  // Test Supabase connection
  const handleTestSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setSyncStatus("error");
      setStatusMessage("Please enter both Supabase Project URL and Anon API Key.");
      return;
    }

    setSyncStatus("testing");
    setStatusMessage("Validating credentials with Supabase...");

    let formattedUrl = supabaseUrl.trim();
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = `https://${formattedUrl}`;
    }
    formattedUrl = formattedUrl.replace(/\/$/, "");

    setSupabaseConfig(formattedUrl, supabaseKey.trim());

    const result = await testSupabaseConnection();
    if (result.success) {
      setSyncStatus("connected");
      setStatusMessage(result.message);
      checkSupabaseStatus();
      showToast("Supabase connected & verified!");
    } else {
      setSyncStatus("error");
      setStatusMessage(result.message);
      showToast("Supabase connection failed");
    }
  };

  // Push existing local records into Supabase in bulk
  const handleBulkSyncToSupabase = async () => {
    if (!supabaseConnected) {
      showToast("Please connect to Supabase first.");
      return;
    }
    setIsBulkSyncing(true);
    showToast("Starting bulk sync to Supabase...");

    let successCount = 0;
    for (const order of orders) {
      const ok = await saveOrderToSupabase(order);
      if (ok) successCount++;
    }

    setIsBulkSyncing(false);
    showToast(`Bulk sync complete: ${successCount} orders uploaded to Supabase`);
  };

  const sampleSql = generateSupabaseSchemaSql();

  const handleCopySql = () => {
    navigator.clipboard.writeText(sampleSql);
    setCopiedSql(true);
    showToast("PostgreSQL schema copied to clipboard");
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 font-sans max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner & Status */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-700 to-amber-950 text-white flex items-center justify-center shadow-md">
            <Database className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">
                Supabase & Permanent Data Storage
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                PostgreSQL Free Plan
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Supabase is used strictly for permanent business records and live device GPS tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON Backup</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-xs cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Grid: Supabase Config + Database Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Supabase Config Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-700" />
              <h3 className="font-bold text-sm text-stone-900">
                Supabase Free Plan Credentials
              </h3>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>Open Supabase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzprojectid.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Found in: Project Settings → API → Project URL
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Supabase Anon (Public) API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Found in: Project Settings → API → anon / public key (Safe for client browsers)
              </span>
            </div>

            {/* Test & Save Button */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleTestSupabase}
                disabled={syncStatus === "testing"}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-800 to-stone-900 text-white font-bold text-xs hover:from-amber-700 hover:to-stone-800 shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === "testing" ? "animate-spin" : ""}`} />
                <span>Test & Link Supabase</span>
              </button>

              <button
                onClick={handleBulkSyncToSupabase}
                disabled={!supabaseConnected || isBulkSyncing}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition-all disabled:opacity-40"
              >
                <Upload className="w-3.5 h-3.5 text-amber-700" />
                <span>Sync All Orders to Cloud</span>
              </button>
            </div>

            {/* Status Feedback Box */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                  syncStatus === "connected"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : syncStatus === "error"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
              >
                {syncStatus === "connected" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{statusMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Data Counts & Storage Ledger (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-700" />
              <h3 className="font-bold text-sm text-stone-900">Persistent Table Counts</h3>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">Real-Time</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-600 font-medium">Orders & Tax Invoices</span>
              <span className="font-mono font-bold text-stone-900">{orders.length} Records</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-600 font-medium">Customer CRM Profiles</span>
              <span className="font-mono font-bold text-stone-900">{customers.length} Profiles</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-600 font-medium">Delivery Fleet Partners</span>
              <span className="font-mono font-bold text-stone-900">{partners.length} Riders</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-600 font-medium">Inventory & Raw Ingredients</span>
              <span className="font-mono font-bold text-stone-900">{inventory.length} SKUs</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-600 font-medium">Recorded Cafe Expenses</span>
              <span className="font-mono font-bold text-stone-900">{expenses.length} Records</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-stone-600 font-medium">Dine-In Tables</span>
              <span className="font-mono font-bold text-stone-900">{tables.length} Tables</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Schema SQL Generator */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <span>Ready-To-Run Supabase PostgreSQL Schema</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                RLS & Realtime Enabled
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Copy and execute this script once in your Supabase SQL Editor to bootstrap all tables and Realtime GPS broadcast.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? "Copied!" : "Copy SQL Script"}</span>
          </button>
        </div>

        {/* SQL Preview Box */}
        <pre className="bg-stone-900 text-amber-100/90 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-64 border border-stone-800 leading-relaxed">
          {sampleSql}
        </pre>
      </div>
    </div>
  );
};
