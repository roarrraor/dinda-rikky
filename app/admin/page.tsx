"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Wish = {
  id: string;
  name: string;
  message: string;
  attendance: string | null;
  parent_id: string | null;
  created_at: string;
};

type Rsvp = {
  id: string;
  name: string;
  attendance: string | null;
  pax: number;
  events: string[];
  category: string | null;
  message: string | null;
  created_at: string;
};

const FIELD_GROUPS: { title: string; fields: { key: string; label: string; type?: string }[] }[] = [
  {
    title: "Mempelai",
    fields: [
      { key: "bride", label: "Nama mempelai wanita" },
      { key: "groom", label: "Nama mempelai pria" },
      { key: "brideNickname", label: "Panggilan wanita" },
      { key: "groomNickname", label: "Panggilan pria" },
      { key: "fatherBride", label: "Ayah mempelai wanita" },
      { key: "motherBride", label: "Ibu mempelai wanita" },
      { key: "fatherGroom", label: "Ayah mempelai pria" },
      { key: "motherGroom", label: "Ibu mempelai pria" },
    ],
  },
  {
    title: "Acara",
    fields: [
      { key: "date", label: "Tanggal & jam acara", type: "datetime-local" },
      { key: "venue", label: "Tempat utama" },
      { key: "akadTitle", label: "Judul akad" },
      { key: "resepsiTitle", label: "Judul resepsi" },
      { key: "akad", label: "Jam akad" },
      { key: "resepsi", label: "Jam resepsi" },
      { key: "akadVenue", label: "Tempat akad" },
      { key: "resepsiVenue", label: "Tempat resepsi" },
      { key: "akadAddress", label: "Alamat akad" },
      { key: "resepsiAddress", label: "Alamat resepsi" },
      { key: "akadMapsUrl", label: "Link Google Maps akad", type: "url" },
      { key: "mapsUrl", label: "Link Google Maps utama", type: "url" },
    ],
  },
  {
    title: "Lainnya",
    fields: [
      { key: "hashtag", label: "Hashtag (tanpa #)" },
      { key: "dresscode", label: "Dress code" },
      { key: "giftAddress", label: "Alamat kirim kado", type: "textarea" },
      { key: "giftReceiver", label: "Penerima kado" },
    ],
  },
];

const ALL_KEYS = FIELD_GROUPS.flatMap((g) => g.fields.map((f) => f.key));

