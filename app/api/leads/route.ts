import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LeadService } from "@/lib/services/lead.service";
import { z } from "zod";

const createLeadSchema = z.object({
  campaignId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  title: z.string().optional(),
  company: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  redditUsername: z.string().optional(),
  enrichmentData: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = createLeadSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  const lead = await LeadService.create(result.data);
  return NextResponse.json(lead, { status: 201 });
}