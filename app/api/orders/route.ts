import { NextRequest, NextResponse } from "next/server";

import Order from "@/models/Order";
import Rider from "@/models/Rider";
import dbConnect from "@/lib/dbConnect";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const {
      restaurantId,
      items,
      totalAmount,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLocation,
    } = body;

    if (
      !restaurantId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !totalAmount ||
      !customerName ||
      !customerPhone ||
      !deliveryAddress
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required order fields" },
        { status: 400 },
      );
    }

    // Auto-assign the first free rider, if one exists.
    const availableRider = await Rider.findOne({ isAvailable: true });

    const order = await Order.create({
      restaurantId,
      riderId: availableRider ? availableRider._id : null,
      items,
      totalAmount,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLocation: deliveryLocation || null,
      status: availableRider ? "accepted" : "pending",
    });

    if (availableRider) {
      availableRider.isAvailable = false;
      await availableRider.save();
    }

    const populatedOrder = await order.populate("riderId");

    return NextResponse.json(
      { success: true, order: populatedOrder },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    const restaurantId = searchParams.get("restaurantId");
    const riderId = searchParams.get("riderId");

    const filter: Record<string, unknown> = {};

    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }

    if (riderId) {
      filter.riderId = riderId;
    }

    const orders = await Order.find(filter)
      .populate("riderId")
      .populate("restaurantId", "name address phone image")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 },
    );
  }
}