function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function localInputToIso(v: string): string {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toISOString();
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function readError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    if (typeof j?.error === "string" && j.error) return j.error;
  } catch {
    /* abaikan */
  }
  return `Gagal (${res.status})`;
}

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    const [sRes, wRes, rRes] = await Promise.all([
      fetch("/api/admin/settings"),
      fetch("/api/admin/wishes"),
      fetch("/api/admin/rsvps"),
    ]);
    if (sRes.status === 401 || wRes.status === 401 || rRes.status === 401) {
      setLoggedIn(false);
      return false;
    }
    if (sRes.ok) {
      const j = await sRes.json();
      const next: Record<string, string> = {};
      for (const k of ALL_KEYS) {
        const v = j?.data?.[k];
        next[k] = k === "date" ? isoToLocalInput(typeof v === "string" ? v : "") : typeof v === "string" ? v : "";
      }
      setForm(next);
    } else {
      setNotice(await readError(sRes));
    }
    if (wRes.ok) setWishes((await wRes.json()).data ?? []);
    if (rRes.ok) setRsvps((await rRes.json()).data ?? []);
    setLoggedIn(true);
    return true;
  }, []);

  useEffect(() => {
    loadAll().finally(() => setChecking(false));
  }, [loadAll]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError(await readError(res));
      return;
    }
    setPassword("");
    setChecking(true);
    await loadAll();
    setChecking(false);
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLoggedIn(false);
    setWishes([]);
    setRsvps([]);
  }

  async function onSaveSettings(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    const payload: Record<string, string> = { ...form };
    if (payload.date) payload.date = localInputToIso(payload.date);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setNotice(await readError(res));
    } else {
      setNotice("Data undangan tersimpan.");
    }
    setSaving(false);
  }

  async function onDeleteWish(id: string, name: string) {
    if (!window.confirm(`Hapus ucapan dari ${name}?`)) return;
    const res = await fetch(`/api/admin/wishes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      setNotice(await readError(res));
      return;
    }
    setWishes((cur) => cur.filter((w) => w.id !== id));
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#6F9440] focus:ring-1 focus:ring-[#6F9440]";

  if (checking) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl items-center justify-center px-4">
        <p className="text-sm text-neutral-500">Memuat…</p>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
        <h1 className="text-2xl font-bold text-neutral-900">Admin Undangan</h1>
        <p className="mt-1 text-sm text-neutral-500">Masuk dengan password admin untuk mengelola undangan.</p>
        <form onSubmit={onLogin} className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password admin"
            autoComplete="current-password"
            className={inputCls}
          />
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#6F9440] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5d7d36]"
          >
            Masuk
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-3xl bg-[#FAF7F2] px-4 py-8 text-neutral-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Undangan</h1>
          <p className="mt-1 text-sm text-neutral-500">Dinda &amp; Rikky — kelola data, ucapan, dan RSVP.</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="shrink-0 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Keluar
        </button>
      </div>

      {notice && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{notice}</p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Data Undangan</h2>
        <form onSubmit={onSaveSettings} className="mt-4 space-y-6 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
          {FIELD_GROUPS.map((group) => (
            <fieldset key={group.title}>
              <legend className="text-sm font-semibold text-neutral-700">{group.title}</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {group.fields.map((f) => (
                  <label key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <span className="mb-1 block text-xs font-medium text-neutral-600">{f.label}</span>
                    {f.type === "textarea" ? (
                      <textarea
                        value={form[f.key] ?? ""}
                        onChange={(e) => setForm((cur) => ({ ...cur, [f.key]: e.target.value }))}
                        rows={2}
                        className={inputCls}
                      />
                    ) : (
                      <input
                        type={f.type ?? "text"}
                        value={form[f.key] ?? ""}
                        onChange={(e) => setForm((cur) => ({ ...cur, [f.key]: e.target.value }))}
                        className={inputCls}
                      />
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#6F9440] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5d7d36] disabled:opacity-50"
          >
            {saving ? "Menyimpan…" : "Simpan Data Undangan"}
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Ucapan ({wishes.length})</h2>
        {wishes.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">Belum ada ucapan.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {wishes.map((w) => (
              <li key={w.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {w.name}
                      {w.parent_id && (
                        <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                          Balasan
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm whitespace-pre-wrap break-words text-neutral-700">{w.message}</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {fmtDate(w.created_at)}
                      {w.attendance ? ` • ${w.attendance}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteWish(w.id, w.name)}
                    className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">RSVP ({rsvps.length})</h2>
        {rsvps.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">Belum ada RSVP.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                  <th className="px-4 py-2.5 font-medium">Nama</th>
                  <th className="px-4 py-2.5 font-medium">Kehadiran</th>
                  <th className="px-4 py-2.5 font-medium">Jumlah</th>
                  <th className="px-4 py-2.5 font-medium">Acara</th>
                  <th className="px-4 py-2.5 font-medium">Pesan</th>
                  <th className="px-4 py-2.5 font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-100 align-top last:border-0">
                    <td className="px-4 py-2.5 font-medium">{r.name}</td>
                    <td className="px-4 py-2.5">{r.attendance ?? "—"}</td>
                    <td className="px-4 py-2.5">{r.pax} orang</td>
                    <td className="px-4 py-2.5">{r.events?.length ? r.events.join(", ") : "—"}</td>
                    <td className="max-w-56 px-4 py-2.5 break-words text-neutral-600">{r.message || "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-neutral-500">{fmtDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
