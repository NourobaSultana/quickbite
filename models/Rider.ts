import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IRiderLocation {
  lat: number;
  lng: number;
  updatedAt: Date;
}

export interface IRider extends Document {
  userId: Types.ObjectId; // links back to the User account (role: "rider")
  name: string;
  phone: string;
  vehicle?: string;
  isAvailable: boolean;
  currentLocation?: IRiderLocation | null;
  createdAt: Date;
  updatedAt: Date;
}

const riderLocationSchema = new Schema<IRiderLocation>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const riderSchema = new Schema<IRider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    vehicle: {
      type: String,
      trim: true,
      default: "Motorcycle",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    currentLocation: {
      type: riderLocationSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Rider: Model<IRider> =
  mongoose.models.Rider || mongoose.model<IRider>("Rider", riderSchema);

export default Rider;
