"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function DonateSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"loading" | "completed" | "failed" | "error">("loading");
  const [donation, setDonation] = useState<{ id: string; amount: number; projectType: string } | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      return;
    }
    fetch(`/api/donations/verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok && data?.error) {
          setStatus("error");
          return;
        }
        setStatus(data.status === "completed" ? "completed" : data.status === "failed" ? "failed" : "error");
        setDonation(data.donation || null);
      })
      .catch(() => setStatus("error"));
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <h2 className="text-2xl font-bold text-gmsa-green mb-4">Verifying your payment...</h2>
        <p className="text-gray-600">Please wait.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to verify</h2>
        <p className="text-gray-600 mb-6">We could not verify your payment. If you completed payment, please contact us with your reference.</p>
        <Link href="/donate" className="btn-primary">Back to Donate</Link>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Payment not completed</h2>
        <p className="text-gray-600 mb-6">Your payment was not successful. You can try again.</p>
        <Link href="/donate" className="btn-primary">Try again</Link>
      </div>
    );
  }

  const projectLabels: Record<string, string> = {
    MASJID_RENOVATION: "GMSA Masjid Renovation Project",
    FIISABIDILLAH: "Fiisabidillah",
  };
  const projectLabel = donation?.projectType ? (projectLabels[donation.projectType] ?? "GMSA Weekly GHS 2.00 Project") : "GMSA Weekly GHS 2.00 Project";

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg text-center">
      <h2 className="text-2xl font-bold text-gmsa-green mb-4">Thank you for your donation!</h2>
      <p className="text-gray-600 mb-2">Your payment was successful.</p>
      {donation && (
        <p className="text-gray-700 font-medium mb-6">
          GHS {donation.amount.toFixed(2)} to {projectLabel}
        </p>
      )}
      <Link href="/donate" className="btn-secondary mr-2">Donate again</Link>
      <Link href="/" className="btn-primary">Back to home</Link>
    </div>
  );
}

export default function DonateSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <DonateSuccessContent />
    </Suspense>
  );
}
