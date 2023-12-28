import bcrypt from "bcrypt";
import { db } from "@/libs/prismaDb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;
    if (!email || !name || !password) {
      return new NextResponse("Missing info", { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.log(error, "REGISTRATION_ERROR");
    return new NextResponse("internal error", { status: 500 });
  }
}
