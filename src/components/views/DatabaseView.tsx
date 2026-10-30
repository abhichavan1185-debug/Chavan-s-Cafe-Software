import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import schemaSql from "../../../supabase/schema.sql?raw";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Database,
  Download,
  ExternalLink,
  HardDrive,
  RefreshCw,
  ShieldCheck,
  Upload
} from "lucide-react";

export const DatabaseView: React.FC = () => {
  const {
    settings,
    orders,
    partners,
    tables,
    inventory,
    customers,
    expenses,
    feedbacks,
    menuItems,
    userEmail,
    supabaseConnected,
    showToast,
    restoreCafeBackup,
    syncAllCafeData
  } = useRestaurant();
  const [status, setStatus] = useState("");
  const [statusIsError, setStatusIsError] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const downloadBackup = () => {
    const backup = {
      version: "4.0",
      timestamp: new Date().toISOString(),
      restaurant: settings.name,
      data: {
        settings,
        orders,
        partners,
        tables,
        inventory,
        customers,
        expenses,
        feedbacks,
        menuItems
      }
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `cafe-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Cafe backup downloaded.");
  };

  const restoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !window.confirm(
        "Restore this backup to Supabase? Matching cafe records will be replaced, and records missing from the backup will be removed."
      )
    ) {
      return;
    }

    setIsBusy(true);
    setStatus("Restoring backup to Supabase...");
    setStatusIsError(false);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const backup: unknown = JSON.parse(String(reader.result || ""));
        await restoreCafeBackup(backup);
        setStatus("Backup restored to Supabase successfully.");
        showToast("Cafe backup restored.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not restore the backup.";
        setStatus(message);
        setStatusIsError(true);
        showToast(message);
      } finally {
        setIsBusy(false);
      }
    };
    reader.onerror = () => {
      setStatus("Could not read the selected backup file.");
      setStatusIsError(true);
      setIsBusy(false);
    };
    reader.readAsText(file);
  };

  const syncData = async () => {
    setIsBusy(true);
    setStatus("Syncing cafe data to Supabase...");
    setStatusIsError(false);
    try {
      await syncAllCafeData();
      setStatus("All cafe data was synced to Supabase.");
      showToast("Cafe data synced.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not sync cafe data.";
      setStatus(message);
      setStatusIsError(true);
      showToast(message);
    } finally {
      setIsBusy(false);
    }
  };

  const copySchema = async () => {
    try {
      await navigator.clipboard.writeText(schemaSql);
      setCopied(true);
      showToast("Secure Supabase setup SQL copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not copy the SQL script.";
      setStatus(message);
      setStatusIsError(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 overflow-y-auto bg-stone-100 p-4 font-sans sm:p-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-900 text-amber-200">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Cafe data & backups</h2>
            <p className="mt-1 text-xs text-stone-500">
              Signed in as {userEmail} · {supabaseConnected ? "Supabase connected" : "Supabase unavailable"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadBackup}
            className="flex items-center gap-2 rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100"
          >
            <Download className="h-4 w-4" />
            Download backup
          </button>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber-900 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-amber-800">
            <Upload className="h-4 w-4" />
            Restore backup to cloud
            <input type="file" accept=".json,application/json" onChange={restoreBackup} className="hidden" />
          </label>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-stone-900">Private staff access</h3>
          </div>
          <p className="text-sm leading-relaxed text-stone-600">
            Cafe records are loaded from Supabase after a staff member signs in. Only accounts
            added to this cafe&apos;s membership list can access the shared data.
          </p>
          <p className="text-xs text-amber-900">
            Backups contain customer and cafe information. Keep downloaded files private.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void syncData()}
              disabled={isBusy || !supabaseConnected}
              className="flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isBusy ? "animate-spin" : ""}`} />
              Sync all cafe data
            </button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              Open Supabase
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          {status && (
            <div
              role="status"
              className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                statusIsError
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              {statusIsError ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              {status}
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <HardDrive className="h-4 w-4 text-amber-800" />
            <h3 className="text-sm font-bold text-stone-900">Shared cafe records</h3>
          </div>
          {[
            ["Orders", orders.length],
            ["Menu items", menuItems.length],
            ["Customers", customers.length],
            ["Delivery partners", partners.length],
            ["Inventory items", inventory.length],
            ["Expenses", expenses.length],
            ["Tables", tables.length],
            ["Feedback entries", feedbacks.length]
          ].map(([label, count]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-xs">
              <span className="text-stone-600">{label}</span>
              <span className="font-mono font-bold text-stone-900">{count}</span>
            </div>
          ))}
        </section>
      </div>

      <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-stone-900">One-time secure Supabase setup</h3>
            <p className="mt-1 text-xs leading-relaxed text-stone-500">
              Run the schema from <code>supabase/schema.sql</code> in Supabase SQL Editor before
              staff sign in. Never use a service-role key in the browser.
            </p>
          </div>
          <button
            onClick={() => void copySchema()}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-stone-900 px-3.5 py-2.5 text-xs font-bold text-amber-300 hover:bg-stone-800"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy setup SQL"}
          </button>
        </div>
      </section>
    </div>
  );
};
