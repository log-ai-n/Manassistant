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
exports.InMemoryKnowledgeBase = void 0;
const uuid_1 = require("uuid");
/**
 * In-memory implementation of the knowledge base
 * In a production system, this would be replaced with a persistent database
 */
class InMemoryKnowledgeBase {
    constructor() {
        this.entries = new Map();
    }
    /**
     * Store a new knowledge entry
     */
    store(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = (0, uuid_1.v4)();
            const timestamp = new Date();
            const newEntry = Object.assign(Object.assign({}, entry), { id,
                timestamp });
            this.entries.set(id, newEntry);
            return newEntry;
        });
    }
    /**
     * Retrieve entries by simple text search in content
     * Note: In production, this would use a proper search index or vector DB
     */
    retrieve(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, limit = 10) {
            const lowerQuery = query.toLowerCase();
            const results = [];
            for (const entry of this.entries.values()) {
                // Simple text matching - in production use embeddings/vector search
                if (entry.content.toLowerCase().includes(lowerQuery) ||
                    entry.topic.toLowerCase().includes(lowerQuery)) {
                    results.push(entry);
                }
                if (results.length >= limit) {
                    break;
                }
            }
            return results;
        });
    }
    /**
     * Retrieve entries by tags
     */
    retrieveByTags(tags_1) {
        return __awaiter(this, arguments, void 0, function* (tags, limit = 10) {
            const results = [];
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
        });
    }
    /**
     * Update an existing knowledge entry
     */
    update(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingEntry = this.entries.get(id);
            if (!existingEntry) {
                throw new Error(`Knowledge entry with ID ${id} not found`);
            }
            const updatedEntry = Object.assign(Object.assign(Object.assign({}, existingEntry), updates), { id, timestamp: updates.timestamp || existingEntry.timestamp // Keep original timestamp unless explicitly updated
             });
            this.entries.set(id, updatedEntry);
            return updatedEntry;
        });
    }
    /**
     * Delete a knowledge entry
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.entries.delete(id);
        });
    }
    /**
     * Get all entries (for debugging)
     */
    getAllEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            return Array.from(this.entries.values());
        });
    }
}
exports.InMemoryKnowledgeBase = InMemoryKnowledgeBase;
