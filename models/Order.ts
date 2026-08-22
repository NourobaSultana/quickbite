import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrderItem {
  foodId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface ILocation {
  lat: number;
  lng: number;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface IOrder extends Document {
  restaurantId: mongoose.Types.ObjectId;
  riderId?: mongoose.Types.ObjectId | null;
  items: IOrderItem[];
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLocation?: ILocation | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    foodId: {
      type: Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    riderId: {
      type: Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },

    deliveryLocation: {
      type: locationSchema,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "picked_up",
        "on_the_way",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;
