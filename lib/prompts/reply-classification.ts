export interface ReplyClassificationInput {
  replyContent: string;
  leadName: string;
  leadTitle?: string;
  leadCompany?: string;
  lastMessageSent?: string;
}

export function buildReplyClassificationPrompt(input: ReplyClassificationInput): string {
  const { replyContent, leadName, leadTitle, leadCompany, lastMessageSent } = input;

  return `You are an expert B2B sales reply analyst. Classify this reply and draft a suggested response if needed.

## LEAD INFORMATION
- Name: ${leadName}
- Title: ${leadTitle || "Unknown"}
- Company: ${leadCompany || "Unknown"}

${lastMessageSent ? `## LAST MESSAGE WE SENT\n${lastMessageSent}\n` : ""}

## REPLY TO CLASSIFY
${replyContent}

## CLASSIFICATION RULES
- **POSITIVE**: Interested, wants to meet, asking for more info, positive engagement
- **NEUTRAL**: General response, not clearly interested or uninterested, generic reply
- **NEGATIVE**: Not interested, wrong person, bad timing, explicit rejection
- **OOO**: Out of office auto-reply or vacation message
- **UNSUBSCRIBE**: Asks to stop contact, remove from list, or opt out in any way

## OUTPUT FORMAT
Return a JSON object with EXACTLY these keys:
{
  "classification": "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "OOO" | "UNSUBSCRIBE",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of classification",
  "suggestedResponse": "Draft reply for account manager to review (only if classification is POSITIVE or NEUTRAL, otherwise null)",
  "leadScoreAdjustment": number // -30 to +30 adjustment to lead score based on reply sentiment
}

Return ONLY valid JSON. No markdown. No explanation outside the JSON.`;
}
