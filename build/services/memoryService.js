"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportantMemories = exports.getRecentMemories = exports.batchCreateMemories = exports.deleteMemory = exports.updateMemory = exports.getMemories = exports.createMemory = void 0;
const supabase_1 = require("../lib/supabase");
/**
 * Creates a new memory for a restaurant
 * @param params Parameters for creating a memory
 * @returns The created memory or null if operation failed
 */
const createMemory = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
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
    return data;
});
exports.createMemory = createMemory;
/**
 * Retrieves memories for a restaurant with optional filtering
 * @param params Parameters for retrieving memories
 * @returns Array of memories or empty array if none found/error
 */
const getMemories = (params) => __awaiter(void 0, void 0, void 0, function* () {
    let query = supabase_1.supabase
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
    const { data, error } = yield query;
    if (error) {
        console.error('Error fetching memories:', error);
        return [];
    }
    return data;
});
exports.getMemories = getMemories;
/**
 * Updates an existing memory
 * @param params Parameters for updating a memory
 * @returns The updated memory or null if operation failed
 */
const updateMemory = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = {};
    if (params.memory_content !== undefined) {
        updates.memory_content = params.memory_content;
    }
    if (params.context !== undefined) {
        updates.context = params.context;
    }
    if (params.importance !== undefined) {
        updates.importance = params.importance;
    }
    const { data, error } = yield supabase_1.supabase
        .from('memories')
        .update(updates)
        .eq('id', params.id)
        .select()
        .single();
    if (error) {
        console.error('Error updating memory:', error);
        return null;
    }
    return data;
});
exports.updateMemory = updateMemory;
/**
 * Deletes a memory by ID
 * @param id The ID of the memory to delete
 * @returns True if deletion was successful, false otherwise
 */
const deleteMemory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = yield supabase_1.supabase
        .from('memories')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting memory:', error);
        return false;
    }
    return true;
});
exports.deleteMemory = deleteMemory;
/**
 * Batches multiple memories to be created at once
 * @param memories Array of memories to create
 * @returns Array of created memories or empty array if operation failed
 */
const batchCreateMemories = (memories) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('memories')
        .insert(memories)
        .select();
    if (error) {
        console.error('Error batch creating memories:', error);
        return [];
    }
    return data;
});
exports.batchCreateMemories = batchCreateMemories;
/**
 * Gets the most recent memories for a restaurant
 * @param restaurantId The restaurant ID
 * @param limit Number of memories to fetch (default: 10)
 * @returns Array of recent memories
 */
const getRecentMemories = (restaurantId_1, ...args_1) => __awaiter(void 0, [restaurantId_1, ...args_1], void 0, function* (restaurantId, limit = 10) {
    const { data, error } = yield supabase_1.supabase
        .from('memories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) {
        console.error('Error fetching recent memories:', error);
        return [];
    }
    return data;
});
exports.getRecentMemories = getRecentMemories;
/**
 * Gets the most important memories for a restaurant
 * @param restaurantId The restaurant ID
 * @param limit Number of memories to fetch (default: 10)
 * @returns Array of important memories
 */
const getImportantMemories = (restaurantId_1, ...args_1) => __awaiter(void 0, [restaurantId_1, ...args_1], void 0, function* (restaurantId, limit = 10) {
    const { data, error } = yield supabase_1.supabase
        .from('memories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('importance', { ascending: false })
        .limit(limit);
    if (error) {
        console.error('Error fetching important memories:', error);
        return [];
    }
    return data;
});
exports.getImportantMemories = getImportantMemories;
