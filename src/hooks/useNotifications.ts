import { useEffect, useRef } from "react";

const hourlyMessages = [
  "Drink water loops 💖",
  "There's a lot of work waiting for youu 💕",
  "Fighting! 💪",
  "Take a stretch break 🌿",
  "You're doing great, keep it up! 🌟",
];

export const useNotifications = () => {
  const permissionRef = useRef(false);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((p) => {
        permissionRef.current = p === "granted";
      });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (permissionRef.current) {
        const msg = hourlyMessages[Math.floor(Math.random() * hourlyMessages.length)];
        new Notification("Loop's Day! 🍃", { body: msg, icon: "🐼" });
      }
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const notifyDeadline = (taskName: string) => {
    if (permissionRef.current) {
      new Notification("⏰ Deadline approaching!", {
        body: `"${taskName}" is almost due! You got this 💖`,
      });
    }
  };

  return { notifyDeadline };
};
