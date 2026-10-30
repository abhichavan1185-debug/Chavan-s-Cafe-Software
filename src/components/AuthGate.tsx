import React, { useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { AlertCircle, Coffee, KeyRound, LoaderCircle, LogIn, Mail, ShieldCheck } from "lucide-react";
import { isCafeMember } from "../services/cafeRecords";
import { getSupabaseClient, getSupabaseConfig, setSupabaseConfig } from "../services/supabase";

export interface AuthenticatedStaff {
  email: string;
  signOut: () => Promise<void>;
}

interface AuthGateProps {
  children: (staff: AuthenticatedStaff) => React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [config, setConfig] = useState(getSupabaseConfig);
  const [configRevision, setConfigRevision] = useState(0);
  const [localMode, setLocalMode] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [membershipError, setMembershipError] = useState("");
  const [membershipRevision, setMembershipRevision] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [configUrl, setConfigUrl] = useState(config.url);
  const [configKey, setConfigKey] = useState(config.key);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const client = useMemo(() => getSupabaseClient(), [configRevision]);

  useEffect(() => {
    if (!client) {
      setCheckingSession(false);
      setSession(null);
      return;
    }

    let active = true;
    setCheckingSession(true);
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setMembershipError("");
      }
    });

    void client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setFormError(`Could not check sign-in status: ${error.message}`);
        setSession(data.session);
      })
      .catch((error: unknown) => {
        if (active) {
          setFormError(error instanceof Error ? error.message : "Could not check sign-in status.");
        }
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (!session) {
      setCheckingMembership(false);
      setIsMember(false);
      return;
    }

    let active = true;
    setCheckingMembership(true);
    setIsMember(false);
    void isCafeMember(session.user.id)
      .then((member) => {
        if (active) setIsMember(member);
      })
      .catch((error: unknown) => {
        if (active) {
          setMembershipError(error instanceof Error ? error.message : "Could not verify staff access.");
        }
      })
      .finally(() => {
        if (active) setCheckingMembership(false);
      });

    return () => {
      active = false;
    };
  }, [membershipRevision, session]);

  const handleSaveConfig = (event: React.FormEvent) => {
    event.preventDefault();
    if (!configUrl.trim() || !configKey.trim()) {
      setFormError("Enter both the Supabase project URL and the public anon key.");
      return;
    }

    const normalizedUrl = configUrl.trim().startsWith("http")
      ? configUrl.trim()
      : `https://${configUrl.trim()}`;
    setSupabaseConfig(normalizedUrl.replace(/\/$/, ""), configKey.trim());
    setConfig(getSupabaseConfig());
    setFormError("");
    setCheckingSession(true);
    setConfigRevision((revision) => revision + 1);
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!client) return;
    setIsSubmitting(true);
    setFormError("");

    try {
      const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) setFormError(error.message);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw new Error(`Could not sign out: ${error.message}`);
  };

  if (!client && localMode) {
    return (
      <>
        <div className="fixed left-0 right-0 top-0 z-[100] bg-amber-800 px-3 py-1.5 text-center text-xs font-bold text-white">
          Demo mode: data is saved only in this browser and is not protected by staff sign-in.
        </div>
        <div className="pt-7">
          {children({
            email: "Local demo",
            signOut: async () => setLocalMode(false)
          })}
        </div>
      </>
    );
  }

  if (client && !checkingSession && session && !checkingMembership && isMember) {
    return <>{children({ email: session.user.email || "", signOut: handleSignOut })}</>;
  }

  const showConfigForm = !config.url || !config.key;

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-900 text-amber-100">
            <Coffee className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-stone-900">Cafe staff sign in</h1>
            <p className="text-sm text-stone-500">Private access to your cafe workspace</p>
          </div>
        </div>

        {showConfigForm ? (
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              Connect this app to your Supabase project using its project URL and public anon key.
              Never enter a service-role key here.
            </p>
            <label className="block text-sm font-semibold text-stone-700">
              Supabase project URL
              <input
                autoComplete="url"
                value={configUrl}
                onChange={(event) => setConfigUrl(event.target.value)}
                placeholder="https://your-project.supabase.co"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-mono text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-stone-700">
              Public anon key
              <input
                autoComplete="off"
                value={configKey}
                onChange={(event) => setConfigKey(event.target.value)}
                placeholder="Supabase public anon key"
                type="password"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-mono text-sm"
              />
            </label>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-900 px-4 py-3 font-bold text-white hover:bg-amber-800">
              <KeyRound className="h-4 w-4" />
              Connect Supabase
            </button>
            <button
              type="button"
              onClick={() => setLocalMode(true)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50"
            >
              Continue without Supabase (demo only)
            </button>
            <p className="text-center text-xs leading-relaxed text-stone-500">
              Demo data stays in this browser. Do not enter real customer or payment information.
            </p>
          </form>
        ) : checkingSession || checkingMembership ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm font-medium text-stone-600">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Checking secure staff access...
          </div>
        ) : session && !isMember ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              <p className="font-bold">Your account is not on the cafe staff list yet.</p>
              <p className="mt-1">Ask the cafe owner to add this account in Supabase SQL Editor.</p>
              {membershipError && <p className="mt-2 text-red-800">{membershipError}</p>}
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-500">
                Account ID
              </p>
              <code className="block break-all rounded-lg bg-stone-100 p-3 text-xs text-stone-800">
                {session.user.id}
              </code>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-500">
                SQL for the owner
              </p>
              <code className="block break-all rounded-lg bg-stone-900 p-3 text-xs text-amber-100">
                {`insert into public.cafe_members (user_id) values ('${session.user.id}') on conflict (user_id) do nothing;`}
              </code>
            </div>
            <button
              onClick={() => setMembershipRevision((revision) => revision + 1)}
              className="w-full rounded-xl bg-amber-900 px-4 py-2.5 font-bold text-white hover:bg-amber-800"
            >
              I have been added — check access
            </button>
            <button
              onClick={() => {
                void handleSignOut().catch((error: unknown) => {
                  setMembershipError(error instanceof Error ? error.message : "Could not sign out.");
                });
              }}
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 font-bold text-stone-700 hover:bg-stone-50"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            {membershipError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {membershipError}
              </div>
            )}
            <label className="block text-sm font-semibold text-stone-700">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Staff email
              </span>
              <input
                autoComplete="username"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5"
              />
            </label>
            <label className="block text-sm font-semibold text-stone-700">
              Password
              <input
                autoComplete="current-password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5"
              />
            </label>
            <button
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-900 px-4 py-3 font-bold text-white hover:bg-amber-800 disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-stone-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              Staff accounts are created by the cafe owner in Supabase; public sign-up is not
              available.
            </p>
          </form>
        )}

        {formError && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {formError}
          </p>
        )}
      </div>
    </div>
  );
};
