"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function LoadingIntro({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if user has seen intro this session
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");

    if (hasSeenIntro) {
      setShow(false);
      onComplete();
      return;
    }

    // Hide after 1.5s
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("hasSeenIntro", "true");
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  const text = "Key-Kingdom";
  const letters = text.split("");

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background-DEFAULT"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-6xl font-bold text-text-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                delay: i * 0.05,
                duration: 0.3,
              }}
              className="inline-block"
            >
              {letter === "-" ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
