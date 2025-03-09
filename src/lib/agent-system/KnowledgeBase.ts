import { v4 as uuidv4 } from 'uuid';
import { KnowledgeBase, KnowledgeEntry } from './types';

/**
 * In-memory implementation of the knowledge base
 * In a production system, this would be replaced with a persistent database
 */
export class InMemoryKnowledgeBase implements KnowledgeBase {
  private entries: Map<string, KnowledgeEntry> = new Map();

  /**
   * Store a new knowledge entry
   */
  async store(entry: Omit<KnowledgeEntry, 'id' | 'timestamp'>): Promise<KnowledgeEntry> {
    const id = uuidv4();
    const timestamp = new Date();
    
    const newEntry: KnowledgeEntry = {
      ...entry,
      id,
      timestamp
    };
    
    this.entries.set(id, newEntry);
    return newEntry;
  }

  /**
   * Retrieve entries by simple text search in content
   * Note: In production, this would use a proper search index or vector DB
   */
  async retrieve(query: string, limit: number = 10): Promise<KnowledgeEntry[]> {
    const lowerQuery = query.toLowerCase();
    const results: KnowledgeEntry[] = [];
    
    for (const entry of this.entries.values()) {
      // Simple text matching - in production use embeddings/vector search
      if (
        entry.content.toLowerCase().includes(lowerQuery) ||
        entry.topic.toLowerCase().includes(lowerQuery)
      ) {
        results.push(entry);
      }
      
      if (results.length >= limit) {
        break;
      }
    }
    
    return results;
  }

  /**
   * Retrieve entries by tags
   */
  async retrieveByTags(tags: string[], limit: number = 10): Promise<KnowledgeEntry[]> {
    const results: KnowledgeEntry[] = [];
    
    for (const entry of this.entries.values()) {
      // Check if any of the entry's tags match the requested tags
      if (entry.tags.some(tag => tags.includes(tag))) {
        results.push(entry);
      }
      
      if (results.length >= limit) {
        break;
      }
    }
    
    return results;
  }

  /**
   * Update an existing knowledge entry
   */
  async update(id: string, updates: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> {
    const existingEntry = this.entries.get(id);
    
    if (!existingEntry) {
      throw new Error(`Knowledge entry with ID ${id} not found`);
    }
    
    const updatedEntry: KnowledgeEntry = {
      ...existingEntry,
      ...updates,
      id, // Ensure ID doesn't change
      timestamp: updates.timestamp || existingEntry.timestamp // Keep original timestamp unless explicitly updated
    };
    
    this.entries.set(id, updatedEntry);
    return updatedEntry;
  }

  /**
   * Delete a knowledge entry
   */
  async delete(id: string): Promise<boolean> {
    return this.entries.delete(id);
  }

  /**
   * Get all entries (for debugging)
   */
  async getAllEntries(): Promise<KnowledgeEntry[]> {
    return Array.from(this.entries.values());
  }
} 