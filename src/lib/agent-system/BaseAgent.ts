import { v4 as uuidv4 } from 'uuid';
import { Agent, AgentTask, KnowledgeEntry } from './types';

/**
 * Abstract base class that implements common agent functionality
 */
export abstract class BaseAgent implements Agent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  private knowledgeBaseService: any; // Will be properly typed once KnowledgeBase is implemented

  constructor(name: string, role: string, capabilities: string[] = []) {
    this.id = uuidv4();
    this.name = name;
    this.role = role;
    this.capabilities = capabilities;
  }

  /**
   * Sets the knowledge base service used by this agent
   */
  setKnowledgeBaseService(service: any): void {
    this.knowledgeBaseService = service;
  }

  /**
   * Determines if this agent can process the given task
   * Default implementation checks if the agent's capabilities include the task type
   */
  canProcess(task: AgentTask): boolean {
    return this.capabilities.includes(task.type);
  }

  /**
   * Process the given task - must be implemented by concrete agent classes
   */
  abstract process(task: AgentTask): Promise<AgentTask>;

  /**
   * Retrieves knowledge from the shared knowledge base
   */
  async retrieveKnowledge(query: string): Promise<KnowledgeEntry[]> {
    if (!this.knowledgeBaseService) {
      throw new Error('Knowledge base service not initialized');
    }
    return this.knowledgeBaseService.retrieve(query);
  }

  /**
   * Stores knowledge in the shared knowledge base
   */
  async storeKnowledge(entry: Omit<KnowledgeEntry, 'id' | 'timestamp'>): Promise<KnowledgeEntry> {
    if (!this.knowledgeBaseService) {
      throw new Error('Knowledge base service not initialized');
    }
    
    // Add the source as this agent
    const entryWithSource = {
      ...entry,
      source: `${this.role}:${this.id}`
    };
    
    return this.knowledgeBaseService.store(entryWithSource);
  }

  /**
   * Helper method to update task status
   */
  protected updateTaskStatus(task: AgentTask, status: AgentTask['status'], result?: any): AgentTask {
    return {
      ...task,
      status,
      updatedAt: new Date(),
      result: result || task.result
    };
  }

  /**
   * Logs agent activity for debugging and monitoring
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] [${this.role}:${this.name}] ${message}`);
  }
} 