import { useState } from "react";
import { BellRing, Download, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { usePwaInstall } from "@/hooks/usePwaInstall";

interface PwaInstallCardProps {
  notificationsSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
}

const PwaInstallCard = ({
  notificationsSupported,
  permission,
  requestPermission,
}: PwaInstallCardProps) => {
  const { canInstall, install, isInstalled, isiOS } = usePwaInstall();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);

    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-strong mb-6 w-full rounded-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-2 text-primary">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-base font-semibold text-foreground">Install on her phone</h2>
            {isInstalled && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Installed
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Put Loops Day Planner on the home screen so it opens like an app and keeps the planner shell available even on a spotty connection.
          </p>

          {!isInstalled && canInstall && (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Download className="h-4 w-4" />
              {installing ? "Opening install prompt..." : "Install App"}
            </button>
          )}

          {!isInstalled && isiOS && !canInstall && (
            <p className="mt-4 rounded-xl bg-secondary/60 px-3 py-2 text-sm text-foreground">
              On iPhone or iPad, open the browser share sheet and choose <span className="font-semibold">Add to Home Screen</span>.
            </p>
          )}

          <div className="mt-4 rounded-xl border border-primary/10 bg-background/70 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BellRing className="h-4 w-4 text-primary" />
              Notification access
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Alerts work best after the app has been installed and notifications are allowed.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              The app is installable and push-ready now, but fully closed-app push notifications still need a server-side web-push sender.
            </p>

            {notificationsSupported ? (
              permission === "granted" ? (
                <p className="mt-3 text-sm font-medium text-primary">Notifications are enabled on this device.</p>
              ) : permission === "denied" ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Notifications are currently blocked in the browser settings for this device.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void requestPermission();
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  <BellRing className="h-4 w-4" />
                  Enable Notifications
                </button>
              )
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">This browser does not expose the web notification APIs needed for the app alerts.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PwaInstallCard;
