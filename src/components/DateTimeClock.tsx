import { useState, useEffect } from "react";
import { format } from "date-fns";

const DateTimeClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center space-y-1">
      <p className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
        {format(now, "hh:mm:ss a")}
      </p>
      <p className="text-sm text-muted-foreground font-display">
        {format(now, "EEEE, MMMM do, yyyy")}
      </p>
    </div>
  );
};

export default DateTimeClock;
