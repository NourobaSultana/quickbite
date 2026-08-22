import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Rider from "@/models/Rider";
// Importing Restaurant here ensures its schema is registered with
// Mongoose before we call .populate("restaurantId", ...) below —
// otherwise populate throws "Schema hasn't been registered for model".
import "@/models/Restaurant";
import dbConnect from "@/lib/dbConnect";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const { id } = await params;

    const order = await Order.findById(id)
      .populate("riderId")
      .populate("restaurantId", "name address phone image");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

const VALID_STATUSES = [
  "pending",
  "accepted",
  "picked_up",
  "on_the_way",
  "delivered",
  "cancelled",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const { id } = await params;
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 },
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).populate("riderId");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Free the rider back up once the order is delivered or cancelled.
    if ((status === "delivered" || status === "cancelled") && order.riderId) {
      await Rider.findByIdAndUpdate(order.riderId, { isAvailable: true });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 },
    );
  }
}
