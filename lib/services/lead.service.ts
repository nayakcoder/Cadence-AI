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

const SCORE_ADJUSTMENTS: Record<string, number> = {
  POSITIVE: 25,
  NEUTRAL: 5,
  NEGATIVE: -10,
  OOO: 0,
  UNSUBSCRIBE: -50,
};

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
    return prisma.$transaction(
      leads.map((lead) => prisma.lead.create({ data: lead }))
    );
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
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error("Lead not found");

    const newScore = Math.max(0, Math.min(100, lead.leadScore + scoreAdjustment));
    const newStatus = STATUS_TRANSITIONS[classification];

    return prisma.lead.update({
      where: { id: leadId },
      data: {
        status: newStatus,
        leadScore: newScore,
      },
    });
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
