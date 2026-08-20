import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../../lib/supabase";
import showToast from "@/utils/toast";

export default function MultiUserAuth() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const result = mode === "signup"
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (result.error) return showToast(result.error.message, "error", { clear: true });
    if (mode === "signup") {
      showToast("Check your email to confirm your Cortex account.", "success", { clear: true });
      setMode("login");
    }
  };

  const social = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (error) {
      setLoading(false);
      showToast(error.message, "error", { clear: true });
    }
  };

  const resetPassword = async () => {
    if (!email) return showToast("Enter your email address first.", "error", { clear: true });
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) return showToast(error.message, "error", { clear: true });
    showToast("Password reset instructions sent to your email.", "success", { clear: true });
  };

  return (
    <div className="flex flex-col justify-center items-center w-[324px]">
      <div className="flex flex-col items-center gap-y-3 pt-7 pb-8">
        <h3 className="text-white light:text-slate-950 text-[34px] leading-[38px] font-medium text-center">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h3>
        <p className="text-zinc-400 light:text-zinc-600 text-sm text-center">
          {mode === "signup" ? "Create your Cortex AI account" : t("login.sign-in", { appName: "Cortex AI" })}
        </p>
      </div>

      <div className="w-full px-3 flex flex-col gap-y-3">
        <button type="button" disabled={loading} onClick={() => social("google")} className="h-[38px] rounded-lg bg-white text-zinc-950 font-semibold text-sm">
          Continue with Google
        </button>
        <button type="button" disabled={loading} onClick={() => social("github")} className="h-[38px] rounded-lg bg-zinc-800 text-white font-semibold text-sm border border-zinc-700">
          Continue with GitHub
        </button>
      </div>

      <div className="flex items-center gap-3 w-full px-3 my-5 text-zinc-500 text-xs">
        <div className="h-px bg-zinc-800 flex-1" />
        OR
        <div className="h-px bg-zinc-800 flex-1" />
      </div>

      <form onSubmit={submit} className="w-full px-3 flex flex-col gap-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required placeholder="Email" className="border-none bg-zinc-800 light:bg-slate-200 text-zinc-200 light:text-zinc-600 text-sm rounded-lg p-2.5 w-full h-[38px] focus:outline-none focus:ring-1 focus:ring-sky-300" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={6} placeholder="Password" className="border-none bg-zinc-800 light:bg-slate-200 text-zinc-200 light:text-zinc-600 text-sm rounded-lg p-2.5 w-full h-[38px] focus:outline-none focus:ring-1 focus:ring-sky-300" />
        <button disabled={loading} type="submit" className="text-zinc-950 bg-white hover:bg-zinc-300 light:bg-sky-200 text-sm font-semibold rounded-lg h-[38px] w-full">
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="flex flex-col items-center gap-3 mt-5 text-sm">
        {mode === "login" && <button type="button" onClick={resetPassword} className="text-zinc-300 hover:text-sky-300">Forgot password?</button>}
        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-sky-300 hover:underline">
          {mode === "login" ? "Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
