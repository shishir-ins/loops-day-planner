import { useCallback, useEffect, useRef, useState } from "react";
import { getServiceWorkerRegistration } from "@/lib/pwa";

const hourlyMessages = [
  "Drink some water, Loops.",
  "You have a few things waiting for you.",
  "Keep going. You are doing well.",
  "Take a quick stretch break.",
  "You are doing great. Keep it up.",
  "Do not forget to eat something good.",
  "Take a deep breath. You have this.",
];

export const useNotifications = () => {
  const permissionRef = useRef(false);
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof Notification === "undefined" ? "default" : Notification.permission
  );

  useEffect(() => {
    permissionRef.current = permission === "granted";
  }, [permission]);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);

      if (Notification.permission === "default") {
        void Notification.requestPermission().then((nextPermission) => {
          setPermission(nextPermission);
        });
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      return "denied" as const;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    return nextPermission;
  }, []);

  const showNotification = useCallback(async (title: string, body: string, tag: string) => {
    if (!permissionRef.current) {
      return;
    }

    const registration = await getServiceWorkerRegistration();
    const notificationUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (registration) {
      await registration.showNotification(title, {
        body,
        tag,
        icon: `${import.meta.env.BASE_URL}icon-192.png`,
        badge: `${import.meta.env.BASE_URL}icon-192.png`,
        data: {
          url: notificationUrl,
        },
      });
      return;
    }

    new Notification(title, { body, tag });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (permissionRef.current) {
        const msg = hourlyMessages[Math.floor(Math.random() * hourlyMessages.length)];
        void showNotification("Loop's Day!", msg, "loops-reminder");
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [showNotification]);

  const notifyNewTask = useCallback(
    (taskName: string, isAdmin = false) => {
      if (permissionRef.current) {
        if (isAdmin) {
          void showNotification("Task added", `"${taskName}" was added for Loops.`, "loops-admin-task");
        } else {
          void showNotification("New task added", `"${taskName}" was added to the planner.`, "loops-user-task");
        }
      }
    },
    [showNotification]
  );

  const notifyDeadline = useCallback(
    (taskName: string) => {
      if (permissionRef.current) {
        void showNotification("Deadline tomorrow", `"${taskName}" is due within the next day.`, "loops-deadline");
      }
    },
    [showNotification]
  );

  return {
    notifyNewTask,
    notifyDeadline,
    notificationsSupported: typeof Notification !== "undefined",
    permission,
    requestPermission,
  };
};
