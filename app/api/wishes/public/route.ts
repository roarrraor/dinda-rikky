import { NextResponse } from "next/server";
import wishes from "@/lib/pesta-teh/wishes.json";

// Data ucapan demo (snapshot dari mirror). Ganti dengan query ke database kamu.
export async function GET() {
  return NextResponse.json(wishes);
}
