import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";
import Category from "@/models/Category";
import dbConnect from "@/lib/dbConnect";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // 1. Get token
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

    // 2. Verify token
    const decoded = verifyToken(token);

    // 3. Find user
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

    // 4. Only restaurant user can create category
    if (user.role !== "restaurant") {
      return NextResponse.json(
        {
          success: false,
          message: "Only restaurant owners can create categories",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const { name, restaurantId } = body;

    // 5. Validate
    if (!name || !restaurantId) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name and restaurantId are required",
        },
        { status: 400 },
      );
    }

    // 6. Find restaurant
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    // 7. Check ownership
    if (restaurant.ownerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to create category for this restaurant",
        },
        { status: 403 },
      );
    }

    // 8. Check duplicate category
    const existingCategory = await Category.findOne({
      restaurantId,
      name: name.trim(),
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "This category already exists",
        },
        { status: 409 },
      );
    }

    // 9. Create category
    const category = await Category.create({
      name: name.trim(),
      restaurantId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        {
          success: false,
          message: "restaurantId is required",
        },
        { status: 400 },
      );
    }

    const categories = await Category.find({
      restaurantId,
      isActive: true,
    }).sort({
      createdAt: 1,
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get categories",
      },
      { status: 500 },
    );
  }
}
