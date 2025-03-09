import { v4 as uuidv4 } from 'uuid';
import { Agent, AgentTask, Orchestrator as IOrchestartor, Workflow, WorkflowStep } from './types';

/**
 * Implementation of the Orchestrator interface that manages agent workflows
 */
export class Orchestrator implements IOrchestartor {
  agents: Agent[] = [];
  tasks: AgentTask[] = [];
  private workflows: Map<string, Workflow> = new Map();
  private activeWorkflows: Set<string> = new Set();

  /**
   * Register a new agent with the orchestrator
   */
  registerAgent(agent: Agent): void {
    // Check if agent with same ID already exists
    if (this.agents.some(a => a.id === agent.id)) {
      throw new Error(`Agent with ID ${agent.id} already registered`);
    }
    
    this.agents.push(agent);
    console.log(`Registered agent: ${agent.role}:${agent.name}`);
  }

  /**
   * Unregister an agent from the orchestrator
   */
  unregisterAgent(agentId: string): void {
    const initialLength = this.agents.length;
    this.agents = this.agents.filter(agent => agent.id !== agentId);
    
    if (this.agents.length === initialLength) {
      console.warn(`No agent with ID ${agentId} found to unregister`);
    } else {
      console.log(`Unregistered agent with ID ${agentId}`);
    }
  }

  /**
   * Add a new task to the orchestrator
   */
  async addTask(task: Omit<AgentTask, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<AgentTask> {
    const newTask: AgentTask = {
      ...task,
      id: uuidv4(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tasks.push(newTask);
    console.log(`Added task: ${newTask.id} - ${newTask.description}`);
    return newTask;
  }

  /**
   * Assign a task to a specific agent or auto-assign based on capabilities
   */
  async assignTask(taskId: string, agentId?: string): Promise<AgentTask> {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    
    const task = this.tasks[taskIndex];
    
    // If specific agent ID provided, assign to that agent
    if (agentId) {
      const agent = this.agents.find(a => a.id === agentId);
      
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }
      
      if (!agent.canProcess(task)) {
        throw new Error(`Agent ${agent.name} (${agent.role}) cannot process task of type ${task.type}`);
      }
      
      const updatedTask: AgentTask = {
        ...task,
        assignedTo: agentId,
        status: 'in-progress',
        updatedAt: new Date()
      };
      
      this.tasks[taskIndex] = updatedTask;
      console.log(`Assigned task ${taskId} to agent ${agent.role}:${agent.name}`);
      
      // Start processing the task
      this.processTask(updatedTask, agent);
      
      return updatedTask;
    }
    
    // Auto-assign to first capable agent
    for (const agent of this.agents) {
      if (agent.canProcess(task)) {
        const updatedTask: AgentTask = {
          ...task,
          assignedTo: agent.id,
          status: 'in-progress',
          updatedAt: new Date()
        };
        
        this.tasks[taskIndex] = updatedTask;
        console.log(`Auto-assigned task ${taskId} to agent ${agent.role}:${agent.name}`);
        
        // Start processing the task
        this.processTask(updatedTask, agent);
        
        return updatedTask;
      }
    }
    
    throw new Error(`No capable agent found for task of type ${task.type}`);
  }

  /**
   * Get the current status of a task
   */
  async getTaskStatus(taskId: string): Promise<AgentTask> {
    const task = this.tasks.find(task => task.id === taskId);
    
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    
    return task;
  }

  /**
   * Process a task with the assigned agent
   */
  private async processTask(task: AgentTask, agent: Agent): Promise<void> {
    try {
      const processedTask = await agent.process(task);
      
      // Update task in our list
      const taskIndex = this.tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = processedTask;
        console.log(`Task ${task.id} processed by ${agent.role}:${agent.name}, status: ${processedTask.status}`);
      }
      
      // Check for any dependent tasks in active workflows
      this.checkWorkflowDependencies(task.id);
    } catch (error) {
      console.error(`Error processing task ${task.id} by agent ${agent.role}:${agent.name}:`, error);
      
      // Update task status to failed
      const taskIndex = this.tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = {
          ...task,
          status: 'failed',
          updatedAt: new Date(),
          result: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
      }
    }
  }

  /**
   * Register a workflow for later execution
   */
  registerWorkflow(workflow: Workflow): void {
    if (this.workflows.has(workflow.id)) {
      throw new Error(`Workflow with ID ${workflow.id} already registered`);
    }
    
    this.workflows.set(workflow.id, workflow);
    console.log(`Registered workflow: ${workflow.name} (${workflow.id})`);
  }

  /**
   * Execute a registered workflow with the given context
   */
  async executeWorkflow(workflowId: string, context: Record<string, any> = {}): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }
    
