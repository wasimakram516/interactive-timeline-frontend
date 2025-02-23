"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { Box, IconButton, Typography } from "@mui/material";
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
  const [yearLineStyles, setYearLineStyles] = useState([]);
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useEffect(() => {
    if (timelineRecords.length === 0) return;

    // Initialize yearRefs with null values
    yearRefs.current = Array(timelineRecords.length)
      .fill()
      .map((_, i) => yearRefs.current[i] || null);

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
  }, [timelineRecords, windowWidth, windowHeight]);

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

  // Program Bubbles with Text Wrapping
const programBubbleStyle = {
  ...bubbleStyle, // Inherits shared bubble styles
  whiteSpace: "normal", // Allows text to wrap
  wordWrap: "break-word", // Ensures long words break to fit
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "1rem", // Adds padding for better spacing
  minWidth: "8rem", // Minimum width
  maxWidth: "8rem", // Maximum width to prevent overflow
  height: "8rem", // Height adjusts based on content
};

  const bubblePulseAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1], // Gentle pulse
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  const revealBounceAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 2,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        repeat: Infinity,
        repeatType: "mirror",
        y: {
          duration: 1,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
      },
    },
  };

  const mediaRotateScaleAnimation = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.05, 1], // Subtle scaling
      rotate: [0, 3, -3, 0], // Gentle rotation
      transition: {
        duration: 6,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  const infographicPopAnimation = {
    initial: { scale: 0.8, opacity: 0.8 },
    animate: {
      scale: [0.9, 1, 0.9], // Pop effect
      opacity: [0.9, 1, 0.9], // Fade in and out
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        height: "85vh",
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

      {/* 📌 LEFT: Timeline Container (70%) */}
      <Box sx={{ width: "70%", height: "100%", position: "relative" }}>
        {/* Timeline Years */}
        {timelineRecords.map((year, index) => {
          const isActive = selectedEvent?.year === year.year;

          return (
            <motion.div
              key={year._id}
              style={{
                position: "absolute",
                left: `${year.xPosition}%`,
                top: `${year.yPosition}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Year Bubble */}
              <motion.div
                ref={(el) => (yearRefs.current[index] = el)}
                initial={bubblePulseAnimation.initial}
                animate={bubblePulseAnimation.animate}
                style={{
                  ...bubbleStyle,
                  background: isActive
                    ? "linear-gradient(90deg, #0088ff, #00ffcc)"
                    : "radial-gradient(circle, #009688, #00796b)",
                  color: isActive ? "#222" : "#fff",
                  borderRadius: isActive ? "10px" : "50%",
                  minWidth: isActive ? "8rem" : "5rem",
                  height: isActive ? "4rem" : "5rem",
                  padding: isActive ? "1rem 1.5rem" : "1rem",
                }}
              >
                {year.year}
              </motion.div>
            </motion.div>
          );
        })}

        {/* Title and Description (Separate Block) */}
        {selectedEvent?.entries?.map((entry) => {
          // Skip if xPosition or yPosition is null
          if (entry.xPosition === null || entry.yPosition === null) return null;

          return (
            <Box
              key={`title-desc-${entry._id}`}
              sx={{
                position: "absolute",
                left: `${entry.xPosition}%`,
                top: `${entry.yPosition}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 20,
              }}
            >
              {/* Title and Description */}
              {entry.title && (
                <motion.div
                  style={{
                    ...bubbleStyle,
                    background: "linear-gradient(90deg, #526172, #0093B4)",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "1rem",
                    minWidth: "17rem",
                    minHeight: "5rem",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    textAlign: "left",
                    whiteSpace: "normal",
                    flexGrow: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>
                    {entry.title}
                  </Typography>
                  {entry.description?.length > 0 && (
                    <Box>
                      {entry.description.length === 1 ? (
                        <Typography variant="body1">
                          {entry.description[0]}
                        </Typography>
                      ) : (
                        <ul style={{ paddingLeft: "1rem", margin: 0 }}>
                          {entry.description.map((desc, i) => (
                            <li key={i}>
                              <Typography variant="body1">{desc}</Typography>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Box>
                  )}
                </motion.div>
              )}
            </Box>
          );
        })}

        {/* Media (Separate Block) */}
        {selectedEvent?.entries?.map((entry) => {
          // Skip if xPosition or yPosition is null
          if (entry.xPosition === null || entry.yPosition === null) return null;

          return (
            <React.Fragment key={`media-${entry._id}`}>
              {entry.media?.map((media, i) => {
                // Skip if xPosition or yPosition is null
                if (media.xPosition === null || media.yPosition === null)
                  return null;

                return (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      left: `${media.xPosition}%`,
                      top: `${media.yPosition}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 20,
                    }}
                  >
                    <motion.div
                      initial={mediaRotateScaleAnimation.initial}
                      animate={mediaRotateScaleAnimation.animate}
                      style={{
                        background: "transparent",
                        borderRadius:
                          media.mediaType === "image" ? "50%" : "10px",
                        boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
                        overflow: "hidden",
                      }}
                    >
                      {media.mediaType === "image" ? (
                        <img
                          src={media.url}
                          alt="Media"
                          style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <video
                          src={media.url}
                          autoPlay
                          muted
                          loop
                          controls={false}
                          style={{
                            width: "300px",
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      )}
                    </motion.div>
                  </Box>
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Infographics (Separate Block) */}
        {selectedEvent?.entries?.map((entry) => {
          // Skip if xPosition or yPosition is null
          if (entry.xPosition === null || entry.yPosition === null) return null;

          return (
            <React.Fragment key={`infographics-${entry._id}`}>
              {entry.infographics?.map((infographic, i) => {
                // Skip if xPosition or yPosition is null
                if (
                  infographic.xPosition === null ||
                  infographic.yPosition === null
                )
                  return null;

                return (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      left: `${infographic.xPosition}%`,
                      top: `${infographic.yPosition}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 20,
                    }}
                  >
                    <motion.div
                      initial={infographicPopAnimation.initial}
                      animate={infographicPopAnimation.animate}
                      style={{
                        background: "transparent",
                        borderRadius: "10px",
                        boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={infographic.url}
                        alt="Infographic"
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                        }}
                      />
                    </motion.div>
                  </Box>
                );
              })}
            </React.Fragment>
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

      {/* 📌 RIGHT: Program Container (30%) */}
      <Box sx={{ width: "30%", height: "100%", position: "relative" }}>
        {/* Program Titles */}
        {programRecords.map((program, index) => {
          const isActive = selectedProgram?.title === program.title;

          return (
            <motion.div
              key={program._id}
              style={{
                position: "absolute",
                left: `${program.xPosition}%`,
                top: `${program.yPosition}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Program Bubble */}
              <motion.div
                initial={bubblePulseAnimation.initial}
                animate={bubblePulseAnimation.animate}
                style={{
                  ...programBubbleStyle, // Use the updated style
                  background: isActive
                    ? "linear-gradient(90deg, #0088ff, #00ffcc)"
                    : "radial-gradient(circle, #009688, #00796b)",
                  color: isActive ? "#222" : "#fff",
                  borderRadius: isActive ? "10px" : "50%",
                }}
              >
                {program.title}
              </motion.div>
            </motion.div>
          );
        })}

        {/* Title and Description (Separate Block) */}
        {selectedProgram?.entries?.map((entry) => {
          // Skip if xPosition or yPosition is null
          if (entry.xPosition === null || entry.yPosition === null) return null;

          return (
            <Box
              key={`title-desc-${entry._id}`}
              sx={{
                position: "absolute",
                left: `${entry.xPosition}%`,
                top: `${entry.yPosition}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 20,
              }}
            >
              {/* Title and Description */}
              {entry.title && (
                <motion.div
                  style={{
                    ...bubbleStyle,
                    background: "linear-gradient(90deg, #526172, #0093B4)",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "1rem",
                    minWidth: "20rem",
                    minHeight: "5rem",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    textAlign: "left",
                    whiteSpace: "normal",
                    flexGrow: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>
                    {entry.title}
                  </Typography>
                  {entry.description?.length > 0 && (
                    <Box>
                      {entry.description.length === 1 ? (
                        <Typography variant="body1">
                          {entry.description[0]}
                        </Typography>
                      ) : (
                        <ul style={{ paddingLeft: "1rem", margin: 0 }}>
                          {entry.description.map((desc, i) => (
                            <li key={i}>
                              <Typography variant="body1">{desc}</Typography>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Box>
                  )}
                </motion.div>
              )}
            </Box>
          );
        })}

        {/* Media (Separate Block) */}
        {selectedProgram?.entries?.map((entry) => {
          // Skip if xPosition or yPosition is null
          if (entry.xPosition === null || entry.yPosition === null) return null;

          return (
            <React.Fragment key={`media-${entry._id}`}>
              {entry.media?.map((media, i) => {
                // Skip if xPosition or yPosition is null
                if (media.xPosition === null || media.yPosition === null)
                  return null;

                return (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      left: `${media.xPosition}%`,
                      top: `${media.yPosition}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 20,
                    }}
                  >
                    <motion.div
                      initial={mediaRotateScaleAnimation.initial}
                      animate={mediaRotateScaleAnimation.animate}
                      style={{
                        background: "transparent",
                        borderRadius:
                          media.mediaType === "image" ? "50%" : "10px",
                        boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
                        overflow: "hidden",
                      }}
                    >
                      {media.mediaType === "image" ? (
                        <img
                          src={media.url}
                          alt="Media"
                          style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <video
                          src={media.url}
                          autoPlay
                          muted
                          loop
                          controls={false}
                          style={{
                            width: "300px",
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      )}
                    </motion.div>
                  </Box>
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Infographics (Separate Block) */}
        {selectedProgram?.entries?.map((entry) => {
          // Skip if xPosition or yPosition is null
          if (entry.xPosition === null || entry.yPosition === null) return null;

          return (
            <React.Fragment key={`infographics-${entry._id}`}>
              {entry.infographics?.map((infographic, i) => {
                // Skip if xPosition or yPosition is null
                if (
                  infographic.xPosition === null ||
                  infographic.yPosition === null
                )
                  return null;

                return (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      left: `${infographic.xPosition}%`,
                      top: `${infographic.yPosition}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 20,
                    }}
                  >
                    <motion.div
                      initial={infographicPopAnimation.initial}
                      animate={infographicPopAnimation.animate}
                      style={{
                        background: "transparent",
                        borderRadius: "10px",
                        boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={infographic.url}
                        alt="Infographic"
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                        }}
                      />
                    </motion.div>
                  </Box>
                );
              })}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
}
