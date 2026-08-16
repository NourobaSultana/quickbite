import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/categories/[id]
// Public — get a single category by its ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = await params;

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

// PATCH /api/categories/[id]
// Restaurant owner only — update a category's name
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = await params;

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
          message: "Only restaurant owners can update categories",
        },
        { status: 403 },
      );
    }

    // 5. Find category
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    // 6. Find restaurant and check ownership
    const restaurant = await Restaurant.findById(category.restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    if (restaurant.ownerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to update this category",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required",
        },
        { status: 400 },
      );
    }

    // 7. Check duplicate name within the same restaurant
    const existingCategory = await Category.findOne({
      _id: { $ne: id },
      restaurantId: category.restaurantId,
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

    // 8. Update
    category.name = name.trim();
    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/categories/[id]
// Restaurant owner only — soft delete (sets isActive to false)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = await params;

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
          message: "Only restaurant owners can delete categories",
        },
        { status: 403 },
      );
    }

    // 5. Find category
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 },
      );
    }

    // 6. Find restaurant and check ownership
    const restaurant = await Restaurant.findById(category.restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    if (restaurant.ownerId.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to delete this category",
        },
        { status: 403 },
      );
    }

    // 7. Soft delete
    category.isActive = false;
    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
