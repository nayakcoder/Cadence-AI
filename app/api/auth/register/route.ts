import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  orgName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }
  const { name, email, password, orgName } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const org = await prisma.organization.create({
    data: { name: orgName, plan: "STARTER", status: "ACTIVE" },
  });
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "CLIENT",
      orgId: org.id,
    },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
