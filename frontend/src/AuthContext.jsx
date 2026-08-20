import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [store, setStore] = useState({ user: null, session: null, loading: true });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setStore({ user: data.session?.user ?? null, session: data.session ?? null, loading: false });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setStore({ user: session?.user ?? null, session: session ?? null, loading: false });
      if (event === "SIGNED_OUT") navigate("/login");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const actions = {
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    signInWithProvider: async (provider) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/login` },
      });
      if (error) throw error;
    },
  };

  return <AuthContext.Provider value={{ store, actions, supabase }}>{children}</AuthContext.Provider>;
}
