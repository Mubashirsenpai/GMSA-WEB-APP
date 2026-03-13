"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === "/dashboard") router.replace("/admin");
    else if (pathname === "/dashboard/users") router.replace("/admin/users");
  }, [pathname, router]);
  return <>{children}</>;
}
