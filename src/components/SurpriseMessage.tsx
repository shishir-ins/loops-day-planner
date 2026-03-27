import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const surprises = [
  "You are loved 💕",
  "The world is better with you in it 🌍",
  "You make people smile without even trying 🌸",
  "Your heart is pure gold 💛",
];

const SurpriseMessage = () => {
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setMsg(surprises[Math.floor(Math.random() * surprises.length)]);
      setShow(true);
      setTimeout(() => setShow(false), 4000);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl px-6 py-3 shadow-xl"
        >
          <p className="text-sm font-display font-semibold text-love">{msg}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SurpriseMessage;
