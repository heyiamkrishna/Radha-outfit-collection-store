import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const isConnected = conn.connection.readyState === 1;

    return NextResponse.json(
      {
        status: isConnected ? "healthy" : "degraded",
        database: isConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message,
      },
      { status: 500 }
    );
  }
}