import { BaseAgent } from '../BaseAgent';
import { AgentTask } from '../types';

/**
 * Prompt Engineer Agent
 * Responsible for crafting optimal prompts for other agents or external LLMs to use
 */
export class PromptEngineerAgent extends BaseAgent {
  // Template library
  private promptTemplates: Map<string, string> = new Map();
  
  constructor(name: string) {
    super(
      name,
      'prompt-engineer',
      [
        'craft-prompt',
        'refine-prompt',
        'template-management',
        'prompt-evaluation'
      ]
    );
    
    // Initialize with some basic templates
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize with default prompt templates
   */
  private initializeDefaultTemplates(): void {
    this.promptTemplates.set('code-generation', 
      `Create a {language} function that implements the following feature:
      Feature Name: {featureName}
      Description: {featureDescription}
      Input Parameters: {parameters}
      Expected Output: {output}
      Error Handling: {errorHandling}
      Additional Context: {context}
      
      The code should follow these guidelines:
      - Be well-documented with comments
      - Include appropriate error handling
      - Follow best practices for {language}
      - Be optimized for readability and maintainability`
    );
    
    this.promptTemplates.set('code-review', 
      `Review the following {language} code for issues related to:
      - Functionality (does it implement {featureDescription} correctly?)
      - Performance
      - Security vulnerabilities
      - Edge cases
      - Code style and best practices
      
      Code to review:
      {code}
      
      Additional Context: {context}
      
      Provide specific feedback, including:
      1. Critical issues that must be fixed
      2. Minor issues that should be improved
      3. Recommendations for better alternatives if applicable`
    );
    
    this.promptTemplates.set('feature-requirements',
      `Based on the following business requirement:
      {requirement}
      
      Generate a detailed technical specification that includes:
      1. User stories from the perspective of {stakeholders}
      2. Acceptance criteria that define when the feature is complete
      3. Technical constraints and considerations
      4. Data requirements
      5. Integration points with existing systems
      6. Potential challenges and risks
      
      Additional Context: {context}`
    );
  }

  /**
   * Process a task assigned to this agent
   */
  async process(task: AgentTask): Promise<AgentTask> {
    this.log(`Processing task: ${task.description}`);

    switch (task.type) {
      case 'craft-prompt':
        return this.craftPrompt(task);
      case 'refine-prompt':
        return this.refinePrompt(task);
      case 'template-management':
        return this.manageTemplate(task);
      case 'prompt-evaluation':
        return this.evaluatePrompt(task);
      default:
        return this.updateTaskStatus(task, 'failed', {
          error: `Unsupported task type: ${task.type}`
        });
    }
  }

  /**
   * Craft a new prompt based on provided parameters
   */
  private async craftPrompt(task: AgentTask): Promise<AgentTask> {
    const { 
      templateName, 
      parameters,
      targetAgent,
      requirements
    } = task.context || {};
    
    if (!templateName && !requirements) {
      return this.updateTaskStatus(task, 'failed', {
        error: 'Missing templateName or requirements in task context'
      });
    }

    try {
      let prompt: string;
      
      // Use existing template if provided
      if (templateName && this.promptTemplates.has(templateName)) {
        prompt = this.promptTemplates.get(templateName) || '';
        
        // Replace template variables with parameter values
        if (parameters && typeof parameters === 'object') {
          for (const [key, value] of Object.entries(parameters)) {
            const placeholder = `{${key}}`;
            prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
          }
        }
      } 
      // Generate a custom prompt based on requirements
      else if (requirements) {
        prompt = await this.generateCustomPrompt(requirements, targetAgent);
      }
      else {
        throw new Error('Either templateName must exist in template library or requirements must be provided');
      }
      
      // Enhance the prompt with additional context from the knowledge base
      prompt = await this.enhancePromptWithContext(prompt, task.context);
      
      // Store the crafted prompt in the knowledge base
      await this.storeKnowledge({
        topic: 'crafted-prompt',
        content: prompt,
        tags: ['prompt', targetAgent || 'general', templateName || 'custom']
      });
      
      return this.updateTaskStatus(task, 'completed', {
        prompt,
        targetAgent,
        templateUsed: templateName || 'custom-generated'
      });
    } catch (error) {
      this.log(`Error crafting prompt: ${error}`, 'error');
      return this.updateTaskStatus(task, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Refine an existing prompt based on feedback or performance
   */
  private async refinePrompt(task: AgentTask): Promise<AgentTask> {
    const { 
      originalPrompt, 
      feedback,
      targetAgent
    } = task.context || {};
    
    if (!originalPrompt || !feedback) {
      return this.updateTaskStatus(task, 'failed', {
        error: 'Missing originalPrompt or feedback in task context'
      });
    }

    try {
      // Analyze the feedback to identify improvement areas
      const improvementAreas = this.analyzePromptFeedback(feedback);
      
      // Apply refinements based on identified areas
      let refinedPrompt = originalPrompt;
      for (const area of improvementAreas) {
        refinedPrompt = this.applyPromptRefinement(refinedPrompt, area);
      }
      
      // Store the refined prompt
      await this.storeKnowledge({
        topic: 'refined-prompt',
        content: refinedPrompt,
        tags: ['prompt', 'refined', targetAgent || 'general']
      });
      
      return this.updateTaskStatus(task, 'completed', {
        originalPrompt,
        refinedPrompt,
        improvementAreas,
        targetAgent
      });
    } catch (error) {
      this.log(`Error refining prompt: ${error}`, 'error');
      return this.updateTaskStatus(task, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Manage prompt templates (add, update, delete)
   */
  private async manageTemplate(task: AgentTask): Promise<AgentTask> {
    const { 
      action, 
      templateName,
      templateContent
    } = task.context || {};
    
    if (!action || !templateName) {
      return this.updateTaskStatus(task, 'failed', {
        error: 'Missing action or templateName in task context'
      });
    }

    try {
      switch (action) {
        case 'add':
          if (!templateContent) {
            throw new Error('Missing templateContent for add action');
          }
          this.promptTemplates.set(templateName, templateContent);
          this.log(`Added template: ${templateName}`);
          break;
          
        case 'update':
          if (!templateContent) {
            throw new Error('Missing templateContent for update action');
          }
          if (!this.promptTemplates.has(templateName)) {
            throw new Error(`Template ${templateName} does not exist`);
          }
          this.promptTemplates.set(templateName, templateContent);
          this.log(`Updated template: ${templateName}`);
          break;
          
        case 'delete':
          if (!this.promptTemplates.has(templateName)) {
            throw new Error(`Template ${templateName} does not exist`);
          }
          this.promptTemplates.delete(templateName);
          this.log(`Deleted template: ${templateName}`);
          break;
          
        case 'get':
          if (!this.promptTemplates.has(templateName)) {
            throw new Error(`Template ${templateName} does not exist`);
          }
          return this.updateTaskStatus(task, 'completed', {
            templateName,
            templateContent: this.promptTemplates.get(templateName)
          });
          
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
      
      // Get current list of templates for the result
      const templates = Array.from(this.promptTemplates.keys());
      
      return this.updateTaskStatus(task, 'completed', {
        action,
        templateName,
        templates
      });
    } catch (error) {
      this.log(`Error managing template: ${error}`, 'error');
      return this.updateTaskStatus(task, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Evaluate the quality and effectiveness of a prompt
   */
  private async evaluatePrompt(task: AgentTask): Promise<AgentTask> {
    const { 
      prompt, 
      results,
      criteria
    } = task.context || {};
    
    if (!prompt || !results) {
      return this.updateTaskStatus(task, 'failed', {
        error: 'Missing prompt or results in task context'
      });
    }

    try {
      // Define evaluation criteria (use provided or defaults)
      const evaluationCriteria = criteria || {
        clarity: true,
        specificity: true,
        contextProvision: true,
        constraintCommunication: true
      };
      
      // Perform evaluation
      const evaluation = {
        scores: this.scorePrompt(prompt, results, evaluationCriteria),
        strengths: this.identifyPromptStrengths(prompt),
        weaknesses: this.identifyPromptWeaknesses(prompt, results),
        suggestions: this.generatePromptSuggestions(prompt, results)
      };
      
      // Calculate overall score
      const scores = evaluation.scores;
      const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;
      
      return this.updateTaskStatus(task, 'completed', {
        ...evaluation,
        overallScore
      });
    } catch (error) {
      this.log(`Error evaluating prompt: ${error}`, 'error');
      return this.updateTaskStatus(task, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods for prompt crafting
  private async generateCustomPrompt(requirements: string, targetAgent?: string): Promise<string> {
    // In a real system, this would use LLM to generate a custom prompt
    // Here we use a template-based approach for demonstration
    
    let promptTemplate: string;
    
    if (targetAgent && targetAgent.includes('technical')) {
      promptTemplate = `
      Task: Implement the following technical requirement
      
      Requirement: {requirement}
      
      Please provide:
      1. A solution design
      2. Implementation code
      3. Testing approach
      4. Deployment considerations
      
      Focus on clean code, error handling, and performance.
      `;
    } else if (targetAgent && targetAgent.includes('qa')) {
      promptTemplate = `
      Task: Test the implementation of the following requirement
      
      Requirement: {requirement}
      
      Please provide:
      1. Test cases covering happy paths
      2. Test cases covering edge cases
      3. Test cases covering error scenarios
      4. Performance test considerations
      
      Focus on thorough test coverage and identifying potential issues.
      `;
    } else {
      promptTemplate = `
      Task: Analyze the following requirement
      
      Requirement: {requirement}
      
      Please provide a detailed analysis, including:
      1. Key functionality needed
      2. Potential challenges
      3. Implementation approach
      4. Success criteria
      
      Be thorough and consider all aspects of the requirement.
      `;
    }
    
    // Replace the requirement placeholder
    return promptTemplate.replace('{requirement}', requirements);
  }

  private async enhancePromptWithContext(prompt: string, context: any): Promise<string> {
    if (!context) {
      return prompt;
    }
    
    // Retrieve relevant knowledge entries
    const contextKeys = Object.keys(context);
    let relevantEntries: any[] = [];
    
    for (const key of contextKeys) {
      try {
        const entries = await this.retrieveKnowledge(String(context[key]));
        relevantEntries = [...relevantEntries, ...entries];
      } catch (error) {
        // Skip this context item if it causes an error
        this.log(`Error retrieving knowledge for ${key}: ${error}`, 'warn');
      }
    }
    
    if (relevantEntries.length === 0) {
      return prompt;
    }
    
    // Add context section to the prompt
    let enhancedPrompt = prompt;
    
    if (!enhancedPrompt.includes('Additional Context:')) {
      enhancedPrompt += '\n\nAdditional Context:';
    }
    
    for (const entry of relevantEntries) {
      enhancedPrompt += `\n- ${entry.topic}: ${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}`;
    }
    
    return enhancedPrompt;
  }

  // Helper methods for prompt refinement
  private analyzePromptFeedback(feedback: string): string[] {
    // In a real system, this would use NLP to analyze feedback
    // Here we use simple pattern matching for demonstration
    const areas = [];
    
    if (feedback.toLowerCase().includes('unclear')) {
      areas.push('clarity');
    }
    
    if (feedback.toLowerCase().includes('specific') || feedback.toLowerCase().includes('details')) {
      areas.push('specificity');
    }
    
    if (feedback.toLowerCase().includes('context')) {
      areas.push('context');
    }
    
    if (feedback.toLowerCase().includes('constraints') || feedback.toLowerCase().includes('limitations')) {
      areas.push('constraints');
    }
    
    if (feedback.toLowerCase().includes('examples')) {
      areas.push('examples');
    }
    
    return areas;
  }

  private applyPromptRefinement(prompt: string, area: string): string {
    switch (area) {
      case 'clarity':
        return this.improveClarity(prompt);
      case 'specificity':
        return this.improveSpecificity(prompt);
      case 'context':
        return this.improveContext(prompt);
      case 'constraints':
        return this.improveConstraints(prompt);
      case 'examples':
        return this.addExamples(prompt);
      default:
        return prompt;
    }
  }

  private improveClarity(prompt: string): string {
    // Break down complex sentences
    let refined = prompt.replace(/(.{80,}?[.!?])/g, '$1\n');
    
    // Add section headers if not present
    if (!refined.includes(':')) {
      refined = refined.replace(/\n\n/g, '\n\n## ');
    }
    
    return refined;
  }

  private improveSpecificity(prompt: string): string {
    // Add more specific directive language
    let refined = prompt.replace(/(?:please|kindly)?(?:\s+)provide/gi, 'provide detailed');
    refined = refined.replace(/(?:create|generate|implement)/gi, 'specifically $&');
    
    return refined;
  }

  private improveContext(prompt: string): string {
    if (!prompt.includes('context') && !prompt.includes('Context')) {
      return prompt + '\n\nContext: Ensure your response considers the overall system architecture and integration points.';
    }
    return prompt;
  }

  private improveConstraints(prompt: string): string {
    if (!prompt.includes('constraints') && !prompt.includes('Constraints')) {
      return prompt + '\n\nConstraints: Ensure the solution follows our coding standards and performance requirements.';
    }
    return prompt;
  }

  private addExamples(prompt: string): string {
    if (!prompt.includes('example') && !prompt.includes('Example')) {
      return prompt + '\n\nExample: For similar features, we typically implement them using the repository pattern with appropriate error handling.';
    }
    return prompt;
  }

  // Helper methods for prompt evaluation
  private scorePrompt(prompt: string, results: any, criteria: any): Record<string, number> {
    const scores: Record<string, number> = {};
    
    // Score based on defined criteria
    if (criteria.clarity) {
      scores.clarity = this.scoreClarity(prompt);
    }
    
    if (criteria.specificity) {
      scores.specificity = this.scoreSpecificity(prompt);
    }
    
    if (criteria.contextProvision) {
      scores.contextProvision = this.scoreContextProvision(prompt);
    }
    
    if (criteria.constraintCommunication) {
      scores.constraintCommunication = this.scoreConstraintCommunication(prompt);
    }
    
    return scores;
  }

  private scoreClarity(prompt: string): number {
    // Simple heuristics for clarity scoring
    let score = 0.5; // Base score
    
    // Check for section headers
    if (prompt.includes(':')) {
      score += 0.2;
    }
    
    // Check for reasonable sentence length
    const sentences = prompt.match(/[^.!?]+[.!?]+/g) || [];
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / Math.max(1, sentences.length);
    
    if (avgSentenceLength < 100) {
      score += 0.2;
    }
    
    // Check for numbered lists
    if (prompt.match(/\d+\.\s+\w+/g)) {
      score += 0.1;
    }
    
    return Math.min(1, score);
  }

  private scoreSpecificity(prompt: string): number {
    // Simple heuristics for specificity scoring
    let score = 0.5; // Base score
    
    // Check for specific technical terms
    const techTerms = ['function', 'method', 'class', 'database', 'API', 'endpoint', 'service', 'component'];
    const termCount = techTerms.filter(term => prompt.toLowerCase().includes(term.toLowerCase())).length;
    
    score += Math.min(0.3, termCount * 0.05);
    
    // Check for quantifiers and specifics
    if (prompt.match(/\d+ (minutes|hours|days|weeks|months)/g)) {
      score += 0.1;
    }
    
    if (prompt.match(/exactly|specifically|precisely/g)) {
      score += 0.1;
    }
    
    return Math.min(1, score);
  }

  private scoreContextProvision(prompt: string): number {
    // Simple heuristics for context provision scoring
    let score = 0.5; // Base score
    
    // Check for context sections
    if (prompt.toLowerCase().includes('context') || prompt.toLowerCase().includes('background')) {
      score += 0.3;
    }
    
    // Check for references to system components
    const systemComponents = ['system', 'architecture', 'database', 'frontend', 'backend', 'service'];
    const componentCount = systemComponents.filter(comp => prompt.toLowerCase().includes(comp.toLowerCase())).length;
    
    score += Math.min(0.2, componentCount * 0.05);
    
    return Math.min(1, score);
  }

  private scoreConstraintCommunication(prompt: string): number {
    // Simple heuristics for constraint communication scoring
    let score = 0.5; // Base score
    
    // Check for constraint sections
    if (prompt.toLowerCase().includes('constraints') || prompt.toLowerCase().includes('requirements') || 
        prompt.toLowerCase().includes('limitations')) {
      score += 0.3;
    }
    
    // Check for specific constraints
    const constraintTerms = ['must', 'should', 'need to', 'cannot', 'don\'t', 'avoid'];
    const constraintCount = constraintTerms.filter(term => prompt.toLowerCase().includes(term.toLowerCase())).length;
    
    score += Math.min(0.2, constraintCount * 0.05);
    
    return Math.min(1, score);
  }

  private identifyPromptStrengths(prompt: string): string[] {
    const strengths = [];
    
    // Clear structure
    if (prompt.includes(':') || prompt.match(/\d+\.\s+\w+/g)) {
      strengths.push('Well-structured format');
    }
    
    // Context provision
    if (prompt.toLowerCase().includes('context') || prompt.toLowerCase().includes('background')) {
      strengths.push('Provides necessary context');
    }
    
    // Constraint communication
    if (prompt.toLowerCase().includes('constraints') || prompt.toLowerCase().includes('requirements')) {
      strengths.push('Clearly communicates constraints');
    }
    
    // Example inclusion
    if (prompt.toLowerCase().includes('example') || prompt.toLowerCase().includes('sample')) {
      strengths.push('Includes helpful examples');
    }
    
    return strengths.length > 0 ? strengths : ['No specific strengths identified'];
  }

  private identifyPromptWeaknesses(prompt: string, results: any): string[] {
    const weaknesses = [];
    
    // Check length
    if (prompt.length < 100) {
      weaknesses.push('Too brief, needs more detail');
    } else if (prompt.length > 1000) {
      weaknesses.push('Too verbose, could be more concise');
    }
    
    // Check for missing sections
    if (!prompt.toLowerCase().includes('context') && !prompt.toLowerCase().includes('background')) {
      weaknesses.push('Missing context or background information');
    }
    
    if (!prompt.toLowerCase().includes('constraints') && !prompt.toLowerCase().includes('requirements')) {
      weaknesses.push('Missing constraints or requirements');
    }
    
    // Check for specificity
    const techTerms = ['function', 'method', 'class', 'database', 'API', 'endpoint', 'service', 'component'];
    const termCount = techTerms.filter(term => prompt.toLowerCase().includes(term.toLowerCase())).length;
    
    if (termCount < 2) {
      weaknesses.push('Lacks technical specificity');
    }
    
    return weaknesses.length > 0 ? weaknesses : ['No specific weaknesses identified'];
  }

  private generatePromptSuggestions(prompt: string, results: any): string[] {
    const suggestions = [];
    
    // Structure suggestions
    if (!prompt.match(/\d+\.\s+\w+/g)) {
      suggestions.push('Use numbered lists for clearer instructions');
    }
    
    // Specificity suggestions
    if (!prompt.match(/exactly|specifically|precisely/g)) {
      suggestions.push('Add more precise language like "specifically" or "exactly"');
    }
    
    // Missing components
    if (!prompt.toLowerCase().includes('example') && !prompt.toLowerCase().includes('sample')) {
      suggestions.push('Include examples to clarify expectations');
    }
    
    if (!prompt.toLowerCase().includes('context') && !prompt.toLowerCase().includes('background')) {
      suggestions.push('Add context/background section');
    }
    
    if (!prompt.toLowerCase().includes('constraints') && !prompt.toLowerCase().includes('requirements')) {
      suggestions.push('Add constraints/requirements section');
    }
    
    return suggestions.length > 0 ? suggestions : ['No specific suggestions at this time'];
  }
} 