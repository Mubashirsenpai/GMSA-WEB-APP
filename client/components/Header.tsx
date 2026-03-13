"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { auth } from "@/lib/api";

const mainNav = [
  { href: "/", label: "Home" },
  { href: "/donate", label: "Donate" },
  { href: "/announcements", label: "Announcements" },
  { href: "/events", label: "Events" },
];

const moreNav = [
  { href: "/executives", label: "Executives" },
  { href: "/gallery", label: "Gallery" },
  { href: "/downloads", label: "Downloads" },
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
  { href: "/madrasa", label: "Madrasa" },
  { href: "/alumni", label: "Alumni" },
  { href: "/suggestions", label: "Suggestions" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ name: string; role: string; isExecutive?: boolean; gender?: string } | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isInMore = moreNav.some(({ href }) => pathname === href || (href !== "/" && pathname?.startsWith(href)));

  const logout = () => {
    localStorage.removeItem("gmsa_token");
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("gmsa_token")) {
      setUser(null);
      return;
    }
    auth.me().then((u: any) => setUser({ name: u.name, role: String(u.role || "").toUpperCase(), isExecutive: !!u.isExecutive, gender: u.gender })).catch(() => setUser(null));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-gmsa-green text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-10 items-center rounded bg-white px-1.5 py-0.5">
              <img
                src="/logo.png"
                alt="GMSA Logo"
                className="h-8 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </span>
            <span className="rounded bg-white/20 px-2 py-0.5">GMSA</span>
            <span>UDS NYC</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {mainNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === href ? "bg-white/20" : "hover:bg-white/10"
                )}
              >
                {label}
              </Link>
            ))}
            <div
              ref={moreRef}
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={clsx(
                  "flex items-center gap-0.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isInMore || moreOpen ? "bg-white/20" : "hover:bg-white/10"
                )}
              >
                View others
                <ChevronDown className={clsx("w-4 h-4 transition-transform", moreOpen && "rotate-180")} />
              </button>
              {moreOpen && (
                <div className="absolute left-0 top-full pt-1 min-w-[180px]">
                  <div className="bg-white text-gray-900 rounded-lg shadow-lg py-1 border border-gray-100">
                    {moreNav.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className={clsx(
                          "block px-4 py-2 text-sm font-medium hover:bg-gmsa-green/10",
                          pathname === href && "bg-gmsa-green/10 text-gmsa-green"
                        )}
                        onClick={() => setMoreOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Role dashboard links: only when logged in — public never sees Admin, PRO, Secretary, Executive */}
            {user && (
              <>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname.startsWith("/admin") ? "bg-white/20" : "hover:bg-white/10"
                    )}
                  >
                    Admin
                  </Link>
                )}
                {(user.role === "ADMIN" || user.role === "PRO") && (
                  <Link
                    href="/pro"
                    className={clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname.startsWith("/pro") ? "bg-white/20" : "hover:bg-white/10"
                    )}
                  >
                    PRO
                  </Link>
                )}
                {(user.role === "ADMIN" || user.role === "SECRETARY") && (
                  <Link
                    href="/secretary"
                    className={clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname.startsWith("/secretary") ? "bg-white/20" : "hover:bg-white/10"
                    )}
                  >
                    Secretary
                  </Link>
                )}
                {(user.isExecutive || user.role === "ADMIN") && (
                  <Link
                    href="/executive"
                    className={clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname.startsWith("/executive") ? "bg-white/20" : "hover:bg-white/10"
                    )}
                  >
                    Executive
                  </Link>
                )}
                {(user.role === "ADMIN" || user.role === "WOCOM") && (
                  <Link
                    href="/wocom"
                    className={clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname.startsWith("/wocom") ? "bg-white/20" : "hover:bg-white/10"
                    )}
                  >
                    WOCOM
                  </Link>
                )}
                {(user.role === "ADMIN" || user.role === "IMAM") && (
                  <Link
                    href="/imam"
                    className={clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname.startsWith("/imam") ? "bg-white/20" : "hover:bg-white/10"
                    )}
                  >
                    Imam
                  </Link>
                )}
                {(user.role === "ADMIN" || user.role === "WOCOM" || user.gender === "FEMALE") && (
                  <Link
                    href="/ladies-discussion"
                    className={clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === "/ladies-discussion" ? "bg-white/20" : "hover:bg-white/10"
                    )}
                  >
                    Ladies
                  </Link>
                )}
              </>
            )}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-white/90 text-sm">{user.name}</span>
                <button type="button" onClick={logout} className="btn-secondary border-white text-white hover:bg-white hover:text-gmsa-green py-1.5 px-3 text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary border-white text-white hover:bg-white hover:text-gmsa-green py-1.5 px-3 text-sm">
                  Login
                </Link>
                <Link href="/register" className="bg-white text-gmsa-green hover:bg-gray-100 font-medium py-1.5 px-3 rounded-lg text-sm">
                  Join
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {open && (
          <nav className="md:hidden py-4 border-t border-white/20 flex flex-col gap-1">
            {mainNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={clsx("px-3 py-2 rounded-lg", pathname === href && "bg-white/20")}
              >
                {label}
              </Link>
            ))}
            <div className="px-3 py-1 text-white/70 text-xs font-medium uppercase tracking-wider">View others</div>
            {moreNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={clsx("px-3 py-2 rounded-lg pl-5", pathname === href && "bg-white/20")}
              >
                {label}
              </Link>
            ))}
            {/* Role links only when logged in — public never sees these */}
            {user && (
              <>
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setOpen(false)} className={clsx("px-3 py-2 rounded-lg", pathname.startsWith("/admin") && "bg-white/20")}>
                    Admin
                  </Link>
                )}
                {(user.role === "ADMIN" || user.role === "PRO") && (
                  <Link href="/pro" onClick={() => setOpen(false)} className={clsx("px-3 py-2 rounded-lg", pathname.startsWith("/pro") && "bg-white/20")}>
                    PRO
                  </Link>
                )}
                {(user.role === "ADMIN" || user.role === "SECRETARY") && (
                  <Link href="/secretary" onClick={() => setOpen(false)} className={clsx("px-3 py-2 rounded-lg", pathname.startsWith("/secretary") && "bg-white/20")}>
                    Secretary
                  </Link>
                )}
                {(user.isExecutive || user.role === "ADMIN") && (
                  <Link href="/executive" onClick={() => setOpen(false)} className={clsx("px-3 py-2 rounded-lg", pathname.startsWith("/executive") && "bg-white/20")}>
                    Executive
                  </Link>
                )}
                {(user.role === "ADMIN" || user.role === "WOCOM") && (
                  <Link href="/wocom" onClick={() => setOpen(false)} className={clsx("px-3 py-2 rounded-lg", pathname.startsWith("/wocom") && "bg-white/20")}>
                    WOCOM
                  </Link>
                )}
                {(user.role === "ADMIN" || user.role === "IMAM") && (
                  <Link href="/imam" onClick={() => setOpen(false)} className={clsx("px-3 py-2 rounded-lg", pathname.startsWith("/imam") && "bg-white/20")}>
                    Imam
                  </Link>
                )}
                {(user.role === "ADMIN" || user.role === "WOCOM" || user.gender === "FEMALE") && (
                  <Link href="/ladies-discussion" onClick={() => setOpen(false)} className={clsx("px-3 py-2 rounded-lg", pathname === "/ladies-discussion" && "bg-white/20")}>
                    Ladies
                  </Link>
                )}
              </>
            )}
            {user ? (
              <>
                <span className="px-3 py-2 text-white/80">{user.name}</span>
                <button type="button" className="px-3 py-2 border-t border-white/20 text-left w-full" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 mt-2 border-t border-white/20" onClick={() => setOpen(false)}>Login</Link>
                <Link href="/register" className="px-3 py-2" onClick={() => setOpen(false)}>Join</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
