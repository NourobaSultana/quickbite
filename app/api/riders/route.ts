import { NextRequest, NextResponse } from "next/server";
import Rider from "@/models/Rider";
import dbConnect from "@/lib/dbConnect";

// Register a new rider. There's no rider auth system yet, so
// this is a simple registration endpoint you can call once
// (e.g. from Postman or a quick seed script) to create riders
// who can then be auto-assigned to incoming orders.
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { name, phone, vehicle } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Name and phone are required" },
        { status: 400 },
      );
    }

    const rider = await Rider.create({ name, phone, vehicle });

    return NextResponse.json({ success: true, rider }, { status: 201 });
  } catch (error) {
    console.error("Create rider error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create rider" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const riders = await Rider.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, riders });
  } catch (error) {
    console.error("Fetch riders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch riders" },
      { status: 500 },
    );
  }
}
