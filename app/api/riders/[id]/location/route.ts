import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/db";
import Rider from "@/models/Rider";
import dbConnect from "@/lib/dbConnect";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const { id } = await params;
    const { lat, lng } = await request.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { success: false, message: "lat and lng must be numbers" },
        { status: 400 },
      );
    }

    const rider = await Rider.findByIdAndUpdate(
      id,
      {
        currentLocation: { lat, lng, updatedAt: new Date() },
      },
      { new: true },
    );

    if (!rider) {
      return NextResponse.json(
        { success: false, message: "Rider not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, rider });
  } catch (error) {
    console.error("Update rider location error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update location" },
      { status: 500 },
    );
  }
}
