import { NextRequest, NextResponse } from "next/server";
import Rider from "@/models/Rider";
import dbConnect from "@/lib/dbConnect";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const { id } = await params;

    const rider = await Rider.findById(id);

    if (!rider) {
      return NextResponse.json(
        {
          success: false,
          message: "Rider not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      rider,
    });
  } catch (error) {
    console.error("Fetch rider error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch rider",
      },
      { status: 500 },
    );
  }
}
