import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

export type Memory = {
  id: string;
  restaurant_id: string;
  memory_content: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  context?: string;
  importance: number;
  last_accessed?: string;
};

export type CreateMemoryParams = {
  restaurant_id: string;
  memory_content: string;
  context?: string;
  importance?: number;
  user_id?: string;
};

export type UpdateMemoryParams = {
  id: string;
  memory_content?: string;
  context?: string;
  importance?: number;
};

export type SearchMemoryParams = {
  restaurant_id: string;
  query?: string;
  context?: string;
  limit?: number;
  offset?: number;
};

/**
 * Creates a new memory for a restaurant
 * @param params Parameters for creating a memory
 * @returns The created memory or null if operation failed
 */
export const createMemory = async (params: CreateMemoryParams): Promise<Memory | null> => {
  const { data, error } = await supabase
    .from('memories')
    .insert({
      restaurant_id: params.restaurant_id,
      memory_content: params.memory_content,
      context: params.context,
      importance: params.importance || 1,
      user_id: params.user_id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating memory:', error);
    return null;
  }

  return data as Memory;
};

/**
 * Retrieves memories for a restaurant with optional filtering
 * @param params Parameters for retrieving memories
 * @returns Array of memories or empty array if none found/error
 */
export const getMemories = async (params: SearchMemoryParams): Promise<Memory[]> => {
  let query = supabase
    .from('memories')
    .select('*')
    .eq('restaurant_id', params.restaurant_id)
    .order('importance', { ascending: false })
    .order('last_accessed', { ascending: false, nullsFirst: false });

  if (params.query) {
    // If the query parameter is provided, search for it in memory_content
    query = query.ilike('memory_content', `%${params.query}%`);
  }

  if (params.context) {
    // If context is provided, filter by that context
    query = query.eq('context', params.context);
  }

  // Apply pagination if provided
  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching memories:', error);
    return [];
  }

  return data as Memory[];
};

/**
 * Updates an existing memory
 * @param params Parameters for updating a memory
 * @returns The updated memory or null if operation failed
 */
export const updateMemory = async (params: UpdateMemoryParams): Promise<Memory | null> => {
  const updates: Partial<Memory> = {};
  
  if (params.memory_content !== undefined) {
    updates.memory_content = params.memory_content;
  }
  
  if (params.context !== undefined) {
    updates.context = params.context;
  }
  
  if (params.importance !== undefined) {
    updates.importance = params.importance;
  }

  const { data, error } = await supabase
    .from('memories')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating memory:', error);
    return null;
  }

  return data as Memory;
};

/**
 * Deletes a memory by ID
 * @param id The ID of the memory to delete
 * @returns True if deletion was successful, false otherwise
 */
export const deleteMemory = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting memory:', error);
    return false;
  }

  return true;
};

/**
 * Batches multiple memories to be created at once
 * @param memories Array of memories to create
 * @returns Array of created memories or empty array if operation failed
 */
export const batchCreateMemories = async (memories: CreateMemoryParams[]): Promise<Memory[]> => {
  const { data, error } = await supabase
    .from('memories')
    .insert(memories)
    .select();

  if (error) {
    console.error('Error batch creating memories:', error);
    return [];
  }

  return data as Memory[];
};

/**
 * Gets the most recent memories for a restaurant
 * @param restaurantId The restaurant ID
 * @param limit Number of memories to fetch (default: 10)
 * @returns Array of recent memories
 */
export const getRecentMemories = async (restaurantId: string, limit = 10): Promise<Memory[]> => {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent memories:', error);
    return [];
  }

  return data as Memory[];
};

/**
 * Gets the most important memories for a restaurant
 * @param restaurantId The restaurant ID
 * @param limit Number of memories to fetch (default: 10)
 * @returns Array of important memories
 */
export const getImportantMemories = async (restaurantId: string, limit = 10): Promise<Memory[]> => {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('importance', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching important memories:', error);
    return [];
  }

  return data as Memory[];
}; 