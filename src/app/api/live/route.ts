import { NextResponse } from "next/server";
import { getLiveProvider } from "@/lib/live";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getLiveProvider().getCluster();
  return NextResponse.json(snapshot);
}
