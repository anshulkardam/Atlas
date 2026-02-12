import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { AgentProgress } from "@/types/entities";

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [jobProgress, setJobProgress] = useState<
    Record<string, AgentProgress>
  >({});

  useEffect(() => {
    const socket = io("http://localhost:3003", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WS connected:", socket.id);
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

  const subscribeToJob = useCallback((jobId: string) => {
    socketRef.current?.emit("subscribe", { jobId });
  }, []);

  const unsubscribeFromJob = useCallback((jobId: string) => {
    socketRef.current?.emit("unsubscribe", { jobId });
  }, []);

  const getJobProgress = useCallback(
    (jobId: string) => jobProgress[jobId] || null,
    [jobProgress]
  );

  return {
    subscribeToJob,
    unsubscribeFromJob,
    getJobProgress,
  };
}
