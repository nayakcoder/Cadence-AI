import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-02-25.clover",
  });
}

const PLAN_LIMITS: Record<Plan, { leads: number; channels: number; price: number }> = {
  STARTER: { leads: 500, channels: 1, price: 1497 },
  GROWTH: { leads: 2000, channels: 3, price: 2997 },
  ENTERPRISE: { leads: Infinity, channels: 3, price: 0 },
};

export const BillingService = {
  async createCheckoutSession(orgId: string, plan: Plan, email: string) {
    const priceId =
      plan === "STARTER"
        ? process.env.STRIPE_STARTER_PRICE_ID
        : plan === "GROWTH"
        ? process.env.STRIPE_GROWTH_PRICE_ID
        : null;
    if (!priceId) throw new Error("Invalid plan or missing price ID");

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      metadata: { orgId, plan },
    });
    return session;
  },

  async createPortalSession(stripeCustomerId: string) {
    const session = await getStripe().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });
    return session;
  },

  async handleWebhook(payload: string, signature: string) {
    const event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { orgId, plan } = session.metadata || {};
        if (orgId && plan) {
          await prisma.organization.update({
            where: { id: orgId },
            data: {
              plan: plan as Plan,
              stripeCustomerId: session.customer as string,
              status: "ACTIVE",
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.organization.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: { status: "CHURNED" },
        });
        break;
      }
    }
    return event;
  },

  async getMRR(): Promise<number> {
    const subscriptions = await getStripe().subscriptions.list({
      status: "active",
      limit: 100,
    });
    return subscriptions.data.reduce((total, sub) => {
      const amount = sub.items.data.reduce(
        (sum, item) => sum + (item.price.unit_amount || 0) * (item.quantity ?? 1),
        0
      );
      return total + amount / 100;
    }, 0);
  },

  async checkLeadLimitExceeded(orgId: string): Promise<boolean> {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) return false;
    const limit = PLAN_LIMITS[org.plan].leads;
    if (limit === Infinity) return false;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await prisma.touchLog.count({
      where: {
        lead: { campaign: { orgId } },
        sentAt: { gte: startOfMonth },
      },
    });
    return count >= limit;
  },

  getPlanLimits(plan: Plan) {
    return PLAN_LIMITS[plan];
  },
};