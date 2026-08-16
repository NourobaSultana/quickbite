import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import dbConnect from "@/lib/dbConnect";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";

export async function POST(request: NextRequest) {
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

    // Only restaurant users can create restaurant
    if (user.role !== "restaurant") {
      return NextResponse.json(
        {
          success: false,
          message: "Only restaurant users can create a restaurant",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const { name, description, image, address, phone } = body;

    // Required fields
    if (!name || !description || !address || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be provided",
        },
        { status: 400 },
      );
    }

    // Check if owner already has restaurant
    const existingRestaurant = await Restaurant.findOne({
      ownerId: user._id,
    });

    if (existingRestaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have a restaurant",
        },
        { status: 409 },
      );
    }

    // Create restaurant
    const restaurant = await Restaurant.create({
      name,
      ownerId: user._id,
      description,
      image: image || "",
      address,
      phone,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Restaurant created successfully",
        restaurant,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

// =========================
// GET - Get Restaurants
// =========================
export async function GET() {
  try {
    await dbConnect();

    const restaurants = await Restaurant.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      restaurants,
    });
  } catch (error) {
    console.error("Get restaurants error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get restaurants",
      },
      { status: 500 },
    );
  }
}
