"use client";
import { useEffect, useState } from "react";

export function useCountdown(dateIso: string) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(dateIso).getTime();
  const diff = now === null ? 0 : Math.max(0, target - now);
  const arrived = now !== null && target - now <= 0;

  const s = Math.floor(diff / 1000);
  const units = [
    { label: "Hari", value: Math.floor(s / 86400) },
    { label: "Jam", value: Math.floor((s % 86400) / 3600) },
    { label: "Menit", value: Math.floor((s % 3600) / 60) },
    { label: "Detik", value: s % 60 },
  ];
  return { arrived, units };
}
