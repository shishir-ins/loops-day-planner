import { motion } from "framer-motion";

const characters = [
  { emoji: "🐼", bottom: "5%", side: "left", startX: "3%" },
  { emoji: "🧸", bottom: "8%", side: "right", startX: "85%" },
  { emoji: "🐼", bottom: "20%", side: "left", startX: "8%" },
  { emoji: "🧸", bottom: "15%", side: "right", startX: "90%" },
];

const PixelCharacters = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
    {characters.map((c, i) => (
      <motion.div
        key={i}
        className="absolute text-2xl sm:text-3xl"
        style={{
          bottom: c.bottom,
          left: c.side === "left" ? c.startX : undefined,
          right: c.side === "right" ? `calc(100% - ${c.startX})` : undefined,
          imageRendering: "pixelated",
        }}
        animate={{
          x: [0, 20, 0, -20, 0],
          y: [0, -8, 0, -8, 0],
        }}
        transition={{
          duration: 4 + i,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 1.2,
        }}
      >
        {c.emoji}
      </motion.div>
    ))}
  </div>
);

export default PixelCharacters;
