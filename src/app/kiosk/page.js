"use client";
import { useEffect, useRef, useState } from "react";
import useWebSocketKiosk from "../../hooks/useWebSocketKiosk";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

/**
 * Listen for window resize events in real-time.
 */
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    // Initialize
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

export default function KioskPage() {
  const { timelineYears, sendYearSelection } = useWebSocketKiosk();

  // Container ref for horizontal scrolling
  const scrollContainerRef = useRef(null);
  // Refs for each bubble button
  const yearRefs = useRef([]);

  // Store computed line styles (absolute positions/rotations)
  const [lineStyles, setLineStyles] = useState([]);

  // Track window size to trigger line recalculations on resize
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  /**
   * Auto-scroll left when timeline data changes
   */
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [timelineYears]);

  /**
   * Recalculate lines:
   * - when timeline changes
   * - on window resize
   */
  useEffect(() => {
    const containerEl = scrollContainerRef.current;
    if (!containerEl || yearRefs.current.length < 2) return;

    // Handler to recalculate lines (center-to-center in container coords)
    const recalcLines = () => {
      requestAnimationFrame(() => {
        const newStyles = [];
        const containerRect = containerEl.getBoundingClientRect();

        for (let i = 0; i < yearRefs.current.length - 1; i++) {
          if ((i + 1) % 4 === 0) continue; // ✅ Stop connecting after 4th year

          const rectA = yearRefs.current[i]?.getBoundingClientRect();
          const rectB = yearRefs.current[i + 1]?.getBoundingClientRect();
          if (!rectA || !rectB) continue;

          // Convert bubble coords to container-relative
          const AcenterX = rectA.left - containerRect.left + rectA.width / 2;
          const AcenterY = rectA.top - containerRect.top + rectA.height / 2;
          const BcenterX = rectB.left - containerRect.left + rectB.width / 2;
          const BcenterY = rectB.top - containerRect.top + rectB.height / 2;

          // Distance & angle
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

    // Initial calculation
    recalcLines();
  }, [timelineYears, windowWidth, windowHeight]);

  // Colors consistent with BigScreenPage
  const colors = {
    yearBubble: "#00C4CC",
    selectedYear: "#00C4CC",
  };

  // General bubble style (Matching BigScreenPage)
  const roundBubble = {
    width: "5rem",
    height: "5rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.4rem",
    padding: "0.5rem",
    position: "absolute",
    userSelect: "none", // 🔥 Prevents text selection
  };
 // If no timeline data
 if (!timelineYears || timelineYears.length === 0) {
  return (
    <Box
      sx={{
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(to bottom, #1e3c72, #2a5298)",
        userSelect: "none",
      }}
    >
      Loading timeline data...
    </Box>
  );
}

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #1e3c72, #2a5298)",
        padding: 0,
        overflow: "hidden",
        position: "relative",
        userSelect: "none", 
      }}
    >
      {/* Centered Heading */}
      <Typography variant="h3" color="white" fontWeight="bold" mb={4} sx={{ userSelect: "none" }}>
        🎬 Interactive Timeline
      </Typography>

      {/* Scrollable Horizontal Container */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
          width: "100%",
          maxWidth: "100vw",
          overflowX: "auto",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          padding: "1rem",
          mt: 2,
          height: "60vh",
          userSelect: "none", // 🔥 Prevents selection in scrollable area
        }}
      >
        {/* Lines (absolute inside container) */}
        {lineStyles.map((style, idx) => (
          <motion.div
            key={idx}
            initial={{ width: 0 }}
            animate={{ width: style.width }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              height: "8px",
              backgroundColor: "#00C4CC",
              left: style.left,
              top: style.top,
              transform: style.transform,
              transformOrigin: "left",
              zIndex: 1,
              userSelect: "none", // 🔥 Disables text selection for lines
            }}
          />
        ))}

        {/* Year Bubbles (Buttons) */}
        {timelineYears.map((year, index) => {
          const translateY = index % 2 === 1 ? "-5rem" : "5rem";

          return (
            <Box
              key={year}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                marginLeft: "4vw",
                marginRight: "4vw",
                transform: `translateY(${translateY})`,
                zIndex: 5,
                userSelect: "none", // 🔥 Prevents accidental selection
              }}
            >
              {/* YEAR BUBBLE WITH HOVER & TOUCH EFFECT */}
              <motion.div
                ref={(el) => (yearRefs.current[index] = el)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.3, transition: { duration: 0.3 } }} // 🔥 Hover Effect
                whileTap={{ scale: 0.85, transition: { duration: 0.1 } }} // 🔥 Touch Effect
                transition={{ duration: 0.5 }}
                style={{
                  ...roundBubble,
                  backgroundColor: colors.yearBubble,
                  top: "50%", // Center vertically
                  left: "50%", // Center horizontally
                  transform: "translate(-50%, -50%)", // Perfect center
                  cursor: "pointer",
                }}
                onClick={() => sendYearSelection(year)}
              >
                <Box
                  sx={{
                    backgroundColor: "#FFED00",
                    padding: "0.75rem 2rem",
                    borderRadius: "10px",
                    color: "#222",
                    userSelect: "none", // 🔥 Prevents text selection inside button
                  }}
                >
                  {year}
                </Box>
              </motion.div>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
