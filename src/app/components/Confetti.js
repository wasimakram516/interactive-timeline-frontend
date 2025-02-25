"use client";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function Confetti({ x, y, loop = true }) {
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
        particleCount: 3, 
        angle: 60,
        spread: 70,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      });

      myConfetti({
        particleCount: 10,
        angle: 120,
        spread: 70,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
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
  }, [x, y, loop]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}