"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
}

export function DashboardShell({
  title,
  navItems,
  children,
}: {
  title: string;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("gmsa_token");
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = () => setSidebarOpen(false);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-gmsa-green text-white shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-3 sm:px-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="md:hidden p-2 -ml-1 rounded-lg hover:bg-white/10 shrink-0"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="font-bold text-base sm:text-lg truncate">
              GMSA UDS NYC
            </Link>
            <span className="text-white/90 text-xs sm:text-sm font-medium truncate hidden sm:inline">{title}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/" className="text-white/90 hover:text-white text-xs sm:text-sm whitespace-nowrap">
              Public site
            </Link>
            <button type="button" onClick={logout} className="text-white/90 hover:text-white text-xs sm:text-sm font-medium whitespace-nowrap">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-40 w-64 sm:w-56 bg-white border-r border-gray-200 shadow-lg md:shadow-sm
            transform transition-transform duration-200 ease-out md:transform-none
            mt-14 md:mt-0 min-h-[calc(100vh-3.5rem)]
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href || (pathname?.startsWith(href + "/") ?? false);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-gmsa-green text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto min-w-0 w-full">{children}</main>
      </div>
    </div>
  );
}
