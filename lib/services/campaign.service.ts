import { prisma } from "@/lib/prisma";
import { CampaignStatus, Channel } from "@prisma/client";

export interface CreateCampaignInput {
  orgId: string;
  name: string;
  channels: Channel[];
  totalLeadsTargeted?: number;
  startDate?: Date;
  endDate?: Date;
}

export const CampaignService = {
  async create(input: CreateCampaignInput) {
    return prisma.campaign.create({
      data: {
        orgId: input.orgId,
        name: input.name,
        channels: input.channels,
        totalLeadsTargeted: input.totalLeadsTargeted || 0,
        startDate: input.startDate,
        endDate: input.endDate,
        status: CampaignStatus.DRAFT,
      },
      include: {
        sequences: true,
        org: true,
      },
    });
  },

  async findById(id: string) {
    return prisma.campaign.findUnique({
      where: { id },
      include: {
        sequences: { orderBy: { stepNumber: "asc" } },
        leads: true,
        org: { include: { icps: true } },
      },
    });
  },

  async findByOrg(orgId: string) {
    return prisma.campaign.findMany({
      where: { orgId },
      include: {
        sequences: { orderBy: { stepNumber: "asc" } },
        _count: { select: { leads: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getAnalytics(id: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        totalLeadsTargeted: true,
        totalContacted: true,
        totalReplied: true,
        totalBooked: true,
        sequences: { orderBy: { stepNumber: "asc" } },
      },
    });
    if (!campaign) return null;

    // Count leads by status at the database level instead of loading every lead
    // row into Node.js memory and filtering in JavaScript.
    const [leadsByStatusRaw, sequenceStats] = await Promise.all([
      prisma.lead.groupBy({
        by: ["status"],
        where: { campaign: { id } },
        _count: { _all: true },
      }),
      // For each sequence step, count sent/opened/replied touch logs in one query
      prisma.touchLog.groupBy({
        by: ["sequenceStepId"],
        where: { lead: { campaignId: id } },
        _count: { _all: true, sentAt: true, openedAt: true, repliedAt: true },
      }),
    ]);

    // Build a map of stepId → counts for O(1) lookup
    const stepCountMap = new Map(
      sequenceStats.map((s) => [
        s.sequenceStepId,
        {
          sent: s._count.sentAt,
          opened: s._count.openedAt,
          replied: s._count.repliedAt,
        },
      ])
    );

    const defaultCounts = { NEW: 0, CONTACTED: 0, REPLIED: 0, INTERESTED: 0, BOOKED: 0, UNSUBSCRIBED: 0 };
    const leadsByStatus = leadsByStatusRaw.reduce((acc, row) => {
      acc[row.status as keyof typeof acc] = row._count._all;
      return acc;
    }, defaultCounts);

    return {
      totalLeadsTargeted: campaign.totalLeadsTargeted,
      totalContacted: campaign.totalContacted,
      totalReplied: campaign.totalReplied,
      totalBooked: campaign.totalBooked,
      replyRate:
        campaign.totalContacted > 0
          ? Math.round((campaign.totalReplied / campaign.totalContacted) * 100)
          : 0,
      bookingRate:
        campaign.totalReplied > 0
          ? Math.round((campaign.totalBooked / campaign.totalReplied) * 100)
          : 0,
      sequencePerformance: campaign.sequences.map((seq) => {
        const counts = stepCountMap.get(seq.id) ?? { sent: 0, opened: 0, replied: 0 };
        return {
          stepNumber: seq.stepNumber,
          channel: seq.channel,
          sent: counts.sent,
          opened: counts.opened,
          replied: counts.replied,
          openRate: counts.sent > 0 ? Math.round((counts.opened / counts.sent) * 100) : 0,
          replyRate: counts.sent > 0 ? Math.round((counts.replied / counts.sent) * 100) : 0,
        };
      }),
      leadsByStatus,
    };
  },

  async updateStatus(id: string, status: CampaignStatus) {
    return prisma.campaign.update({
      where: { id },
      data: { status },
    });
  },

  async pause(id: string) {
    return prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.PAUSED },
    });
  },

  async resume(id: string) {
    return prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.ACTIVE },
    });
  },
};