    console.log(`Executing workflow: ${workflow.name} (${workflow.id})`);
    this.activeWorkflows.add(workflowId);
    
    // Start all steps that don't have dependencies
    const initialSteps = workflow.steps.filter(step => !step.dependencies || step.dependencies.length === 0);
    
    for (const step of initialSteps) {
      // Skip if the step has a condition that evaluates to false
      if (step.condition && !step.condition(context)) {
        console.log(`Skipping step ${step.id} because condition evaluated to false`);
        continue;
      }
      
      // Create and add a task for this step
      const task = await this.addTask({
        type: step.taskType,
        priority: 'medium',
        description: step.description,
        context: {
          ...context,
          workflowId,
          stepId: step.id
        }
      });
      
      // Assign to specific agent role if specified, otherwise auto-assign
      if (step.agentRole) {
        const agent = this.agents.find(a => a.role === step.agentRole);
        if (agent) {
          await this.assignTask(task.id, agent.id);
        } else {
          console.warn(`No agent with role ${step.agentRole} found for step ${step.id}`);
          await this.assignTask(task.id); // Fallback to auto-assign
        }
      } else {
        await this.assignTask(task.id);
      }
    }
  }

  /**
   * Check if any workflow steps are now ready to execute after a task completes
   */
  private checkWorkflowDependencies(completedTaskId: string): void {
    // Find the task to check its status
    const completedTask = this.tasks.find(task => task.id === completedTaskId);
    if (!completedTask || completedTask.status !== 'completed') {
      return; // Only proceed with completed tasks
    }
    
    // Extract workflow context if this was a workflow task
    const workflowId = completedTask.context?.workflowId;
    const stepId = completedTask.context?.stepId;
    
    if (!workflowId || !stepId || !this.activeWorkflows.has(workflowId)) {
      return; // Not a workflow task or workflow not active
    }
    
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return;
    }
    
    // Find all steps that depend on the completed step
    const dependentSteps = workflow.steps.filter(step => 
      step.dependencies && step.dependencies.includes(stepId)
    );
    
    for (const step of dependentSteps) {
      // Check if all dependencies are completed
      const allDependenciesMet = step.dependencies?.every(depStepId => {
        // Find tasks for this dependency
        const depTasks = this.tasks.filter(task => 
          task.context?.workflowId === workflowId && 
          task.context?.stepId === depStepId
        );
        
        // Check if any of these tasks completed successfully
        return depTasks.some(task => task.status === 'completed');
      }) ?? true;
      
      if (allDependenciesMet) {
        // All dependencies are met, create a new task for this step
        this.addTask({
          type: step.taskType,
          priority: 'medium',
          description: step.description,
          context: {
            ...completedTask.context,
            previousResults: completedTask.result,
            stepId: step.id
          }
        }).then(task => {
          // Assign to specific agent role if specified, otherwise auto-assign
          if (step.agentRole) {
            const agent = this.agents.find(a => a.role === step.agentRole);
            if (agent) {
              this.assignTask(task.id, agent.id);
            } else {
              this.assignTask(task.id); // Fallback to auto-assign
            }
          } else {
            this.assignTask(task.id);
          }
        });
      }
    }
    
    // Check if workflow is complete (all steps have corresponding completed tasks)
    this.checkWorkflowCompletion(workflowId);
  }

  /**
   * Check if a workflow has completed all its steps
   */
  private checkWorkflowCompletion(workflowId: string): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return;
    }
    
    // Count completed steps
    const workflowTasks = this.tasks.filter(task => 
      task.context?.workflowId === workflowId
    );
    
    const completedStepIds = new Set(
      workflowTasks
        .filter(task => task.status === 'completed')
        .map(task => task.context?.stepId)
    );
    
    const allStepsComplete = workflow.steps.every(step => 
      completedStepIds.has(step.id)
    );
    
    if (allStepsComplete) {
      console.log(`Workflow ${workflow.name} (${workflowId}) completed successfully`);
      this.activeWorkflows.delete(workflowId);
    }
  }
} 