import { createMemory, getMemories } from '../../services/memoryService';

interface ConversationData {
  restaurantId: string;
  userMessage: string;
  userId?: string;
  context?: string;
}

/**
 * Processes conversation data to extract potential memories
 * @param data The conversation data to process
 * @returns The IDs of any created memories
 */
export async function processConversationForMemories(data: ConversationData): Promise<string[]> {
  const { restaurantId, userMessage, userId, context } = data;
  const createdMemories: string[] = [];

  try {
    // Simple heuristic - looking for key phrases that might indicate useful information
    // In a production system, this would use a more sophisticated NLP approach
    const memoryIndicators = [
      { pattern: /prefer|like|favorite|enjoy/i, importance: 3 },
      { pattern: /allerg(y|ic|ies)|intoleran(t|ce)/i, importance: 5 },
      { pattern: /birthday|anniversary|celebration/i, importance: 4 },
      { pattern: /dislike|hate|don't like/i, importance: 3 },
      { pattern: /special|request|specific/i, importance: 3 }
    ];

    for (const indicator of memoryIndicators) {
      if (indicator.pattern.test(userMessage)) {
        // Extract the relevant sentence containing the indicator
        const sentences = userMessage.split(/[.!?]+/);
        const relevantSentences = sentences.filter(s => indicator.pattern.test(s));
        
        if (relevantSentences.length > 0) {
          const memoryContent = relevantSentences.join('. ').trim() + '.';
          
          // Check if a similar memory already exists
          const existingMemories = await getMemories({
            restaurant_id: restaurantId,
            query: memoryContent.substring(0, 20) // Search by start of content
          });
          
          // Only create if not too similar to existing memories
          if (!existingMemories.some(m => isSimilarContent(m.memory_content, memoryContent))) {
            const memory = await createMemory({
              restaurant_id: restaurantId,
              memory_content: memoryContent,
              importance: indicator.importance,
              context: context || 'conversation',
              user_id: userId
            });
            
            if (memory) {
              createdMemories.push(memory.id);
            }
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
    // Get memories relevant to the current conversation
    const memories = await getMemories({
      restaurant_id: restaurantId,
      query: extractKeywords(query).join(' '),
      context: context,
      limit: 5
    });
    
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