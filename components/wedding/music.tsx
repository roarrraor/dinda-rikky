"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface MusicCtx {
  playing: boolean;
  toggle: () => void;
}

const Ctx = createContext<MusicCtx | null>(null);

export const useMusic = () => useContext(Ctx);

/** Pemutar musik latar. Otomatis jalan saat undangan dibuka (setelah gesture user). */
export function MusicProvider({
  opened,
  audioUrl,
  children,
}: {
  opened: boolean;
  audioUrl?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !opened) return;
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [opened]);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().then(() => setPlaying(true)).catch(() => {});
    else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  const value = useMemo(() => ({ playing, toggle }), [playing, toggle]);

  return (
    <Ctx.Provider value={value}>
      {audioUrl && <audio ref={ref} data-opened={opened} src={audioUrl} loop preload="auto" />}
      {children}
    </Ctx.Provider>
  );
}
