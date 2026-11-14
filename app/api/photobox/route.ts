import { NextResponse } from "next/server";

// Stub: bentuk respons sama seperti di mirror. Implementasi photobox asli belum direkonstruksi.
export async function GET() {
  return NextResponse.json({ hasUploaded: false, count: 0, limit: 1, open: false });
}
