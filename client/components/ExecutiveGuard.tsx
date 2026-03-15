"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";

export function ExecutiveGuard({ children }: { children: React.ReactNode }) {
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
      .then((u: unknown) => {
        const user = u as { isExecutive?: boolean; role?: string };
        if (user.isExecutive === true) setOk(true);
        else if (user.role === "ADMIN") setOk(true);
        else router.replace("/");
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (ok === null)
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        Checking access...
      </div>
    );
  if (!ok) return null;
  return <>{children}</>;
}
