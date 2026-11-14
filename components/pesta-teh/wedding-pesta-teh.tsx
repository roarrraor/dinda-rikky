"use client";

import { MotionConfig } from "motion/react";
import { useMemo, useState } from "react";
import { COPY, ID, PALETTE, paletteVars, type WeddingData } from "@/lib/pesta-teh/data";
import { displayName, formatDate } from "@/lib/pesta-teh/format";
import { buildEvents } from "@/lib/pesta-teh/events";
import { Cover } from "./cover";
import { PhoneFrame } from "./phone-frame";
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

/** Tema undangan "Pesta Teh" — komponen utama (dulu: `WeddingPestaTeh`). */
export function WeddingPestaTeh({ data, guestName }: { data: WeddingData; guestName?: string }) {
  const [opened, setOpened] = useState(false);

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
    initialName: guestName,
    eventChoices: events.map((e) => e.title),
  });

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
      <PhoneFrame
        names={[first, second]}
        first={first}
        second={second}
        date={data.date}
        venue={data.venue}
        groomPhoto={data.groomPhoto}
        bridePhoto={data.bridePhoto}
        groomName={data.groom}
        brideName={data.bride}
        bgColor={PALETTE.bg}
        panelBgColor={PALETTE.primary}
      >
        <Cover
          first={first}
          second={second}
          date={data.date}
          guestName={guestName}
          opened={opened}
          onOpen={() => setOpened(true)}
          audioUrl={data.musicUrl}
          style={paletteVars(PALETTE)}
        >
          <main className="relative overflow-clip">
            <TableSection first={first} second={second} date={data.date} venue={events[0]?.venue || data.venue} />
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
          </main>
        </Cover>
      </PhoneFrame>
    </MotionConfig>
  );
}

export { ID };
