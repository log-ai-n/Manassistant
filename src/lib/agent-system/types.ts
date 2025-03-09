// Agent System Types
// Defines the core types for the multi-agent architecture

/**
 * Knowledge entry in the shared knowledge base
 */
export interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
  source: string;
  timestamp: Date;
  tags: string[];
}

/**
 * Represents a task that can be processed by agents
 */
export interface AgentTask {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  description: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  dependencies?: string[];
  context?: Record<string, any>;
  result?: any;
}

/**
 * Core agent interface that all specialized agents will implement
 */
export interface Agent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  
  // Core methods
  canProcess(task: AgentTask): boolean;
  process(task: AgentTask): Promise<AgentTask>;
  
  // Knowledge base interactions
  retrieveKnowledge(query: string): Promise<KnowledgeEntry[]>;
  storeKnowledge(entry: Omit<KnowledgeEntry, 'id' | 'timestamp'>): Promise<KnowledgeEntry>;
}

/**
 * Orchestrator that manages workflow between agents
 */
export interface Orchestrator {
  agents: Agent[];
  tasks: AgentTask[];
  
  // Task management
  addTask(task: Omit<AgentTask, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<AgentTask>;
  assignTask(taskId: string, agentId?: string): Promise<AgentTask>;
  getTaskStatus(taskId: string): Promise<AgentTask>;
  
  // Agent management
  registerAgent(agent: Agent): void;
  unregisterAgent(agentId: string): void;
  
  // Workflow execution
  executeWorkflow(workflowId: string, context?: Record<string, any>): Promise<void>;
}

/**
 * Predefined workflows for common operations
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

/**
 * Single step in a workflow
 */
export interface WorkflowStep {
  id: string;
  taskType: string;
  description: string;
  agentRole?: string; // If specific agent role is required
  dependencies?: string[]; // IDs of steps that must complete before this one
  condition?: (context: Record<string, any>) => boolean; // Optional condition to execute this step
}

/**
 * Shared knowledge base for storing and retrieving context
 */
export interface KnowledgeBase {
  store(entry: Omit<KnowledgeEntry, 'id' | 'timestamp'>): Promise<KnowledgeEntry>;
  retrieve(query: string, limit?: number): Promise<KnowledgeEntry[]>;
  retrieveByTags(tags: string[], limit?: number): Promise<KnowledgeEntry[]>;
  update(id: string, updates: Partial<KnowledgeEntry>): Promise<KnowledgeEntry>;
  delete(id: string): Promise<boolean>;
} 