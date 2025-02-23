"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useWebSocketKiosk from "@/hooks/useWebSocketKiosk";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";
import { Shift } from "ambient-cbg";

/**
 * Hook to listen for window resize events.
 */
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

export default function ControllerOne() {
  const router = useRouter();
  const { sendYearSelection } = useWebSocketKiosk();
  const timelineYears = [2014, 2015, 2016, 2017]; // ✅ Fixed Year Range
  const scrollContainerRef = useRef(null);
  const yearRefs = useRef([]);
  const [lineStyles, setLineStyles] = useState([]);
  const { width: windowWidth } = useWindowSize();
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [timelineYears]);

  useEffect(() => {
    const containerEl = scrollContainerRef.current;
    if (!containerEl || yearRefs.current.length < 2) return;

    const recalcLines = () => {
      requestAnimationFrame(() => {
        const newStyles = [];
        const containerRect = containerEl.getBoundingClientRect();

        for (let i = 0; i < yearRefs.current.length - 1; i++) {
          const rectA = yearRefs.current[i]?.getBoundingClientRect();
          const rectB = yearRefs.current[i + 1]?.getBoundingClientRect();
          if (!rectA || !rectB) continue;

          const AcenterX = rectA.left - containerRect.left + rectA.width / 2;
          const AcenterY = rectA.top - containerRect.top + rectA.height / 2;
          const BcenterX = rectB.left - containerRect.left + rectB.width / 2;
          const BcenterY = rectB.top - containerRect.top + rectB.height / 2;

          const dx = BcenterX - AcenterX;
          const dy = BcenterY - AcenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

          newStyles.push({
            width: `${distance}px`,
            transform: `rotate(${angleDeg}deg)`,
            left: `${AcenterX}px`,
            top: `${AcenterY}px`,
          });
        }

        setLineStyles(newStyles);
      });
    };

    recalcLines();
  }, [timelineYears, windowWidth]);

  // ✅ Bubble Style (Default)
  const roundBubble = {
    background: "radial-gradient(circle, #009688, #00796b)",
    boxShadow: "0px 0px 20px rgba(0, 255, 204, 0.8)",
    color: "white",
    fontSize: "1.5rem",
    width: "10rem",
    height: "10rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.4rem",
    padding: "0.5rem",
    position: "absolute",
    userSelect: "none",
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
  };

  // ✅ Selected Style (Rectangle)
  const selectedStyle = {
    background: "linear-gradient(90deg, #0088ff, #00ffcc)",
    boxShadow: "0px 0px 25px rgba(0, 255, 255, 1)",
    color: "#000",
    fontSize: "1.6rem",
    width: "12rem",
    height: "8rem",
    borderRadius: "10px",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 10px)",
        width: "100vw",
        color: "white",
        textAlign: "center",
        position: "relative",
        userSelect: "none",
      }}
    >
      <Shift />

      <IconButton
        sx={{ position: "absolute", top: 20, left: 20, color: "white" }}
        onClick={() => router.push("/kiosk")}
      >
        <ArrowBackIcon />
      </IconButton>

      <Typography
        variant="h3"
        color="white"
        fontWeight="bold"
        mb={4}
        sx={{ userSelect: "none" }}
      >
        🎮 Controller 1
      </Typography>
      <Typography variant="h6" color="lightgray" mb={4}>
        Manage Timeline Years 2014 - 2017
      </Typography>

      <Box
        ref={scrollContainerRef}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          maxWidth: "100vw",
          overflowX: "auto",
          overflowY: "hidden",
          padding: "0.5rem",
          height: "70vh",
          userSelect: "none",
        }}
      >
        {lineStyles.map((style, idx) => (
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
              zIndex: 1,
              userSelect: "none",
            }}
          />
        ))}

        {timelineYears.map((year, index) => {
          const translateY = index % 2 === 1 ? "-6rem" : "6rem";

          return (
            <Box
              key={year}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                marginLeft: "10vw",
                marginRight: "10vw",
                transform: `translateY(${translateY})`,
                zIndex: 5,
                userSelect: "none",
              }}
            >
              <motion.div
                ref={(el) => (yearRefs.current[index] = el)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.3, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.85, transition: { duration: 0.1 } }}
                transition={{ duration: 0.5 }}
                style={{
                  ...roundBubble,
                  ...(selectedYear === year ? selectedStyle : {}), // ✅ Apply rectangle style when selected
                }}
                onClick={() => {
                  setSelectedYear(year); // ✅ Update selected year
                  sendYearSelection(year);
                }}
              >
                {year}
              </motion.div>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
