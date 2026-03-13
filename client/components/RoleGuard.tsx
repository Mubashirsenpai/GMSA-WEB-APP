"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";

type Role = "ADMIN" | "PRO" | "SECRETARY" | "WOCOM" | "IMAM";

export function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("gmsa_token")) {
      router.replace("/login");
      return;
    }
    auth
      .me()
      .then((u: any) => {
        const role = String(u.role || "").toUpperCase();
        const allowed = allowedRoles.map((r) => r.toUpperCase());
        if (role && allowed.includes(role)) setOk(true);
        else router.replace("/");
      })
      .catch(() => router.replace("/login"));
  }, [allowedRoles, router]);

  if (ok === null) return <div className="container mx-auto px-4 py-12 text-center">Checking access...</div>;
  if (!ok) return null;
  return <>{children}</>;
}
