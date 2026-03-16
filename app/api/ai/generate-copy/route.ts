import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AIService } from "@/lib/services/ai.service";
import { z } from "zod";

const generateCopySchema = z.object({
  icpId: z.string().optional(),
  icp: z.object({
    targetTitles: z.array(z.string()),
    targetIndustries: z.array(z.string()),
    painPoints: z.string(),
    valueProps: z.string(),
    tonePreference: z.enum(["PROFESSIONAL", "CASUAL", "AGGRESSIVE"]),
  }),
  lead: z.object({
    firstName: z.string(),
    lastName: z.string(),
    title: z.string().optional(),
    company: z.string().optional(),
    enrichmentData: z.record(z.string(), z.any()).optional(),
  }),
  channel: z.enum(["LINKEDIN", "EMAIL", "REDDIT"]),
  stepNumber: z.number().min(1).max(4),
  priorConversation: z.string().optional(),
  feedbackNote: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const result = generateCopySchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 });

  const copy = await AIService.generateCopy({
    orgId,
    ...result.data,
    channel: result.data.channel as any,
    icp: {
      ...result.data.icp,
      tonePreference: result.data.icp.tonePreference as any,
    },
  });
  return NextResponse.json(copy);
}