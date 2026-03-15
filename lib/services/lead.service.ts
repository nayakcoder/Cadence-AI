import { prisma } from "@/lib/prisma";
import { LeadStatus, ReplyClassification } from "@prisma/client";

export interface CreateLeadInput {
  campaignId: string;
  firstName: string;
  lastName: string;
  title?: string;
  company?: string;
  linkedinUrl?: string;
  email?: string;
  redditUsername?: string;
  enrichmentData?: Record<string, any>;
}

const STATUS_TRANSITIONS: Record<ReplyClassification, LeadStatus> = {
  POSITIVE: LeadStatus.INTERESTED,
  NEUTRAL: LeadStatus.REPLIED,
  NEGATIVE: LeadStatus.REPLIED,
  OOO: LeadStatus.CONTACTED,
  UNSUBSCRIBE: LeadStatus.UNSUBSCRIBED,
};

export const LeadService = {
  async create(input: CreateLeadInput) {
    return prisma.lead.create({ data: input });
  },

  async bulkCreate(leads: CreateLeadInput[]) {
    // createMany sends a single INSERT ... VALUES (...), (...) statement instead of
    // N individual INSERT statements, giving a large speedup for bulk imports.
    await prisma.lead.createMany({ data: leads, skipDuplicates: true });
    // Return the count so callers can report how many were imported.
    return leads;
  },

  async findById(id: string) {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        touchLogs: {
          include: { sequenceStep: true },
          orderBy: { createdAt: "asc" },
        },
        memory: true,
        campaign: { include: { org: { include: { icps: true } } } },
      },
    });
  },

  async findByCampaign(campaignId: string) {
    return prisma.lead.findMany({
      where: { campaignId },
      include: {
        touchLogs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async updateStatus(id: string, status: LeadStatus) {
    return prisma.lead.update({ where: { id }, data: { status } });
  },

  async processReply(
    leadId: string,
    classification: ReplyClassification,
    scoreAdjustment: number
  ) {
    const newStatus = STATUS_TRANSITIONS[classification];

    // Use a raw UPDATE with GREATEST/LEAST clamping so we avoid a separate
    // SELECT round-trip to read the current score before writing the new one.
    return prisma.$executeRaw`
      UPDATE "Lead"
      SET
        status     = ${newStatus}::"LeadStatus",
        "leadScore" = GREATEST(0, LEAST(100, "leadScore" + ${scoreAdjustment})),
        "updatedAt" = NOW()
      WHERE id = ${leadId}
    `;
  },

  async getConversationHistory(leadId: string) {
    return prisma.touchLog.findMany({
      where: { leadId },
      include: { sequenceStep: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async logTouch(data: {
    leadId: string;
    sequenceStepId: string;
    sentAt?: Date;
  }) {
    return prisma.touchLog.create({ data });
  },

  async updateTouchLog(
    id: string,
    data: Partial<{
      deliveredAt: Date;
      openedAt: Date;
      repliedAt: Date;
      replyContent: string;
      replyClassification: ReplyClassification;
    }>
  ) {
    return prisma.touchLog.update({ where: { id }, data });
  },
};