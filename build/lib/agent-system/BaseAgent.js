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
exports.BaseAgent = void 0;
const uuid_1 = require("uuid");
/**
 * Abstract base class that implements common agent functionality
 */
class BaseAgent {
    constructor(name, role, capabilities = []) {
        this.id = (0, uuid_1.v4)();
        this.name = name;
        this.role = role;
        this.capabilities = capabilities;
    }
    /**
     * Sets the knowledge base service used by this agent
     */
    setKnowledgeBaseService(service) {
        this.knowledgeBaseService = service;
    }
    /**
     * Determines if this agent can process the given task
     * Default implementation checks if the agent's capabilities include the task type
     */
    canProcess(task) {
        return this.capabilities.includes(task.type);
    }
    /**
     * Retrieves knowledge from the shared knowledge base
     */
    retrieveKnowledge(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.knowledgeBaseService) {
                throw new Error('Knowledge base service not initialized');
            }
            return this.knowledgeBaseService.retrieve(query);
        });
    }
    /**
     * Stores knowledge in the shared knowledge base
     */
    storeKnowledge(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.knowledgeBaseService) {
                throw new Error('Knowledge base service not initialized');
            }
            // Add the source as this agent
            const entryWithSource = Object.assign(Object.assign({}, entry), { source: `${this.role}:${this.id}` });
            return this.knowledgeBaseService.store(entryWithSource);
        });
    }
    /**
     * Helper method to update task status
     */
    updateTaskStatus(task, status, result) {
        return Object.assign(Object.assign({}, task), { status, updatedAt: new Date(), result: result || task.result });
    }
    /**
     * Logs agent activity for debugging and monitoring
     */
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        console[level](`[${timestamp}] [${this.role}:${this.name}] ${message}`);
    }
}
exports.BaseAgent = BaseAgent;
