import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import dbConnect from "@/lib/dbConnect";
import Food from "@/models/Food";
import Restaurant from "@/models/Restaurant";
// import Category from "@/models/Category";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";
import Category from "@/models/Category";

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

    // 4. Only restaurant owner
    if (user.role !== "restaurant") {
      return NextResponse.json(
        {
          success: false,
          message: "Only restaurant owners can create food",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const { name, description, price, image, restaurantId, categoryId } = body;

    // 5. Required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      !restaurantId ||
      !categoryId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be provided",
        },
        { status: 400 },
      );
    }

    // 6. Validate price
    if (Number(price) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price cannot be negative",
        },
        { status: 400 },
      );
    }

    // 7. Find restaurant
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

    // 8. Check restaurant ownership
    if (restaurant.ownerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to add food to this restaurant",
        },
        { status: 403 },
      );
    }

    // 9. Find category
    const category = await Category.findById(categoryId);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    // 10. Important:
    // Category must belong to the same restaurant
    if (category.restaurantId.toString() !== restaurantId) {
      return NextResponse.json(
        {
          success: false,
          message: "This category does not belong to this restaurant",
        },
        { status: 400 },
      );
    }

    // 11. Check duplicate food
    const existingFood = await Food.findOne({
      restaurantId,
      categoryId,
      name: name.trim(),
    });

    if (existingFood) {
      return NextResponse.json(
        {
          success: false,
          message: "This food already exists",
        },
        { status: 409 },
      );
    }

    // 12. Create food
    const food = await Food.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image || "",
      restaurantId,
      categoryId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Food created successfully",
        food,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create food error:", error);

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
    const categoryId = searchParams.get("categoryId");

    if (!restaurantId || !categoryId) {
      return NextResponse.json(
        { success: false, message: "restaurantId and categoryId are required" },
        { status: 400 },
      );
    }

    const foods = await Food.find({ restaurantId, categoryId }).sort({
      createdAt: 1,
    });

    return NextResponse.json({ success: true, foods });
  } catch (error) {
    console.error("Get foods error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get foods" },
      { status: 500 },
    );
  }
}
