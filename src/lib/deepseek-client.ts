/**
 * DeepSeek API client for handling AI interactions
 */

import { DEEPSEEK_API_KEY, DEEPSEEK_MODEL } from './environment';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * The structure of a message to be sent to the DeepSeek API
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Options for the DeepSeek API request
 */
export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  messages: ChatMessage[];
}

/**
 * Response structure from the DeepSeek API
 */
export interface ChatCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generates a chat completion using the DeepSeek API
 * @param options The options for the chat completion
 * @returns The generated response
 * @throws Error if the API request fails
 */
export async function generateChatCompletion(
  options: ChatCompletionOptions
): Promise<string> {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key is not configured');
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: options.model || DEEPSEEK_MODEL,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1000,
        messages: options.messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: ChatCompletionResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw error;
  }
}

/**
 * Extracts important information from text using DeepSeek AI
 * @param text The text to analyze for important information
 * @returns Array of extracted pieces of information
 */
export async function extractImportantInformation(text: string): Promise<string[]> {
  try {
    const systemPrompt = `You are an AI assistant for a restaurant. Extract any important information from the customer's message that would be useful to remember for future interactions. Focus on:
1. Food preferences and dietary restrictions
2. Allergies or intolerances
3. Special occasions (birthdays, anniversaries)
4. Service preferences
5. Past experiences
Return ONLY the extracted information as a bulleted list with no additional text. If there's nothing important to extract, return an empty list.`;

    const response = await generateChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ]
    });

    // Parse the bulleted list response into an array of strings
    return response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('- ') || line.startsWith('* '))
      .map(line => line.substring(2).trim())
      .filter(item => item.length > 0);
  } catch (error) {
    console.error('Error extracting important information:', error);
    return [];
  }
}

/**
 * Enhances a response with relevant memories
 * @param baseResponse The initial response to enhance
 * @param memories Array of relevant memories to incorporate
 * @returns Enhanced response that naturally includes memory context
 */
export async function enhanceResponseWithMemories(
  baseResponse: string,
  memories: string[]
): Promise<string> {
  if (!memories.length) return baseResponse;

  try {
    const systemPrompt = `You are an AI assistant for a restaurant. You need to enhance your response to a customer by naturally incorporating the provided memories about the customer. Don't explicitly mention that you're using stored memories - just make your response more personalized based on what you know about them. The response should flow naturally and sound conversational.`;

    const memoryContext = `MEMORIES ABOUT THE CUSTOMER:\n${memories.map(m => `- ${m}`).join('\n')}`;
    const userPrompt = `BASE RESPONSE: ${baseResponse}\n\n${memoryContext}\n\nPlease enhance the base response by naturally incorporating the memories. Make it sound conversational and personalized without explicitly mentioning "stored memories" or "according to our records".`;

    return await generateChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });
  } catch (error) {
    console.error('Error enhancing response with memories:', error);
    return baseResponse; // Fallback to original response if enhancement fails
  }
} 