"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Box, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import useWebSocketBigScreen from "@/hooks/useWebSocketBigScreen";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Shift } from "ambient-cbg";

/**
 * Hook to track real-time window size
 */
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

export default function BigScreenPage() {
  const router = useRouter();
  const { timelineRecords, programRecords, selectedEvent, selectedProgram } =
    useWebSocketBigScreen();

  const yearRefs = useRef([]);
  const programRefs = useRef([]);
  const [yearLineStyles, setYearLineStyles] = useState([]);
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useEffect(() => {
    if (timelineRecords.length === 0 && programRecords.length === 0) return;

    requestAnimationFrame(() => {
      const newYearLines = [];

      // Connect Year Bubbles
      for (let i = 0; i < yearRefs.current.length - 1; i++) {
        if (!yearRefs.current[i] || !yearRefs.current[i + 1]) continue;

        const rectA = yearRefs.current[i].getBoundingClientRect();
        const rectB = yearRefs.current[i + 1].getBoundingClientRect();

        const Ax = rectA.left + rectA.width / 2;
        const Ay = rectA.top + rectA.height / 2;
        const Bx = rectB.left + rectB.width / 2;
        const By = rectB.top + rectB.height / 2;

        const dx = Bx - Ax;
        const dy = By - Ay;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

        newYearLines.push({
          width: `${distance}px`,
          transform: `rotate(${angleDeg}deg)`,
          left: `${Ax}px`,
          top: `${Ay}px`,
        });
      }

      setYearLineStyles(newYearLines);
    });
  }, [timelineRecords, programRecords, windowWidth, windowHeight]);

  // ✅ Shared Bubble Style
  const bubbleStyle = {
    boxShadow: "0px 0px 25px rgba(0, 255, 255, 1)",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.4rem",
    position: "absolute",
    userSelect: "none",
    transition: "all 0.3s ease-in-out",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        height: "calc(100vh - 100px)",
        userSelect: "none",
      }}
    >
      <Shift />

      <IconButton
        sx={{ position: "absolute", top: 20, left: 20, color: "white", zIndex:99 }}
        onClick={() => router.push("/")}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* 📌 LEFT: Year Bubbles (70%) */}
      <Box
        sx={{
          width: "70%",
          height: "100%",
          position: "relative",
        }}
      >
        {timelineRecords.map((year, index) => (
          <Box
            key={`year-${index}`}
            sx={{
              position: "absolute",
              width: `${year.xPosition}%`, // ✅ Section Width based on xPosition
              height: "100%",
            }}
          >
            <motion.div
              ref={(el) => (yearRefs.current[index] = el)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                ...bubbleStyle,
                background:
                  selectedEvent?.year === year.year
                    ? "linear-gradient(90deg, #0088ff, #00ffcc)"
                    : "radial-gradient(circle, #009688, #00796b)",
                left: "50%",
                top: `${year.yPosition}%`, // ✅ Vertical position based on yPosition
                transform: "translate(-50%, -50%)",
                color: selectedEvent?.year === year.year ? "#222" : "#fff",
                borderRadius:
                  selectedEvent?.year === year.year ? "10px" : "50%",

                color: selectedEvent?.year === year.year ? "#222" : "#fff",
                borderRadius:
                  selectedEvent?.year === year.year ? "10px" : "50%",
                color: selectedEvent?.year === year.year ? "#000" : "#fff",
                minWidth: selectedEvent?.year === year.year ? "8rem" : "5rem",
                height: selectedEvent?.year === year.year ? "4rem" : "5rem",
                padding:
                  selectedEvent?.year === year.year ? "1rem 1.5rem" : "1rem",
              }}
            >
              {year.year}
            </motion.div>
          </Box>
        ))}

        {/* 📌 Lines Connecting Year Bubbles */}
        {yearLineStyles.map((style, idx) => (
          <motion.div
            key={idx}
            initial={{ width: 0 }}
            animate={{ width: style.width }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              height: "5px",
              background: "linear-gradient(90deg, #0088ff, #00ffcc)",
              boxShadow: "0 0 10px #00ffcc",
              left: style.left,
              top: style.top,
              transform: style.transform,
              transformOrigin: "left",
              zIndex: -1,
            }}
          />
        ))}
      </Box>

      {/* 📌 RIGHT: Program Bubbles (30%) */}
      <Box
        sx={{
          width: "30%",
          height: "100%",
          position: "relative",
        }}
      >
        {programRecords.map((program, index) => (
          <motion.div
            key={`program-${index}`}
            ref={(el) => (programRefs.current[index] = el)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              ...bubbleStyle,
              background:
                selectedProgram?.title === program.title
                  ? "linear-gradient(90deg, #0088ff, #00ffcc)"
                  : "radial-gradient(circle, #009688, #00796b)",
              left: `${program.xPosition}%`,
              top: `${program.yPosition}%`,
              transform: "translate(-50%, -50%)",
              color: selectedProgram?.title === program.title ? "#222" : "#fff",
              borderRadius:
                selectedProgram?.title === program.title ? "10px" : "50%",
              color: selectedProgram?.title === program.title ? "#000" : "#fff",
              minWidth:
                selectedProgram?.title === program.title ? "8rem" : "5rem",
              height:
                selectedProgram?.title === program.title ? "4rem" : "5rem",
              padding:
                selectedProgram?.title === program.title
                  ? "1rem 1.5rem"
                  : "1rem",
            }}
          >
            {program.title}
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}
