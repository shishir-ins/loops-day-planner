import { useEffect, useRef, useCallback } from "react";

const hourlyMessages = [
  "Drink water loops 💖",
  "There's a lot of work waiting for youu 💕",
  "Fighting! 💪",
  "Take a stretch break 🌿",
  "You're doing great, keep it up! 🌟",
  "Don't forget to eat something yummy 🍓",
  "Take a deep breath, you got this 🍃",
];

export const useNotifications = () => {
  const permissionRef = useRef(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((p) => {
        permissionRef.current = p === "granted";
      });
    } else if ("Notification" in window) {
      permissionRef.current = Notification.permission === "granted";
    }
  }, []);

  // Reminders every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (permissionRef.current) {
        const msg = hourlyMessages[Math.floor(Math.random() * hourlyMessages.length)];
        new Notification("Loop's Day! 🍃", { body: msg });
      }
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const notifyNewTask = useCallback((taskName: string) => {
    if (permissionRef.current) {
      new Notification("✨ New task from your love!", {
        body: `"${taskName}" was just added for you 💕`,
      });
    }
  }, []);

  const notifyDeadline = useCallback((taskName: string) => {
    if (permissionRef.current) {
      new Notification("⏰ Deadline approaching!", {
        body: `"${taskName}" is almost due! You got this 💖`,
      });
    }
  }, []);

  return { notifyNewTask, notifyDeadline };
};
