
"use client";

import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  if (!socket) {
    // Dynamic import to avoid SSR issues
    const { io } = require("socket.io-client");
    socket = io(window.location.origin, {
      transports:   ["websocket", "polling"],
      reconnection: true,
    });
  }
  return socket;
}

export function useSocket(userId?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = getSocket();
    if (!s) return;
    socketRef.current = s;

    if (userId && s.connected) {
      s.emit("identify", userId);
    }

    s.on("connect", () => {
      if (userId) s.emit("identify", userId);
    });

    return () => {
      // Don't disconnect — singleton
    };
  }, [userId]);

  return socketRef.current;
}