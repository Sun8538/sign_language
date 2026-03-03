"use client";

import { useEffect, useState } from "react";
import socket from "../app/socket";

export type ServerStatus = "connecting" | "connected" | "disconnected";

/**
 * Subscribes to the shared socket instance and returns the current
 * server connection status.
 */
export function useServerStatus(): ServerStatus {
  // Always start with "connecting" — this is identical on server and client,
  // preventing the React hydration mismatch caused by socket.connected
  // evaluating differently between SSR and the first browser render.
  const [status, setStatus] = useState<ServerStatus>("connecting");

  useEffect(() => {
    // Only runs in the browser — safe to read socket state here.
    function onConnect() {
      setStatus("connected");
    }
    function onDisconnect() {
      setStatus("disconnected");
    }
    function onConnectError() {
      setStatus("disconnected");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Sync current state after mount (socket may have already connected)
    if (socket.connected) setStatus("connected");

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, []);

  return status;
}
