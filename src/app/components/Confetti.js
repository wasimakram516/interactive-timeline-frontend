"use client";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function Confetti({ loop = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });

    let animationFrameId;

    const frame = () => {
      myConfetti({
        particleCount: 5,
        angle: 60,
        spread: 70,
        origin: { x: 0.5, y: 0.5 }, // Center of the canvas
      });

      myConfetti({
        particleCount: 5,
        angle: 120,
        spread: 70,
        origin: { x: 0.5, y: 0.5 }, // Center of the canvas
      });

      if (loop) {
        animationFrameId = requestAnimationFrame(frame);
      }
    };

    // Start the animation
    frame();

    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      myConfetti.reset();
    };
  }, [loop]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
