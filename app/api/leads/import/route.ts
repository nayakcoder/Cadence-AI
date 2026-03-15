import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LeadService } from "@/lib/services/lead.service";
import { BillingService } from "@/lib/services/billing.service";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const exceeded = await BillingService.checkLeadLimitExceeded(orgId);
  if (exceeded) {
    return NextResponse.json(
      { error: "Monthly lead limit exceeded. Please upgrade your plan." },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const campaignId = formData.get("campaignId") as string;
  const csvFile = formData.get("csv") as File;

  if (!campaignId || !csvFile) {
    return NextResponse.json({ error: "campaignId and csv file required" }, { status: 400 });
  }

  const csvText = await csvFile.text();
  const lines = csvText.split("\n").filter(Boolean);
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  const leads = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] || ""));
    return {
      campaignId,
      firstName: row["firstname"] || row["first_name"] || row["first"] || "",
      lastName: row["lastname"] || row["last_name"] || row["last"] || "",
      title: row["title"] || row["jobtitle"] || row["job_title"] || undefined,
      company: row["company"] || row["companyname"] || undefined,
      email: row["email"] || undefined,
      linkedinUrl: row["linkedin"] || row["linkedinurl"] || row["linkedin_url"] || undefined,
      redditUsername: row["reddit"] || row["redditusername"] || undefined,
    };
  }).filter((l) => l.firstName && l.lastName);

  const created = await LeadService.bulkCreate(leads);
  return NextResponse.json({ imported: created.length }, { status: 201 });
}
