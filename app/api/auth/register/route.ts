import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// Only these roles can be self-selected during public registration.
// "admin" is intentionally excluded — admin accounts should be created
// separately (e.g. by an existing admin, or seeded directly in the DB),
// never through a public sign-up form.
const ALLOWED_SELF_REGISTER_ROLES = ["customer", "restaurant"];

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const { name, email, phone, password, role } = body;

    // 1. Check required fields
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      );
    }

    // 2. Check password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 },
      );
    }

    // 3. Validate role (defaults to "customer" if not provided)
    const requestedRole = role || "customer";

    if (!ALLOWED_SELF_REGISTER_ROLES.includes(requestedRole)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role selected",
        },
        { status: 400 },
      );
    }

    // 4. Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 409 },
      );
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: requestedRole,
    });

    // 7. Return response
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
