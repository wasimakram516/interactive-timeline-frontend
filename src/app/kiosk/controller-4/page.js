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

export default function ControllerFour() {
  const router = useRouter();
  const { programTitles, sendProgramSelection } = useWebSocketKiosk();
  const scrollContainerRef = useRef(null);
  const titleRefs = useRef([]);
  const [lineStyles, setLineStyles] = useState([]);
  const { width: windowWidth } = useWindowSize();
  const [selectedTitle, setSelectedTitle] = useState(null); // ✅ Store the selected title

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [programTitles]);

  useEffect(() => {
    const containerEl = scrollContainerRef.current;
    if (!containerEl || titleRefs.current.length < 2) return;

    const recalcLines = () => {
      requestAnimationFrame(() => {
        const newStyles = [];
        const containerRect = containerEl.getBoundingClientRect();

        for (let i = 0; i < titleRefs.current.length - 1; i++) {
          const rectA = titleRefs.current[i]?.getBoundingClientRect();
          const rectB = titleRefs.current[i + 1]?.getBoundingClientRect();
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
  }, [programTitles, windowWidth]);

  // ✅ Default Bubble Style
  const roundBubble = {
    background: "radial-gradient(circle, #009688, #00796b)",
    boxShadow: "0px 0px 20px rgba(0, 255, 204, 0.8)",
    color: "white",
    fontSize: "1.5rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "bold",
    padding: "0.5rem",
    position: "absolute",
    userSelect: "none",
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
  };

  const programBubbleStyle = {
    ...roundBubble, // Inherits shared bubble styles
    whiteSpace: "normal", // Allows text to wrap
    wordWrap: "break-word", // Ensures long words break to fit
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "1rem", // Adds padding for better spacing
    minWidth: "10rem", // Minimum width
    height: "10rem", // Height adjusts based on content
  };

  // ✅ Selected Title Style (Rectangle)
  const selectedStyle = {
    background: "linear-gradient(90deg, #0088ff, #00ffcc)",
    boxShadow: "0px 0px 25px rgba(0, 255, 255, 1)",
    whiteSpace: "normal", // Allows text to wrap
    wordWrap: "break-word",
    color: "#000",
    fontSize: "1.4rem",
    width: "12rem",
    height: "8rem",
    padding: "1rem 1.5rem",
    borderRadius: "10px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
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
        🎮 Controller 4
      </Typography>
      <Typography variant="h6" color="lightgray" mb={4}>
      Program Selection Panel
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
        {/* ✅ Draw Connecting Lines */}
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

        {/* ✅ Display Titles as Selectable Bubbles */}
        {programTitles.map((title, index) => {
          const translateY = index % 2 === 1 ? "-3rem" : "3rem";

          return (
            <Box
              key={`${title}-${index}`} // ✅ Ensure Unique Key by Appending Index
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
                ref={(el) => (titleRefs.current[index] = el)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.2, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.85, transition: { duration: 0.1 } }}
                transition={{ duration: 0.5 }}
                style={{
                  ...programBubbleStyle,
                  ...(selectedTitle === title ? selectedStyle : {}), // ✅ Transform into rectangle when selected
                }}
                onClick={() => {
                  setSelectedTitle(title); // ✅ Store selected title
                  sendProgramSelection(title);
                }}
              >
                {title}
              </motion.div>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
