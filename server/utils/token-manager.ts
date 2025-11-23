/**
 * Token Manager - Track and manage Gemini API token usage
 * Handles context window management and conversation summarization
 */

export class TokenManager {
  private readonly MAX_TOKENS = 200000; // Gemini 2.0 limit
  private readonly RESERVED_FOR_RESPONSE = 50000;
  private readonly SUMMARIZATION_THRESHOLD = 100000;

  /**
   * Estimate token count for a message
   * Uses rough heuristic: 1 token ≈ 4 characters
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if conversation history needs summarization
   */
  needsSummarization(conversationHistory: string[]): boolean {
    const totalTokens = conversationHistory.reduce(
      (sum, msg) => sum + this.estimateTokens(msg),
      0
    );
    return totalTokens > this.SUMMARIZATION_THRESHOLD;
  }

  /**
   * Summarize conversation history to reduce token count
   * Preserves last 3 messages and user requirements from first message
   */
  private readonly SUMMARIZATION_MODEL_ID = "gemini-2.0-thinking-exp";

  async summarizeHistory(
    conversationHistory: string[],
    aiClient: any
  ): Promise<string[]> {
    if (conversationHistory.length <= 3) {
      return conversationHistory; // Too short to summarize
    }

    // Preserve last 3 messages verbatim
    const recentMessages = conversationHistory.slice(-3);
    const oldMessages = conversationHistory.slice(0, -3);

    // Summarize old messages
    const summaryPrompt = `Summarize this conversation history into a concise 200-word summary.
Preserve all critical user requirements, asset counts, and director notes.

CONVERSATION HISTORY:
${oldMessages.join('\n\n---\n\n')}

Return a plain text summary (no JSON).`;

    const summaryResponse = await aiClient.models.generateContent({
      model: this.SUMMARIZATION_MODEL_ID,
      contents: [{ role: "user", parts: [{ text: summaryPrompt }] }],
    });

    const summary = `[SUMMARIZED HISTORY]\n${summaryResponse.text}`;

    return [summary, ...recentMessages];
  }

  /**
   * Calculate remaining tokens available for current request
   */
  getRemainingTokens(conversationHistory: string[]): number {
    const usedTokens = conversationHistory.reduce(
      (sum, msg) => sum + this.estimateTokens(msg),
      0
    );
    return this.MAX_TOKENS - this.RESERVED_FOR_RESPONSE - usedTokens;
  }
}