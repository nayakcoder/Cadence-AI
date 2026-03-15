import { prisma } from "@/lib/prisma";
import { CampaignStatus, Channel, Prisma } from "@prisma/client";

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
      include: {
        leads: {
          include: {
            touchLogs: {
              include: { sequenceStep: true },
            },
          },
        },
        sequences: { orderBy: { stepNumber: "asc" } },
      },
    });
    if (!campaign) return null;

    const analytics = {
      totalLeadsTargeted: campaign.totalLeadsTargeted,
      totalContacted: campaign.totalContacted,
      totalReplied: campaign.totalReplied,
      totalBooked: campaign.totalBooked,
      replyRate: campaign.totalContacted > 0
        ? Math.round((campaign.totalReplied / campaign.totalContacted) * 100)
        : 0,
      bookingRate: campaign.totalReplied > 0
        ? Math.round((campaign.totalBooked / campaign.totalReplied) * 100)
        : 0,
      sequencePerformance: campaign.sequences.map((seq) => {
        const logsForStep = campaign.leads.flatMap((l) =>
          l.touchLogs.filter((tl) => tl.sequenceStepId === seq.id)
        );
        const sent = logsForStep.filter((l) => l.sentAt).length;
        const opened = logsForStep.filter((l) => l.openedAt).length;
        const replied = logsForStep.filter((l) => l.repliedAt).length;
        return {
          stepNumber: seq.stepNumber,
          channel: seq.channel,
          sent,
          opened,
          replied,
          openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
          replyRate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
        };
      }),
      leadsByStatus: {
        NEW: campaign.leads.filter((l) => l.status === "NEW").length,
        CONTACTED: campaign.leads.filter((l) => l.status === "CONTACTED").length,
        REPLIED: campaign.leads.filter((l) => l.status === "REPLIED").length,
        INTERESTED: campaign.leads.filter((l) => l.status === "INTERESTED").length,
        BOOKED: campaign.leads.filter((l) => l.status === "BOOKED").length,
        UNSUBSCRIBED: campaign.leads.filter((l) => l.status === "UNSUBSCRIBED").length,
      },
    };
    return analytics;
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
