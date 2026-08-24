import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "customer" | "restaurant" | "admin" | "rider";
  status: "active" | "blocked";
  riderId?: Types.ObjectId | null; // links to Rider doc, only set when role === "rider"
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["customer", "restaurant", "admin", "rider"],
      default: "customer",
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    riderId: {
      type: Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
