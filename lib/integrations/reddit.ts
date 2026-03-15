import axios from "axios";

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID || "";
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET || "";
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT || "CadenceAI/1.0";

let redditToken: string | null = null;
let tokenExpiry: Date | null = null;

async function getAccessToken(): Promise<string> {
  if (redditToken && tokenExpiry && new Date() < tokenExpiry) {
    return redditToken;
  }
  const response = await axios.post(
    "https://www.reddit.com/api/v1/access_token",
    "grant_type=client_credentials",
    {
      auth: { username: REDDIT_CLIENT_ID, password: REDDIT_CLIENT_SECRET },
      headers: {
        "User-Agent": REDDIT_USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  redditToken = response.data.access_token;
  tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);
  return redditToken!;
}

export const RedditService = {
  async searchSubreddit(subreddit: string, keywords: string[], limit = 25) {
    const token = await getAccessToken();
    const query = keywords.join(" OR ");
    const response = await axios.get(
      `https://oauth.reddit.com/r/${subreddit}/search`,
      {
        params: { q: query, restrict_sr: true, sort: "new", limit },
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": REDDIT_USER_AGENT,
        },
      }
    );
    return response.data.data.children.map((child: any) => child.data);
  },

  async sendDM(username: string, subject: string, message: string) {
    const token = await getAccessToken();
    const response = await axios.post(
      "https://oauth.reddit.com/api/compose",
      new URLSearchParams({
        to: username,
        subject,
        text: message,
        api_type: "json",
      }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": REDDIT_USER_AGENT,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },
};
