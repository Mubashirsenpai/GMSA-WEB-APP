"use client";

import Link from "next/link";
import { Video, MessageCircle } from "lucide-react";

export default function ExecutiveDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-2">Executive dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome. Use the links below to join virtual meetings or live discussions with fellow executives.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/executive/meetings"
          className="card p-6 flex items-center gap-4 hover:border-gmsa-green/50 transition-colors"
        >
          <div
            className="w-12 h-12 rounded-lg bg-gmsa-green/10 flex items-center justify-center shrink-0"
            style={{ color: "#166534" }}
          >
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Virtual meetings</h2>
            <p className="text-sm text-gray-600">
              Join or start executive video meetings.
            </p>
          </div>
        </Link>
        <Link
          href="/executive/discussions"
          className="card p-6 flex items-center gap-4 hover:border-gmsa-green/50 transition-colors"
        >
          <div
            className="w-12 h-12 rounded-lg bg-gmsa-green/10 flex items-center justify-center shrink-0"
            style={{ color: "#166534" }}
          >
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Live discussions</h2>
            <p className="text-sm text-gray-600">
              Real-time text chat with fellow executives.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
