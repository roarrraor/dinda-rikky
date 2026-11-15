import { NextResponse } from "next/server";

// Stub: bentuk respons sama seperti di mirror.
// Photobooth v1 (2026-11-15) tidak memakai endpoint ini — foto diproses di
// perangkat tamu dan strip disimpan lewat tombol Simpan/Bagikan di /photobooth.
// Galeri bersama (semua tamu bisa lihat foto satu sama lain) butuh storage
// backend; endpoint ini tempatnya kalau nanti mau ditambah.
export async function GET() {
  return NextResponse.json({ hasUploaded: false, count: 0, limit: 1, open: false });
}
