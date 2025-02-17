"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function useWebSocketKiosk() {
  const [socket, setSocket] = useState(null);
  const [timelineYears, setTimelineYears] = useState([]);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_WEBSOCKET_HOST, { transports: ["websocket"] });

    socketInstance.on("connect", () => {
      console.log("✅ Connected to WebSocket Server (Kiosk)", socketInstance.id);
      socketInstance.emit("register", "kiosk");
    });

    // ✅ Fix: Listen for "timelineUpdate" instead of "timelineData"
    socketInstance.on("timelineUpdate", (data) => {
      console.log("📅 Timeline Data Received:", data);
      setTimelineYears(data.map((event) => event.year)); // Extract years
    });

    setSocket(socketInstance);

    return () => socketInstance.disconnect();
  }, []);

  const sendYearSelection = (year) => {
    if (socket) {
      socket.emit("selectYear", year);
    }
  };

  return { timelineYears, sendYearSelection };
}
