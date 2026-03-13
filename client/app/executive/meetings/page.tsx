"use client";

import { useState, useEffect, useRef } from "react";

const DEFAULT_ROOM = "gmsa-executive-meetings";
const JITSI_DOMAIN = "meet.jit.si";

export default function ExecutiveMeetingsPage() {
  const [roomName, setRoomName] = useState("");
  const [joined, setJoined] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const room = (typeof window !== "undefined" && (process.env.NEXT_PUBLIC_EXECUTIVE_MEETING_ROOM || DEFAULT_ROOM)) || DEFAULT_ROOM;
  const displayName = roomName.trim() || "Executive";

  useEffect(() => {
    if (!joined || typeof window === "undefined" || !containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => {
      const api = (window as any).JitsiMeetExternalAPI;
      if (!api) return;
      const domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || JITSI_DOMAIN;
      const options = {
        roomName: room,
        width: "100%",
        height: "100%",
        parentNode: containerRef.current,
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
        },
        userInfo: { displayName },
      };
      new api(domain, options);
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [joined, room, displayName]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gmsa-green mb-2">Virtual meetings</h1>
      <p className="text-gray-600 mb-6">Executive-only video meetings. Join the room below to meet with other board members.</p>

      {!joined ? (
        <div className="card p-6 max-w-md space-y-4">
          <p className="text-sm text-gray-600">You will join the executive meeting room. Enter your display name (optional), then click Join.</p>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Your name (optional)</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Your name"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <button
            type="button"
            onClick={() => setJoined(true)}
            className="btn-primary w-full"
          >
            Join meeting
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
            <span className="text-sm font-medium text-gray-700">In meeting: {room}</span>
            <button
              type="button"
              onClick={() => setJoined(false)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Leave
            </button>
          </div>
          <div ref={containerRef} className="w-full h-[70vh] min-h-[400px]" />
        </div>
      )}
    </div>
  );
}
