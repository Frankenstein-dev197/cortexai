import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import SingleUserAuth from "./SingleUserAuth";
import MultiUserAuth from "./MultiUserAuth";
import useLogo from "../../../hooks/useLogo";

export default function PasswordModal({ mode = "multi" }) {
  const { loginLogo, isCustomLogo } = useLogo();
  return (
    <div className="fixed inset-0 bg-zinc-950 light:bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
      <img src={loginLogo} alt="Logo" className={`max-h-[80px] ${isCustomLogo ? "rounded-lg" : ""}`} style={{ objectFit: "contain" }} />
      {mode === "single" ? <SingleUserAuth /> : <MultiUserAuth />}
    </div>
  );
}

export function usePasswordModal() {
  const [auth, setAuth] = useState({ loading: true, requiresAuth: true, mode: "multi" });

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      setAuth({ loading: false, requiresAuth: !data?.session || !!error, mode: "multi" });
    };
    check();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setAuth({ loading: false, requiresAuth: !session, mode: "multi" });
    });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  return auth;
}
