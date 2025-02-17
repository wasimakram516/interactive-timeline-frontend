"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function useWebSocketBigScreen() {
  const [socket, setSocket] = useState(null);
  const [timelineRecords, setTimelineRecords] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const WS_HOST = process.env.NEXT_PUBLIC_WEBSOCKET_HOST;

  useEffect(() => {
    if (!WS_HOST) {
      console.error("❌ WebSocket Host is not defined.");
      return;
    }

    const socketInstance = io(WS_HOST, { transports: ["websocket"] });

    socketInstance.on("connect", () => {
      console.log("✅ Connected to WebSocket Server (Big Screen)", socketInstance.id);
      socketInstance.emit("register", "big-screen");
    });

    // ✅ Fix: Listen for "timelineUpdate" instead of "timelineData"
    socketInstance.on("timelineUpdate", (timelineRecords) => {
      console.log("📅 Timeline updated:", timelineRecords);
      setTimelineRecords(timelineRecords);
    });

    // ✅ Listen for selected year event
    socketInstance.on("animateYear", (eventData) => {
      console.log(`🎉 Event received for year: ${eventData.year}`);
      setSelectedEvent(eventData);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [WS_HOST]);

  return { timelineRecords, selectedEvent };
}
