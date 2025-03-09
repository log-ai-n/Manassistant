import { createMemory, getMemories } from '../../services/memoryService';
import { extractImportantInformation } from '../deepseek-client';

interface ConversationData {
  restaurantId: string;
  userMessage: string;
  userId?: string;
  context?: string;
}

/**
 * Processes conversation data to extract potential memories using AI
 * @param data The conversation data to process
 * @returns The IDs of any created memories
 */
export async function processConversationForMemories(data: ConversationData): Promise<string[]> {
  const { restaurantId, userMessage, userId, context } = data;
  const createdMemories: string[] = [];

  try {
    // Use DeepSeek AI to extract important information
    const extractedInfo = await extractImportantInformation(userMessage);
    
    // Process each extracted piece of information
    for (const info of extractedInfo) {
      if (info.trim()) {
        // Determine importance based on content (basic heuristic)
        let importance = 2; // Default importance
        
        if (/allerg(y|ic|ies)|intoleran(t|ce)/i.test(info)) {
          importance = 5; // Highest importance for allergies
        } else if (/birthday|anniversary|celebration/i.test(info)) {
          importance = 4; // High importance for special occasions
        } else if (/prefer|like|favorite|enjoy/i.test(info)) {
          importance = 3; // Medium-high for preferences
        }
        
        // Check if a similar memory already exists
        const existingMemories = await getMemories({
          restaurant_id: restaurantId,
          query: info.substring(0, 20) // Search by start of content
        });
        
        // Only create if not too similar to existing memories
        if (!existingMemories.some(m => isSimilarContent(m.memory_content, info))) {
          const memory = await createMemory({
            restaurant_id: restaurantId,
            memory_content: info,
            importance: importance,
            context: context || 'conversation',
            user_id: userId
          });
          
          if (memory) {
            createdMemories.push(memory.id);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing conversation for memories:', error);
  }
  
  return createdMemories;
}

/**
 * Retrieves relevant memories for a conversation context
 * @param restaurantId The restaurant ID
 * @param query The search query or conversation text
 * @param context Optional context to filter memories
 * @returns Array of relevant memories
 */
export async function getRelevantMemories(
  restaurantId: string,
  query: string,
  context?: string
): Promise<string[]> {
  try {
    // Extract keywords for better memory matching
    const keywords = extractKeywords(query);
    
    // First try exact keyword matching
    let memories = await getMemories({
      restaurant_id: restaurantId,
      query: keywords.join(' '),
      context: context,
      limit: 5
    });
    
    // If no results with keywords, try semantic matching with the full query
    if (memories.length === 0) {
      memories = await getMemories({
        restaurant_id: restaurantId,
        query: query.substring(0, 50), // Use first 50 chars for matching
        context: context,
        limit: 5
      });
    }
    
    // Sort memories by importance before returning
    memories.sort((a, b) => b.importance - a.importance);
    
    // Format memories for inclusion in context
    return memories.map(m => m.memory_content);
  } catch (error) {
    console.error('Error getting relevant memories:', error);
    return [];
  }
}

/**
 * Extracts keywords from text for improved memory search
 * @param text The text to extract keywords from
 * @returns Array of keywords
 */
function extractKeywords(text: string): string[] {
  // Simple keyword extraction - remove stopwords and keep unique terms
  const stopwords = ['a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 
    'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'to', 'of', 'in', 'for', 
    'on', 'by', 'at', 'with', 'about', 'against', 'between', 'through', 'during', 'before', 
    'after', 'above', 'below', 'from', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 
    'own', 'same', 'so', 'than', 'too', 'very', 'i', 'me', 'my', 'myself', 'we', 'our', 
    'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 
    'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 
    'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 
    'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => !stopwords.includes(word) && word.length > 2); // Remove stopwords and short words
  
  // Return unique keywords
  return [...new Set(words)];
}

/**
 * Checks if two memory contents are similar enough to be considered duplicates
 * @param content1 First memory content
 * @param content2 Second memory content
 * @returns True if contents are similar
 */
function isSimilarContent(content1: string, content2: string): boolean {
  // Simple similarity check - more advanced systems would use semantics
  const words1 = new Set(extractKeywords(content1));
  const words2 = new Set(extractKeywords(content2));
  
  // Count words in common
  let commonWords = 0;
  words1.forEach(word => {
    if (words2.has(word)) commonWords++;
  });
  
  // Calculate Jaccard similarity
  const similarity = commonWords / (words1.size + words2.size - commonWords);
  
  // Consider similar if more than 60% of words overlap
  return similarity > 0.6;
} 