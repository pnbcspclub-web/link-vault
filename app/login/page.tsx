"use client";

import { useActionState } from "react";
import { loginWithPassword } from "./actions";
import { Lock, ArrowRight, AlertCircle } from "lucide-react";

const initialState = {
  error: ""
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginWithPassword, initialState);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Unlock Your Vault</h1>
          <p className="text-slate-500 mt-2 text-sm">Enter your security password to continue.</p>
        </div>

        <form action={formAction} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                Security Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                <AlertCircle size={16} />
                <p className="font-medium">{state.error}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
          >
            {isPending ? "Unlocking..." : "Unlock Vault"}
            {!isPending && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </main>
  );
}
