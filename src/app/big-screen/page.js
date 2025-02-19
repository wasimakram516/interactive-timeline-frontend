"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Box, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import useWebSocketBigScreen from "@/hooks/useWebSocketBigScreen";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Shift } from "ambient-cbg";

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

  // --- RADIUS SETTINGS FOR EACH BUBBLE ---
  const MAIN_BUBBLE_RADIUS = 2.5; // ~5rem diameter => 2.5rem radius
  const DESC_BUBBLE_RADIUS = 5; // ~10rem diameter => 5rem radius
  const MEDIA_BUBBLE_RADIUS = 5; // ~10rem diameter => 5rem radius
  const INFOGRAPHIC_BUBBLE_RADIUS = 4; // ~8rem diameter => 4rem radius
  const SPACING = 2; // Additional spacing between bubbles (rem)

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        height: "100vh",
        userSelect: "none",
      }}
    >
      <Shift />

      <IconButton
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "white",
          zIndex: 99,
        }}
        onClick={() => router.push("/")}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* 📌 LEFT: Year Bubbles (70%) */}
      <Box sx={{ width: "70%", height: "100%", position: "relative" }}>
        {timelineRecords.map((year, index) => {
          const isActive = selectedEvent?.year === year.year;
          const yPosition = year.yPosition;

          // Position logic
          const placeBelow = yPosition <= 20;
          const placeAbove = yPosition >= 80;
          const distributeEvenly = !placeBelow && !placeAbove;

          // We'll track how far we've stacked above & below
          let offsetAbove = MAIN_BUBBLE_RADIUS; // start just beyond the main bubble
          let offsetBelow = MAIN_BUBBLE_RADIUS;

          return (
            <Box
              key={year.year}
              sx={{
                position: "absolute",
                left: `${year.xPosition}%`,
                top: `${year.yPosition}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Year Bubble */}
              <motion.div
                ref={(el) => (yearRefs.current[index] = el)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  background: isActive
                    ? "linear-gradient(90deg, #0088ff, #00ffcc)"
                    : "radial-gradient(circle, #009688, #00796b)",
                  color: isActive ? "#222" : "#fff",
                  borderRadius: isActive ? "10px" : "50%",

                  color: isActive ? "#222" : "#fff",
                  borderRadius: isActive ? "10px" : "50%",
                  color: isActive ? "#000" : "#fff",
                  minWidth: isActive ? "8rem" : "5rem",
                  height: isActive ? "4rem" : "5rem",
                  padding: isActive ? "1rem 1.5rem" : "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                {year.year}
              </motion.div>

              {/* If active, show the info bubbles */}
              {isActive && (
                <>
                  {/* DESCRIPTION BUBBLES */}
                  {selectedEvent.description?.length > 0 &&
                    selectedEvent.description.some(
                      (desc) => desc.trim() !== ""
                    ) &&
                    (() => {
                      // Filter valid descriptions
                      const validDescriptions =
                        selectedEvent.description.filter(
                          (desc) => desc.trim() !== ""
                        );

                      // Don't render if there are no valid descriptions
                      if (validDescriptions.length === 0) return null;

                      // Decide above/below
                      let yDir = 1; // +1 => below, -1 => above
                      if (placeAbove) {
                        yDir = -1;
                      } else if (placeBelow) {
                        yDir = 1;
                      } else {
                        // distributeEvenly => choose the side with more space
                        yDir = offsetBelow <= offsetAbove ? 1 : -1;
                      }

                      // Positioning offset
                      let finalOffset = 0;
                      if (yDir === -1) {
                        // Going above
                        finalOffset = -(
                          offsetAbove +
                          DESC_BUBBLE_RADIUS +
                          SPACING
                        );
                        offsetAbove += DESC_BUBBLE_RADIUS * 2 + SPACING;
                      } else {
                        // Going below
                        finalOffset =
                          offsetBelow + DESC_BUBBLE_RADIUS + SPACING;
                        offsetBelow += DESC_BUBBLE_RADIUS * 2 + SPACING;
                      }

                      return (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: `calc(50% + ${finalOffset}rem)`,
                            transform: "translate(-50%, -50%)",
                            background:
                              "linear-gradient(90deg, #0088ff, #00ffcc)",
                            color: "#000",
                            padding: "1rem",
                            borderRadius: "50%",
                            textAlign: "center",
                            width: "14rem",
                            minHeight: "12rem",
                            maxHeight: "16rem", // Prevents overflow
                            boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
                            fontSize: "1.2rem",
                            zIndex: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            overflow: "hidden", // Prevents text from spilling out
                            wordWrap: "break-word",
                            paddingTop: "1.5rem",
                          }}
                        >
                          <ul
                            style={{
                              margin: 0,
                              padding: "0 1rem",
                              textAlign: "left",
                              listStyle: "decimal",
                              maxWidth: "100%",
                              overflowWrap: "break-word", // Ensures text breaks properly
                              wordBreak: "break-word",
                              overflowY: "auto", // Enables scrolling for long text
                              maxHeight: "14rem",
                            }}
                          >
                            {validDescriptions.map((desc, i) => (
                              <li
                                key={i}
                                style={{
                                  marginBottom: "0.5rem",
                                  fontSize: "1rem",
                                }}
                              >
                                {desc}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      );
                    })()}

                  {/* MEDIA BUBBLE */}
                  {selectedEvent.media?.url && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        position: "absolute",
                        left: "50%",
                        // Let's place media below if top or distribute, above if bottom
                        top: (() => {
                          // We'll put it below unless placeAbove is set
                          if (placeAbove) {
                            const yVal = -(
                              offsetAbove +
                              MEDIA_BUBBLE_RADIUS +
                              SPACING
                            );
                            offsetAbove += MEDIA_BUBBLE_RADIUS * 2 + SPACING;
                            return `calc(50% + ${yVal}rem)`;
                          } else {
                            const yVal =
                              offsetBelow + MEDIA_BUBBLE_RADIUS + SPACING;
                            offsetBelow += MEDIA_BUBBLE_RADIUS * 2 + SPACING;
                            return `calc(50% + ${yVal}rem)`;
                          }
                        })(),
                        transform: "translate(-50%, -50%)",
                        background: "transparent",
                        borderRadius: "50%",
                        boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
                        zIndex: 2100,
                      }}
                    >
                      {selectedEvent.media.type === "image" ? (
                        <img
                          src={selectedEvent.media.url}
                          alt="Media"
                          style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <video
                          src={selectedEvent.media.url}
                          controls
                          style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* INFOGRAPHIC BUBBLE */}
                  {selectedEvent.infographic?.url && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        position: "absolute",
                        left: "50%",
                        // We'll place it below if top or distribute, above if bottom
                        top: (() => {
                          if (placeAbove) {
                            const yVal = -(
                              offsetAbove +
                              INFOGRAPHIC_BUBBLE_RADIUS +
                              SPACING
                            );
                            offsetAbove +=
                              INFOGRAPHIC_BUBBLE_RADIUS * 2 + SPACING;
                            return `calc(50% + ${yVal}rem)`;
                          } else {
                            const yVal =
                              offsetBelow + INFOGRAPHIC_BUBBLE_RADIUS + SPACING;
                            offsetBelow +=
                              INFOGRAPHIC_BUBBLE_RADIUS * 2 + SPACING;
                            return `calc(50% + ${yVal}rem)`;
                          }
                        })(),
                        transform: "translate(-50%, -50%)",
                        background: "transparent",
                        borderRadius: "50%",
                        boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
                      }}
                    >
                      <img
                        src={selectedEvent.infographic.url}
                        alt="Infographic"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </Box>
          );
        })}
        {/* Lines Connecting Year Bubbles */}
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
      <Box sx={{ width: "30%", height: "100%", position: "relative" }}>
        {programRecords.map((program, index) => {
          const isActive = selectedProgram?.title === program.title;
          const yPosition = program.yPosition;

          // Position logic
          const placeBelow = yPosition <= 20;
          const placeAbove = yPosition >= 80;
          const distributeEvenly = !placeBelow && !placeAbove;

          // We'll track how far we've stacked above & below
          let offsetAbove = MAIN_BUBBLE_RADIUS; // start just beyond the main bubble
          let offsetBelow = MAIN_BUBBLE_RADIUS;

          return (
            <Box
              key={`program-${index}`}
              sx={{
                position: "absolute",
                left: `${program.xPosition}%`,
                top: `${program.yPosition}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Program Bubble */}
              <motion.div
                ref={(el) => (programRefs.current[index] = el)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  background: isActive
                    ? "linear-gradient(90deg, #0088ff, #00ffcc)"
                    : "radial-gradient(circle, #009688, #00796b)",
                  color: isActive ? "#222" : "#fff",
                  borderRadius: isActive ? "10px" : "50%",

                  color: isActive ? "#222" : "#fff",
                  borderRadius: isActive ? "10px" : "50%",
                  color: isActive ? "#000" : "#fff",
                  minWidth: isActive ? "8rem" : "5rem",
                  height: isActive ? "4rem" : "5rem",
                  padding: isActive ? "1rem 1.5rem" : "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                {program.title}
              </motion.div>

              {/* If active, show the info bubbles */}
              {isActive && (
                <>
                  {/* DESCRIPTION BUBBLES */}
                  {selectedProgram.description?.length > 0 &&
                    selectedProgram.description.some(
                      (desc) => desc.trim() !== ""
                    ) &&
                    (() => {
                      // Filter valid descriptions
                      const validDescriptions =
                        selectedProgram.description.filter(
                          (desc) => desc.trim() !== ""
                        );

                      // Don't render if there are no valid descriptions
                      if (validDescriptions.length === 0) return null;

                      // Decide above/below
                      let yDir = 1; // +1 => below, -1 => above
                      if (placeAbove) {
                        yDir = -1;
                      } else if (placeBelow) {
                        yDir = 1;
                      } else {
                        // distributeEvenly => choose the side with more space
                        yDir = offsetBelow <= offsetAbove ? 1 : -1;
                      }

                      // Positioning offset
                      let finalOffset = 0;
                      if (yDir === -1) {
                        // Going above
                        finalOffset = -(
                          offsetAbove +
                          DESC_BUBBLE_RADIUS +
                          SPACING
                        );
                        offsetAbove += DESC_BUBBLE_RADIUS * 2 + SPACING;
                      } else {
                        // Going below
                        finalOffset =
                          offsetBelow + DESC_BUBBLE_RADIUS + SPACING;
                        offsetBelow += DESC_BUBBLE_RADIUS * 2 + SPACING;
                      }

                      return (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: `calc(50% + ${finalOffset}rem)`,
                            transform: "translate(-50%, -50%)",
                            background:
                              "linear-gradient(90deg, #0088ff, #00ffcc)",
                            color: "#000",
                            padding: "1rem",
                            borderRadius: "50%",
                            textAlign: "center",
                            width: "14rem",
                            minHeight: "12rem",
                            maxHeight: "16rem", // Prevents overflow
                            boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
                            fontSize: "1.2rem",
                            zIndex: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            overflow: "hidden", // Prevents text from spilling out
                            wordWrap: "break-word",
                            paddingTop: "1.5rem",
                          }}
                        >
                          <ul
                            style={{
                              margin: 0,
                              padding: "0 1rem",
                              textAlign: "left",
                              listStyle: "decimal",
                              maxWidth: "100%",
                              overflowWrap: "break-word", // Ensures text breaks properly
                              wordBreak: "break-word",
                              overflowY: "auto", // Enables scrolling for long text
                              maxHeight: "14rem",
                            }}
                          >
                            {validDescriptions.map((desc, i) => (
                              <li
                                key={i}
                                style={{
                                  marginBottom: "0.5rem",
                                  fontSize: "1rem",
                                }}
                              >
                                {desc}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      );
                    })()}

                  {/* MEDIA BUBBLE */}
                  {selectedProgram.media?.url && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        position: "absolute",
                        left: "50%",
                        // Let's place media below if top or distribute, above if bottom
                        top: (() => {
                          // We'll put it below unless placeAbove is set
                          if (placeAbove) {
                            const yVal = -(
                              offsetAbove +
                              MEDIA_BUBBLE_RADIUS +
                              SPACING
                            );
                            offsetAbove += MEDIA_BUBBLE_RADIUS * 2 + SPACING;
                            return `calc(50% + ${yVal}rem)`;
                          } else {
                            const yVal =
                              offsetBelow + MEDIA_BUBBLE_RADIUS + SPACING;
                            offsetBelow += MEDIA_BUBBLE_RADIUS * 2 + SPACING;
                            return `calc(50% + ${yVal}rem)`;
                          }
                        })(),
                        transform: "translate(-50%, -50%)",
                        background: "transparent",
                        borderRadius: "50%",
                        boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
                        zIndex: 2100,
                      }}
                    >
                      {selectedProgram.media.type === "image" ? (
                        <img
                          src={selectedProgram.media.url}
                          alt="Media"
                          style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <video
                          src={selectedProgram.media.url}
                          controls
                          style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* INFOGRAPHIC BUBBLE */}
                  {selectedProgram.infographic?.url && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        position: "absolute",
                        left: "50%",
                        // We'll place it below if top or distribute, above if bottom
                        top: (() => {
                          if (placeAbove) {
                            const yVal = -(
                              offsetAbove +
                              INFOGRAPHIC_BUBBLE_RADIUS +
                              SPACING
                            );
                            offsetAbove +=
                              INFOGRAPHIC_BUBBLE_RADIUS * 2 + SPACING;
                            return `calc(50% + ${yVal}rem)`;
                          } else {
                            const yVal =
                              offsetBelow + INFOGRAPHIC_BUBBLE_RADIUS + SPACING;
                            offsetBelow +=
                              INFOGRAPHIC_BUBBLE_RADIUS * 2 + SPACING;
                            return `calc(50% + ${yVal}rem)`;
                          }
                        })(),
                        transform: "translate(-50%, -50%)",
                        background: "transparent",
                        borderRadius: "50%",
                        boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
                      }}
                    >
                      <img
                        src={selectedProgram.infographic.url}
                        alt="Infographic"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
