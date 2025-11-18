
/**
 * Token Budget Manager for Gemini API
 * Prevents context window overflow and manages conversation history
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class TokenManager {
  private readonly MAX_TOKENS = 200000; // Gemini 2.0 limit
  private readonly RESERVED_FOR_RESPONSE = 50000;
  private readonly MAX_HISTORY_TOKENS = 150000;
  
  /**
   * Estimate token count (rough heuristic: 1 token ≈ 4 chars)
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Summarize old messages when approaching limit
   */
  async summarizeHistory(messages: Message[], ai: any): Promise<Message[]> {
    const totalTokens = messages.reduce((sum, msg) => 
      sum + this.estimateTokens(msg.content), 0
    );

    if (totalTokens < this.MAX_HISTORY_TOKENS * 0.8) {
      return messages; // No summarization needed
    }

    console.log(`⚠️ Token budget at ${totalTokens}/${this.MAX_HISTORY_TOKENS}. Summarizing...`);

    // Keep last 3 messages verbatim
    const recentMessages = messages.slice(-3);
    const oldMessages = messages.slice(0, -3);

    // Summarize old messages
    const summaryPrompt = `Summarize this conversation history, preserving key user requirements:

${oldMessages.map(m => `${m.role}: ${m.content}`).join('\n\n')}

Return a concise summary (max 500 words).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: summaryPrompt }] }],
    });

    const summary: Message = {
      role: 'assistant',
      content: `[CONVERSATION SUMMARY]\n${response.text}`,
      timestamp: Date.now(),
    };

    return [summary, ...recentMessages];
  }

  /**
   * Check if message fits within budget
   */
  validateMessageFits(currentHistory: Message[], newMessage: string): {
    fits: boolean;
    currentTokens: number;
    newTokens: number;
    available: number;
  } {
    const currentTokens = currentHistory.reduce((sum, msg) => 
      sum + this.estimateTokens(msg.content), 0
    );
    const newTokens = this.estimateTokens(newMessage);
    const available = this.MAX_HISTORY_TOKENS - currentTokens;

    return {
      fits: newTokens <= available,
      currentTokens,
      newTokens,
      available,
    };
  }
}
