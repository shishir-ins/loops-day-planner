import { useMemo } from "react";

const LEAF_SHAPES = ["🍃", "🌿", "🍀", "🌱"];

const FloatingLeaves = () => {
  const leaves = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 18 + Math.random() * 15,
        delay: Math.random() * 20,
        size: 14 + Math.random() * 14,
        shape: LEAF_SHAPES[i % LEAF_SHAPES.length],
        opacity: 0.3 + Math.random() * 0.3,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => (
        <span
          key={leaf.id}
          className="absolute animate-float-leaf"
          style={{
            left: `${leaf.left}%`,
            fontSize: leaf.size,
            opacity: leaf.opacity,
            "--duration": `${leaf.duration}s`,
            "--delay": `${leaf.delay}s`,
            animationDelay: `${leaf.delay}s`,
          } as React.CSSProperties}
        >
          {leaf.shape}
        </span>
      ))}
    </div>
  );
};

export default FloatingLeaves;
