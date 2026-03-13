"use client";

import { useState, useEffect } from "react";

const KEY = "gmsa_show_login_success";

export function LoginSuccessBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = window.sessionStorage.getItem(KEY);
    if (value === "1") {
      setShow(true);
      window.sessionStorage.removeItem(KEY);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      role="alert"
      className="bg-gmsa-green text-white text-center py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-3"
    >
      <span>You&apos;re logged in.</span>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="underline hover:no-underline opacity-90"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}
