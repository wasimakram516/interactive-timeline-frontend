"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function useWebSocketKiosk() {
  const [socket, setSocket] = useState(null);
  const [timelineYears, setTimelineYears] = useState([]);
  const [programTitles, setProgramTitles] = useState([]);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_WEBSOCKET_HOST, { transports: ["websocket"] });

    socketInstance.on("connect", () => {
      console.log("✅ Connected to WebSocket Server (Kiosk)", socketInstance.id);
      socketInstance.emit("register", "kiosk");
    });

    // ✅ Listen for timeline updates
    socketInstance.on("timelineUpdate", (data) => {
      console.log("📅 Timeline Data Received:", data);
      setTimelineYears(data.map((event) => event.year)); // Extract years
    });

    // ✅ Listen for program updates
    socketInstance.on("programUpdate", (data) => {
      console.log("📜 Program Data Received:", data);
      setProgramTitles(data.map((program) => program.title)); // Extract program titles
    });

    setSocket(socketInstance);

    return () => socketInstance.disconnect();
  }, []);

  const sendYearSelection = (year) => {
    if (socket) {
      socket.emit("selectYear", year);
    }
  };

  const sendProgramSelection = (title) => {
    if (socket) {
      socket.emit("selectProgram", title);
    }
  };

  return { timelineYears, programTitles, sendYearSelection, sendProgramSelection };
}
