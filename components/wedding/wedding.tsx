"use client";

import { MotionConfig, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { COPY, ID, PALETTE, paletteVars, type WeddingData } from "@/lib/wedding/data";
import { displayName, formatDate } from "@/lib/wedding/format";
import { buildEvents } from "@/lib/wedding/events";
import { resolveGuestName } from "@/lib/wedding/guests";
import { Cover } from "./cover";
import { BurstSection, SalamSection, TableSection } from "./sections-a";
import { CoupleSection, RundownSection, SaveDateSection, type Person } from "./sections-b";
import {
  ClosingSection,
  DressCodeSection,
  GallerySection,
  GiftSection,
  PhotoboothSection,
  RsvpSection,
  StorySection,
} from "./sections-c";
import { useRsvpForm } from "./use-rsvp-form";

const FALLBACK_GREETING =
  "Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.";

/** Tema undangan "Pesta Teh" — komponen utama (dulu: `Wedding`). */
export function Wedding({ data, guestName }: { data: WeddingData; guestName?: string }) {
  const [opened, setOpened] = useState(false);

  // Nama tamu: ?to= dari server didahulukan (boleh nama langsung atau slug
  // daftar tamu); kalau tidak ada, baca #slug dari hash di browser.
  const [hashGuest, setHashGuest] = useState<string | undefined>(undefined);
  useEffect(() => {
    try {
      const h = window.location.hash.replace(/^#/, "").trim();
      if (h) setHashGuest(resolveGuestName(decodeURIComponent(h)));
    } catch {
      /* abaikan hash yang tidak valid */
    }
  }, []);
  const effectiveGuest = resolveGuestName(guestName) ?? hashGuest;

  const events = useMemo(
    () =>
      buildEvents({
        ...data,
        akadTitle: data.akadTitle?.trim() || "Akad Nikah",
        resepsiTitle: data.resepsiTitle?.trim() || "Resepsi Nikah",
      }),
    [data],
  );

  const form = useRsvpForm({
    slug: data.slug,
    initialName: effectiveGuest,
    eventChoices: events.map((e) => e.title),
  });

  // Nama dari #slug baru ketahuan setelah mount — isi ke form kalau masih kosong.
  useEffect(() => {
    if (hashGuest && !form.name) form.setName(hashGuest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hashGuest]);

  const brideFirst = data.nameOrder === "bride-first";
  const groomName = displayName(data.groom, data.groomNickname);
  const brideName = displayName(data.bride, data.brideNickname);
  const [first, second] = brideFirst ? [brideName, groomName] : [groomName, brideName];
  const initials = `${first.charAt(0)}${second.charAt(0)}`;

  const muslim = data.isMuslimGreeting !== false;
  const showRsvp = data.isRsvp !== false;
  const showWishes = data.isWishes !== false;
  const hashtag = data.hashtag?.trim().replace(/^#/, "");
  const shortDate = formatDate(data.date, "DD.MM.YY");

  const caption = useMemo(
    () => ({
      names: `${first} & ${second}`.toUpperCase(),
      date: shortDate,
      tag: hashtag ? `#${hashtag}` : null,
    }),
    [first, second, shortDate, hashtag],
  );

  const person = (who: "groom" | "bride"): Person => {
    const g = who === "groom";
    return {
      name: g ? data.groom : data.bride,
      nickname: g ? data.groomNickname : data.brideNickname,
      photo: g ? data.groomPhoto : data.bridePhoto,
      relation: g ? "son" : "daughter",
      childOrder: g ? data.groomChildOrder : data.brideChildOrder,
      father: g ? data.fatherGroom : data.fatherBride,
      mother: g ? data.motherGroom : data.motherBride,
      instagram: g ? data.groomInstagram : data.brideInstagram,
    };
  };
  const people = brideFirst ? [person("bride"), person("groom")] : [person("groom"), person("bride")];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-[#EFEAE3]">
        {/* transform di sini bikin overlay cover (position: fixed) nempel ke kolom ini,
            bukan ke viewport — jadi di desktop amplop tetap selebar kolom undangan */}
        <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-white shadow-[0_0_60px_rgba(0,0,0,0.10)] [transform:translateZ(0)]">
          <Cover
            first={first}
            second={second}
            date={data.date}
            guestName={effectiveGuest}
            hashtag={data.hashtag}
            opened={opened}
            onOpen={() => setOpened(true)}
            audioUrl={data.musicUrl}
            style={paletteVars(PALETTE)}
          >
          <motion.main
            className="relative overflow-clip"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <TableSection first={first} second={second} date={data.date} venue={events[0]?.venue || data.venue} hashtag={data.hashtag} />
            <BurstSection date={data.date} />
            <SalamSection
              muslim={muslim}
              greeting={data.openingGreeting?.trim() || (muslim ? COPY.greeting : FALLBACK_GREETING)}
              quote={data.isQuote !== false ? data.quoteText : null}
              quoteSource={data.quoteSource}
            />
            <CoupleSection people={people} showPhotos={data.isCouplePhoto !== false} initials={initials} />
            <SaveDateSection date={data.date} title={`${first} & ${second}`} events={events} />
            <RundownSection rundown={data.rundown} />
            <StorySection story={data.story} />
            {data.isDressCode !== false && (
              <DressCodeSection note={data.dresscode} wear={data.dresscodeColors?.wear ?? []} />
            )}
            <GallerySection photos={(data.photos ?? []).filter(Boolean)} />
            <PhotoboothSection caption={caption} />
            {(showRsvp || showWishes) && (
              <RsvpSection form={form} slug={data.slug} showRsvp={showRsvp} showWishes={showWishes} />
            )}
            <GiftSection
              gifts={data.gifts}
              qrisPhoto={data.qrisPhoto}
              giftAddress={data.giftAddress}
              giftReceiver={data.giftReceiver}
            />
            <ClosingSection
              first={first}
              second={second}
              isMuslimGreeting={data.isMuslimGreeting}
              hashtag={data.hashtag}
            />
          </motion.main>
          </Cover>
        </div>
      </div>
    </MotionConfig>
  );
}

export { ID };
