const TZ_OFFSETS: Record<string, number> = { WIB: 7, WITA: 8, WIT: 9 };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** "09:00 – 11:00 WITA" -> { startH, startM, endH, endM, tzOffset } */
function parseTime(timeStr: string) {
  const zone = (timeStr.match(/\b(WIB|WITA|WIT)\b/)?.[1] ?? "WIB") as keyof typeof TZ_OFFSETS;
  const tzOffset = TZ_OFFSETS[zone];
  const times = [...timeStr.matchAll(/(\d{1,2})[:.](\d{2})/g)].map((m) => [Number(m[1]), Number(m[2])]);
  if (times.length === 0) return null;
  const [startH, startM] = times[0];
  const [endH, endM] = times[1] ?? [startH + 2, startM];
  return { startH, startM, endH, endM, tzOffset };
}

function toUtcStamp(dateIso: string, h: number, m: number, tzOffset: number) {
  const [y, mo, d] = dateIso.slice(0, 10).split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d, h - tzOffset, m, 0));
  return (
    `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}` +
    `T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`
  );
}

export function googleCalendarUrl(opts: {
  title: string;
  details: string;
  location: string;
  dateIso: string;
  timeStr: string;
}) {
  const parsed = opts.timeStr ? parseTime(opts.timeStr) : null;
  const params = new URLSearchParams({ action: "TEMPLATE", text: opts.title });
  if (parsed) {
    const start = toUtcStamp(opts.dateIso, parsed.startH, parsed.startM, parsed.tzOffset);
    const end = toUtcStamp(opts.dateIso, parsed.endH, parsed.endM, parsed.tzOffset);
    params.set("dates", `${start}/${end}`);
  }
  params.set("details", opts.details);
  params.set("location", opts.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
