"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function useWebSocketBigScreen() {
  const [socket, setSocket] = useState(null);
  const [timelineRecords, setTimelineRecords] = useState([]);
  const [programRecords, setProgramRecords] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
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

    // ✅ Listen for timeline updates
    socketInstance.on("timelineUpdate", (timelineRecords) => {
      console.log("📅 Timeline updated:", timelineRecords);
      setTimelineRecords(timelineRecords);
    });

    // ✅ Listen for program updates
    socketInstance.on("programUpdate", (programRecords) => {
      console.log("📜 Program updated:", programRecords);
      setProgramRecords(programRecords);
    });

    // ✅ Listen for selected year event
    socketInstance.on("animateYear", (eventData) => {
      console.log(`🎉 Event received for year: ${eventData?.year || "null"}`);
      setSelectedEvent(eventData); // eventData can be null
    });

    // ✅ Listen for selected program event
    socketInstance.on("animateProgram", (programData) => {
      console.log(`📜 Program received for title: ${programData?.title || "null"}`);
      setSelectedProgram(programData); // programData can be null
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [WS_HOST]);

  return { timelineRecords, programRecords, selectedEvent, selectedProgram };
}
