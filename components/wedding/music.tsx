"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface MusicCtx {
  playing: boolean;
  toggle: () => void;
}

const Ctx = createContext<MusicCtx | null>(null);

export const useMusic = () => useContext(Ctx);

/** Pemutar musik latar. Jalan saat `startMusic` true (setelah bunyi klik segel
    selesai), bukan saat undangan tampil — biar lagu masuk setelah sfx buka amplop. */
export function MusicProvider({
  opened,
  audioUrl,
  startMusic,
  children,
}: {
  opened: boolean;
  audioUrl?: string;
  startMusic?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !startMusic) return;
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [startMusic]);

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
