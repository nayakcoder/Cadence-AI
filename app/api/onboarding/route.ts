import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AIService } from "@/lib/services/ai.service";
import { CampaignService } from "@/lib/services/campaign.service";
import { SendGridService } from "@/lib/integrations/sendgrid";
import { z } from "zod";

const onboardingSchema = z.object({
  companyDescription: z.string().min(10),
  targetTitles: z.array(z.string()).min(1),
  targetIndustries: z.array(z.string()).min(1),
  companySizeMin: z.number().optional(),
  companySizeMax: z.number().optional(),
  painPoints: z.string().min(10),
  valueProps: z.string().min(10),
  tonePreference: z.enum(["PROFESSIONAL", "CASUAL", "AGGRESSIVE"]),
  channels: z.array(z.enum(["LINKEDIN", "EMAIL", "REDDIT"])).min(1),
  monthlyLeadGoal: z.number().min(1),
  calendlyLink: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const result = onboardingSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 });

  const { data } = result;

  // Create ICP
  const icp = await prisma.iCP.create({
    data: {
      orgId,
      targetTitles: data.targetTitles,
      targetIndustries: data.targetIndustries,
      companySizeMin: data.companySizeMin || 1,
      companySizeMax: data.companySizeMax || 10000,
      painPoints: data.painPoints,
      valueProps: data.valueProps,
      tonePreference: data.tonePreference as any,
      blacklistDomains: [],
    },
  });

  // Generate campaign draft with AI
  let campaignName = `${data.targetIndustries[0]} Outreach Campaign`;
  try {
    const draft = await AIService.generateOnboardingCampaignDraft(
      orgId,
      data.companyDescription,
      {
        targetTitles: data.targetTitles,
        targetIndustries: data.targetIndustries,
        painPoints: data.painPoints,
        valueProps: data.valueProps,
      },
      data.channels as any
    );
    campaignName = draft.campaignName;
  } catch (e) {
    // fallback to default name if AI fails
  }

  const campaign = await CampaignService.create({
    orgId,
    name: campaignName,
    channels: data.channels as any,
    totalLeadsTargeted: data.monthlyLeadGoal,
  });

  // Update org with monthly budget
  await prisma.organization.update({
    where: { id: orgId },
    data: { monthlyBudget: data.monthlyLeadGoal },
  });

  // Notify account managers
  try {
    const managers = await prisma.user.findMany({
      where: { role: "ACCOUNT_MANAGER" },
    });
    for (const manager of managers) {
      await SendGridService.sendNotificationEmail(
        manager.email,
        "New Client Onboarding Complete",
        `A new client has completed onboarding. Campaign "${campaignName}" is ready for review. Please review and activate the campaign.`
      );
    }
  } catch (e) {
    // Email notifications are non-critical
  }

  return NextResponse.json({ icp, campaign }, { status: 201 });
}
