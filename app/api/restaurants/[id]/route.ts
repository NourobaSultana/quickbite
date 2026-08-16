import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";

import dbConnect from "@/lib/dbConnect";
import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const { id } = await params;

    const restaurant = await Restaurant.findOne({
      _id: id,
      isApproved: true,
      isActive: true,
    }).populate("ownerId", "name email phone");

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Get restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get restaurant",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    // 3. Find logged-in user
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

    const { id } = await params;

    // 4. Find restaurant
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

    // 5. Authorization
    const isOwner = restaurant.ownerId.toString() === user._id.toString();

    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to update this restaurant",
        },
        { status: 403 },
      );
    }

    // 6. Get body
    const body = await request.json();

    const { name, description, image, address, phone, isActive } = body;

    // 7. Update only provided fields
    if (name !== undefined) {
      restaurant.name = name;
    }

    if (description !== undefined) {
      restaurant.description = description;
    }

    if (image !== undefined) {
      restaurant.image = image;
    }

    if (address !== undefined) {
      restaurant.address = address;
    }

    if (phone !== undefined) {
      restaurant.phone = phone;
    }

    // Only admin should control active status
    if (isAdmin && isActive !== undefined) {
      restaurant.isActive = isActive;
    }

    await restaurant.save();

    return NextResponse.json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Update restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update restaurant",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    // 4. Find restaurant
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

    // 5. Authorization
    const isOwner = restaurant.ownerId.toString() === user._id.toString();

    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to delete this restaurant",
        },
        { status: 403 },
      );
    }

    // 6. Delete
    await Restaurant.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error("Delete restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete restaurant",
      },
      { status: 500 },
    );
  }
}
