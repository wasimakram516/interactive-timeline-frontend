"use client";
import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import useWebSocketBigScreen from "../../hooks/useWebSocketBigScreen";
import { Shift } from "ambient-cbg";

/**
 * Custom Hook: track window size in real time.
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

// For year bubble: if reselected, do a quick shake
const reselectVariant = {
  normal: { x: 0, transition: { duration: 0.2 } },
  shake: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

const fadeInScale = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function BigScreenPage() {
  const { timelineRecords, selectedEvent } = useWebSocketBigScreen();

  // Container for horizontal scrolling
  const scrollContainerRef = useRef(null);

  // Year bubble refs
  const yearRefs = useRef([]);
  // Info bubble refs
  const infoRefs = useRef({});

  // Lines
  const [lineStyles, setLineStyles] = useState([]);

  // Track which years are revealed
  const [revealedYears, setRevealedYears] = useState(new Set());

  // Count how many times each year is selected (for the “re-select” shake)
  const [yearSelectCount, setYearSelectCount] = useState({});
  // e.g. { 2022: 1, 2023: 2, ... }

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  /**
   * On kiosk’s year selection:
   * - Add year to `revealedYears`
   * - Increment selection count to handle re-selection animation
   */
  useEffect(() => {
    if (selectedEvent?.year) {
      setRevealedYears((prev) => new Set(prev).add(selectedEvent.year));
      setYearSelectCount((prev) => {
        const oldCount = prev[selectedEvent.year] || 0;
        return { ...prev, [selectedEvent.year]: oldCount + 1 };
      });
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedEvent?.year && revealedYears.has(selectedEvent.year)) {
      const mediaRef = infoRefs.current[selectedEvent.year]?.mediaRef;
      if (mediaRef) {
        const mediaElement = mediaRef.querySelector("video");
        if (mediaElement) {
          mediaElement.muted = true;
          mediaElement.play().catch((error) => {
            console.log("Autoplay prevented:", error);
          });
        }
      }
    }
  }, [revealedYears, selectedEvent]);

  // Auto-scroll left on timeline changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [timelineRecords]);

  /**
   * Recalculate lines on:
   * - timeline changes
   * - revealed changes
   * - window resize
   * - container scroll
   */
  useEffect(() => {
    const containerEl = scrollContainerRef.current;
    if (!containerEl || timelineRecords.length < 1) return;

    console.log("🔄 Recalculating lines...");

    requestAnimationFrame(() => {
      const containerRect = containerEl.getBoundingClientRect();
      const newLines = [];

      // ✅ Only draw Year → Year lines (skip revealed info bubbles)
      for (let i = 0; i < timelineRecords.length - 1; i++) {
        if ((i + 1) % 4 === 0) continue; // ✅ Stop connecting after every 4th year

        const yA = yearRefs.current[i];
        const yB = yearRefs.current[i + 1];
        if (!yA || !yB) continue;

        const rectA = yA.getBoundingClientRect();
        const rectB = yB.getBoundingClientRect();

        const Ax = rectA.left - containerRect.left + rectA.width / 2;
        const Ay = rectA.top - containerRect.top + rectA.height / 2;
        const Bx = rectB.left - containerRect.left + rectB.width / 2;
        const By = rectB.top - containerRect.top + rectB.height / 2;

        const dx = Bx - Ax;
        const dy = By - Ay;
        const dist = Math.sqrt(dx ** 2 + dy ** 2);
        const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

        newLines.push({
          width: dist + "px",
          transform: `rotate(${angleDeg}deg)`,
          left: Ax + "px",
          top: Ay + "px",
        });
      }

      // ❌ Removed Year → InfoBubble connections
      // Previously, we had another loop here that was adding lines from each revealed year to its info bubbles.
      // That logic has been entirely removed to prevent unwanted connections.

      // ✅ Update only if there are changes
      setLineStyles((prevLines) => {
        if (JSON.stringify(prevLines) !== JSON.stringify(newLines)) {
          return newLines;
        }
        return prevLines;
      });
    });
  }, [timelineRecords, windowWidth, windowHeight]); // ✅ Removed `revealedYears` from dependencies

  const colors = {
    yearBubble: "#00C4CC",
    selectedYear: "#00C4CC",
    titleBubble: "#1C2541",
    descriptionBubble: "#0D1B2A", // Almost Black Blue
    mediaBubble: "#172A45", // Stormy Blue
  };

  // General bubble style
  const roundBubble = {
    width: "5rem", // Slightly bigger
    height: "5rem", // Keep it round
    borderRadius: "50%",
    boxShadow: "0 0 10px rgba(255,255,255,0.1)", // Subtle glow effect
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    wordWrap: "break-word",
    color: "#ffffff", // White text for contrast
    fontWeight: "bold",
    fontSize: "1.4rem",
    padding: "0.5rem",
    position: "absolute",
    userSelect: "none",
  };

  // If no timeline data
  if (!timelineRecords || timelineRecords.length === 0) {
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
    <AnimatePresence>
      <Box
        sx={{
          display: "flex",
          padding: 0,
          margin: 0,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          boxSizing: "border-box",
          userSelect: "none",
          background: "linear-gradient(to bottom, #1e3c72, #2a5298)",
        }}
      >
        {/* Scroll container for main timeline */}
        <Box
          ref={scrollContainerRef}
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            overflowX: "auto",
            whiteSpace: "nowrap",
            height: "100vh",
            width: "100%",
            p: "1rem",
          }}
        >
          {/* Lines */}
          {lineStyles.map((style, idx) => (
            <motion.div
              key={idx}
              initial={{ width: 0 }}
              animate={{ width: style.width }}
              transition={{ duration: 0.5 }}
              style={{
                position: "absolute",
                height: "10px",
                backgroundColor: "#00C4CC",
                left: style.left,
                top: style.top,
                transform: style.transform,
                transformOrigin: "left",
                zIndex: 1,
              }}
            />
          ))}

          {timelineRecords.map((event, i) => {
            const isRevealed = revealedYears.has(event.year);
            const translateY = i % 2 === 1 ? "-5rem" : "5rem";

            // Count how many times this year is selected
            const selectCount = yearSelectCount[event.year] || 0;
            // If selectCount > 1 => do "shake"
            const yearAnimState = selectCount > 1 ? "shake" : "normal";

            infoRefs.current[event.year] ||= {};

            return (
              <Box
                key={`${event.year}-${selectCount}`} // Force re-render on reselect
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  marginLeft: "4vw",
                  marginRight: "4vw",
                  transform: `translateY(${translateY})`,
                  zIndex: 5,
                }}
              >
                {/* YEAR BUBBLE (Framer Motion for reselect shake) */}
                <motion.div
                  ref={(el) => (yearRefs.current[i] = el)}
                  variants={reselectVariant}
                  initial={false}
                  animate={yearAnimState}
                  key={`year-${selectCount}`} // New key for animation reset
                  style={{
                    ...roundBubble,
                    backgroundColor:
                      selectedEvent?.year === event.year
                        ? colors.selectedYear
                        : colors.yearBubble,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "#FFED00",
                      padding: "0.75rem 2rem",
                      borderRadius: "10px",
                      color: "#222",
                    }}
                  >
                    {event.year}
                  </Box>
                </motion.div>

                {/* If not revealed => no sub-bubbles */}
                {isRevealed && (
                  <>
                    {/* ✅ Even-indexed bubbles: DESCRIPTION BELOW, MEDIA ABOVE */}
                    {i % 2 === 0 ? (
                      <>
                        {/* MEDIA ABOVE */}
                        {Array.isArray(event.media) &&
                          event.media.length > 0 && (
                            <motion.div
                              ref={(el) =>
                                (infoRefs.current[event.year].mediaRef = el)
                              }
                              variants={fadeInScale}
                              initial="initial"
                              animate="animate"
                              style={{
                                position: "absolute",
                                width: "15rem",
                                minHeight: "auto",
                                top: "-20vh",
                                left: "50%",
                                transform: "translateX(-50%)",
                                color: "#000",
                                overflow: "hidden",
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "left",
                                alignItems: "center",
                                gap: "5px",
                                padding: "10px",
                                borderRadius: "10px",
                              }}
                            >
                              {event.media.map((mediaItem, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    width: "8vw",
                                    height: "8vh",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    borderRadius: "10px",
                                    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  {mediaItem.type === "image" ? (
                                    <img
                                      src={mediaItem.url}
                                      alt={`Media ${index + 1} for ${
                                        event.year
                                      }`}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                      }}
                                    />
                                  ) : mediaItem.type === "video" ? (
                                    <video
                                      src={mediaItem.url}
                                      muted
                                      autoPlay
                                      loop
                                      playsInline
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                      }}
                                    />
                                  ) : null}
                                </Box>
                              ))}
                            </motion.div>
                          )}

                        {/* DESCRIPTION BELOW */}
                        {Array.isArray(event.description) &&
  event.description.some((desc) => desc.trim() !== "") && (
    <motion.div
      ref={(el) => (infoRefs.current[event.year].descRef = el)}
      variants={fadeInScale}
      initial="initial"
      animate="animate"
      style={{
        position: "absolute",
        width: "16rem", // ✅ Slightly wider for better readability
        maxWidth: "20rem", // ✅ Allows some flexibility for longer text
        minHeight: "fit-content", // ✅ Grows based on content
        top: "140px", // ✅ Expands upwards instead of downwards
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(225,225,225,0.85)", // ✅ Slightly more opacity for readability
        color: "#333",
        fontSize: "1rem",
        padding: "1rem",
        textAlign: "left",
        overflowY: "visible", // ✅ Ensures content is always visible
        wordBreak: "break-word", // ✅ Ensures long words wrap properly
        whiteSpace: "normal", // ✅ Prevents single-line overflow
        display: "flex",
        alignItems: "stretch", // ✅ Allows container to expand properly
        justifyContent: "center",
        flexDirection: "column",
        borderRadius: "15px",
        boxShadow: "0 0 10px rgba(255,255,255,0.1)",
      }}
    >
      <ol style={{ paddingLeft: "1rem", margin: 0, wordBreak: "break-word" }}>
        {event.description.map((point, index) => (
          <li key={index} style={{ marginBottom: "0.3rem" }}>
            {point}
          </li>
        ))}
      </ol>
    </motion.div>
  )}

                      </>
                    ) : (
                      <>
                        {/* ✅ Odd-indexed bubbles: DESCRIPTION ABOVE, MEDIA BELOW */}

                        {/* DESCRIPTION ABOVE */}
                        {Array.isArray(event.description) &&
  event.description.some((desc) => desc.trim() !== "") && (
    <motion.div
      ref={(el) => (infoRefs.current[event.year].descRef = el)}
      variants={fadeInScale}
      initial="initial"
      animate="animate"
      style={{
        position: "absolute",
        width: "16rem", // ✅ Slightly wider for better readability
        maxWidth: "20rem", // ✅ Allows some flexibility for longer text
        minHeight: "fit-content", // ✅ Grows based on content
        bottom: "40px", // ✅ Expands upwards instead of downwards
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(225,225,225,0.85)", // ✅ Slightly more opacity for readability
        color: "#333",
        fontSize: "1rem",
        padding: "1rem",
        textAlign: "left",
        overflowY: "visible", // ✅ Ensures content is always visible
        wordBreak: "break-word", // ✅ Ensures long words wrap properly
        whiteSpace: "normal", // ✅ Prevents single-line overflow
        display: "flex",
        alignItems: "stretch", // ✅ Allows container to expand properly
        justifyContent: "center",
        flexDirection: "column",
        borderRadius: "15px",
        boxShadow: "0 0 10px rgba(255,255,255,0.1)",
      }}
    >
      <ol style={{ paddingLeft: "1rem", margin: 0, wordBreak: "break-word" }}>
        {event.description.map((point, index) => (
          <li key={index} style={{ marginBottom: "0.3rem" }}>
            {point}
          </li>
        ))}
      </ol>
    </motion.div>
  )}


                        {/* MEDIA SECTION - Displays multiple images/videos */}
                        {Array.isArray(event.media) &&
                          event.media.length > 0 && (
                            <motion.div
                              ref={(el) =>
                                (infoRefs.current[event.year].mediaRef = el)
                              }
                              variants={fadeInScale}
                              initial="initial"
                              animate="animate"
                              style={{
                                position: "absolute",
                                width: "15rem",
                                minHeight: "auto",
                                top: "20vh", // ✅ This ensures correct media positioning
                                left: "50%",
                                transform: "translateX(-50%)",
                                color: "#000",
                                overflow: "hidden",
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "left",
                                alignItems: "center",
                                gap: "5px",
                                padding: "10px",
                                borderRadius: "10px",
                              }}
                            >
                              {event.media.map((mediaItem, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    width: "8vw",
                                    height: "8vh",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    borderRadius: "10px",
                                    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  {mediaItem.type === "image" ? (
                                    <img
                                      src={mediaItem.url}
                                      alt={`Media ${index + 1} for ${
                                        event.year
                                      }`}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                      }}
                                    />
                                  ) : mediaItem.type === "video" ? (
                                    <video
                                      src={mediaItem.url}
                                      muted
                                      autoPlay
                                      loop
                                      playsInline
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                      }}
                                    />
                                  ) : null}
                                </Box>
                              ))}
                            </motion.div>
                          )}
                      </>
                    )}
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </AnimatePresence>
  );
}
