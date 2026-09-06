"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getMe, logout as apiLogout, type AuthUser } from "@/lib/api";

type AuthContextValue = {
  user: AuthUser;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AdminAuthProvider");
  return ctx;
}

/** Gates the admin shell: only an approved (active) user gets through;
 * everyone else is sent to /admin/login. */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    getMe()
      .then((me) => {
        if (cancelled) return;
        if (me?.status === "active") {
          setUser(me);
        } else {
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = React.useCallback(async () => {
    await apiLogout();
    router.replace("/admin/login");
  }, [router]);

  if (checking || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
