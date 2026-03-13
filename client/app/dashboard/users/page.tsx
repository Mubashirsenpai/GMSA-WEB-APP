"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardUsersPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/users");
  }, [router]);
  return <div className="container mx-auto px-4 py-12 text-center">Redirecting to Admin → Users...</div>;
}
