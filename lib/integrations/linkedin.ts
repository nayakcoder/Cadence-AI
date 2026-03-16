import axios from "axios";

const UNIPILE_BASE_URL = process.env.UNIPILE_BASE_URL || "https://api.unipile.com";
const UNIPILE_API_KEY = process.env.UNIPILE_API_KEY || "";

const MAX_DAILY_CONNECTION_REQUESTS = 20;
const MAX_DAILY_DMS = 30;

const unipileClient = axios.create({
  baseURL: UNIPILE_BASE_URL,
  headers: {
    "X-API-KEY": UNIPILE_API_KEY,
    "Content-Type": "application/json",
  },
});

export const LinkedInService = {
  async sendConnectionRequest(linkedinProfileUrl: string, note: string) {
    if (note.length > 300) {
      throw new Error("LinkedIn connection note must be under 300 characters");
    }
    const response = await unipileClient.post("/linkedin/connection-requests", {
      profile_url: linkedinProfileUrl,
      message: note,
    });
    return response.data;
  },

  async sendDM(linkedinProfileUrl: string, message: string) {
    if (message.length > 500) {
      message = message.slice(0, 497) + "...";
    }
    const response = await unipileClient.post("/linkedin/messages", {
      profile_url: linkedinProfileUrl,
      message,
    });
    return response.data;
  },

  async getReplies(accountId: string, since?: Date) {
    const params: Record<string, any> = { account_id: accountId };
    if (since) params.since = since.toISOString();
    const response = await unipileClient.get("/linkedin/messages", { params });
    return response.data;
  },
};