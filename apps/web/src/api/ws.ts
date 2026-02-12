import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { AgentProgress } from "@/types/entities";

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [jobProgress, setJobProgress] = useState<Record<string, AgentProgress>>(
    {},
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:3003", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WS connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("progress", (data: AgentProgress) => {
      console.log("Received progress:", data);

      setJobProgress((prev) => ({
        ...prev,
        [data.jobId]: data,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const subscribeToJob = useCallback(
    (jobId: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("subscribe", { jobId });
      }
    },
    [isConnected],
  );

  const unsubscribeFromJob = useCallback(
    (jobId: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("unsubscribe", { jobId });
      }
    },
    [isConnected],
  );

  const getJobProgress = useCallback(
    (jobId: string) => jobProgress[jobId] || null,
    [jobProgress],
  );

  const clearJobProgress = useCallback((jobId: string) => {
    setJobProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[jobId];
      return newProgress;
    });
  }, []);

  return {
    subscribeToJob,
    unsubscribeFromJob,
    getJobProgress,
    clearJobProgress,
    isConnected,
    jobProgress,
  };
}
