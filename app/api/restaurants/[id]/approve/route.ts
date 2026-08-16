import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import dbConnect from "@/lib/dbConnect";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    // Get token
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // Only admin
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only admin can approve restaurants",
        },
        { status: 403 },
      );
    }

    const { id } = await params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const { isApproved } = body;

    if (typeof isApproved !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isApproved must be true or false",
        },
        { status: 400 },
      );
    }

    restaurant.isApproved = isApproved;

    await restaurant.save();

    return NextResponse.json({
      success: true,
      message: "Restaurant approved successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Approve restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
