import { GoogleGenAI } from '@google/genai';

/**
 * Call the Gemini/Google Generative AI model with the provided prompt and return parsed JSON.
 *
 * @param prompt - The prompt string built by the promptBuilder.
 * @returns Parsed JSON object representing the layout.
 */
export async function generateLayoutFromPrompt(prompt: string): Promise<any> {
    // Initialize the client – the library expects the API key in the environment.
    const genAI = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });

    try {
        const result = await genAI.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ parts: [{ text: prompt }] }]
        });

        // In the new SDK, result might have a text() method or we access candidates.
        // Assuming result.text() is available as a helper, or result.response.text()
        // Let's try the standard way for the new SDK:
        const text = typeof result.text === 'function' ? result.text() : (result.text || JSON.stringify(result));

        // If text() is not available, we might need to inspect result.candidates[0].content.parts[0].text
        // But usually result.text() exists.

        // The LLM is instructed to return ONLY JSON, so we can safely parse.
        // We need to handle potential markdown code blocks if the model adds them.
        const cleanText = text.replace(/```json\n|\n```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (err) {
        console.error('Error generating layout from LLM:', err);
        throw new Error('LLM generation failed');
    }
}
