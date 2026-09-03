import { useState, useEffect, useRef } from 'react';

export function useTimer(initialSeconds: number, onExpire: () => void, active: boolean = true) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);
  
  // Track the absolute target time
  const targetTimeRef = useRef<number | null>(null);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Sync initial seconds if it changes (e.g. starting a new exam)
  useEffect(() => {
    setSecondsLeft(initialSeconds);
    targetTimeRef.current = null;
  }, [initialSeconds]);

  useEffect(() => {
    if (!active) {
      targetTimeRef.current = null;
      return;
    }

    // Set target time based on CURRENT state when activated
    if (!targetTimeRef.current) {
      // Need to use the functional state update to safely read current secondsLeft without adding it as a dependency
      setSecondsLeft((currentSeconds) => {
        targetTimeRef.current = Date.now() + currentSeconds * 1000;
        return currentSeconds;
      });
    }

    const checkTime = () => {
      if (targetTimeRef.current) {
        const remaining = Math.max(0, Math.ceil((targetTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);
        
        if (remaining <= 0) {
          targetTimeRef.current = null;
          onExpireRef.current();
        }
      }
    };

    // Run standard interval
    const intervalId = setInterval(checkTime, 500);

    // Catch up immediately when the user switches back to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTime();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active]); // No secondsLeft dependency, so interval stays alive

  return secondsLeft;
}

