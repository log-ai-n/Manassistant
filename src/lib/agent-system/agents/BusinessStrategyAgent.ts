import { BaseAgent } from '../BaseAgent';
import { AgentTask } from '../types';

/**
 * Business Strategy Agent
 * Responsible for analyzing business requirements, compliance needs, 
 * and translating them into technical specifications
 */
export class BusinessStrategyAgent extends BaseAgent {
  // Business domain knowledge
  private complianceRequirements: Map<string, string> = new Map();
  private businessPriorities: string[] = [];
  private stakeholders: Map<string, string[]> = new Map();

  constructor(name: string) {
    super(
      name, 
      'business-strategy',
      [
        'analyze-requirements',
        'compliance-check',
        'priority-assessment',
        'stakeholder-analysis',
        'feature-specification'
      ]
    );
  }

  /**
   * Set business domain knowledge
   */
  setComplianceRequirements(requirements: Record<string, string>): void {
    this.complianceRequirements = new Map(Object.entries(requirements));
  }

  /**
   * Set business priorities
   */
  setBusinessPriorities(priorities: string[]): void {
    this.businessPriorities = [...priorities];
  }

  /**
   * Set stakeholder information
   */
  setStakeholders(stakeholders: Record<string, string[]>): void {
    this.stakeholders = new Map(Object.entries(stakeholders));
  }

  /**
   * Process a task assigned to this agent
   */
  async process(task: AgentTask): Promise<AgentTask> {
    this.log(`Processing task: ${task.description}`);

    switch (task.type) {
      case 'analyze-requirements':
        return this.analyzeRequirements(task);
      case 'compliance-check':
        return this.complianceCheck(task);
      case 'priority-assessment':
        return this.priorityAssessment(task);
      case 'feature-specification':
        return this.createFeatureSpecification(task);
      default:
        return this.updateTaskStatus(task, 'failed', {
          error: `Unsupported task type: ${task.type}`
        });
    }
  }

  /**
   * Analyze high-level business requirements
   */
  private async analyzeRequirements(task: AgentTask): Promise<AgentTask> {
    const { requirementText } = task.context || {};
    
    if (!requirementText) {
      return this.updateTaskStatus(task, 'failed', {
        error: 'Missing requirement text in task context'
      });
    }

    try {
      // Parse the requirement text to extract key information
      const features = this.extractFeatures(requirementText);
      const stakeholders = this.identifyStakeholders(requirementText);
      const complianceNeeds = this.identifyComplianceNeeds(requirementText);
      const timeline = this.extractTimeline(requirementText);
      
      // Create a structured analysis
      const analysis = {
        features,
        stakeholders,
        complianceNeeds,
        timeline,
        feasibilityScore: this.calculateFeasibility(features, timeline)
      };
      
      // Store the analysis in the knowledge base
      await this.storeKnowledge({
        topic: 'requirement-analysis',
        content: JSON.stringify(analysis),
        tags: ['requirements', 'business-logic', ...features.map(f => f.name)]
      });
      
      return this.updateTaskStatus(task, 'completed', analysis);
    } catch (error) {
      this.log(`Error analyzing requirements: ${error}`, 'error');
      return this.updateTaskStatus(task, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Perform a compliance check against known requirements
   */
  private async complianceCheck(task: AgentTask): Promise<AgentTask> {
    const { featureSpec } = task.context || {};
    
    if (!featureSpec) {
      return this.updateTaskStatus(task, 'failed', {
        error: 'Missing feature specification in task context'
      });
    }

    try {
      const complianceResults = [];
      
      // Check the feature against all compliance requirements
      for (const [requirement, description] of this.complianceRequirements.entries()) {
        const isCompliant = this.checkComplianceRequirement(featureSpec, requirement);
        complianceResults.push({
          requirement,
          description,
          isCompliant,
          remediation: isCompliant ? null : this.generateRemediation(featureSpec, requirement)
        });
      }
      
      const overallCompliant = complianceResults.every(result => result.isCompliant);
      
      return this.updateTaskStatus(task, 'completed', {
        complianceResults,
        overallCompliant
      });
    } catch (error) {
      this.log(`Error checking compliance: ${error}`, 'error');
      return this.updateTaskStatus(task, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Assess the priority of a feature based on business priorities
   */
  private async priorityAssessment(task: AgentTask): Promise<AgentTask> {
    const { feature } = task.context || {};
    
    if (!feature) {
      return this.updateTaskStatus(task, 'failed', {
        error: 'Missing feature in task context'
      });
    }

    try {
      // Score the feature against business priorities
      const priorityScores = this.businessPriorities.map(priority => ({
        priority,
        score: this.calculatePriorityScore(feature, priority)
      }));
      
      // Calculate overall priority
      const totalScore = priorityScores.reduce((sum, item) => sum + item.score, 0);
      const averageScore = totalScore / priorityScores.length;
      
      // Determine priority level
      let priorityLevel: 'low' | 'medium' | 'high';
      if (averageScore > 0.7) {
        priorityLevel = 'high';
      } else if (averageScore > 0.4) {
        priorityLevel = 'medium';
      } else {
        priorityLevel = 'low';
      }
      
      return this.updateTaskStatus(task, 'completed', {
        priorityScores,
        averageScore,
        priorityLevel,
        recommendations: this.generatePriorityRecommendations(priorityLevel, feature)
      });
    } catch (error) {
      this.log(`Error assessing priority: ${error}`, 'error');
      return this.updateTaskStatus(task, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a detailed feature specification
   */
  private async createFeatureSpecification(task: AgentTask): Promise<AgentTask> {
    const { featureName, featureDescription } = task.context || {};
    
    if (!featureName || !featureDescription) {
      return this.updateTaskStatus(task, 'failed', {
        error: 'Missing feature name or description in task context'
      });
    }

    try {
      // Retrieve any existing knowledge about this feature
      const existingKnowledge = await this.retrieveKnowledge(featureName);
      
      // Create a detailed feature specification
      const specification = {
        name: featureName,
        description: featureDescription,
        userStories: this.generateUserStories(featureName, featureDescription),
        acceptanceCriteria: this.generateAcceptanceCriteria(featureName, featureDescription),
        technicalConstraints: this.identifyTechnicalConstraints(featureDescription),
        dataRequirements: this.identifyDataRequirements(featureDescription),
        impactAssessment: this.assessFeatureImpact(featureName, existingKnowledge)
      };
      
      // Store the specification in the knowledge base
      await this.storeKnowledge({
        topic: `feature-spec-${featureName}`,
        content: JSON.stringify(specification),
        tags: ['feature-specification', featureName]
      });
      
      return this.updateTaskStatus(task, 'completed', specification);
    } catch (error) {
      this.log(`Error creating feature specification: ${error}`, 'error');
      return this.updateTaskStatus(task, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods for requirement analysis
  private extractFeatures(text: string): Array<{name: string, description: string}> {
    // In a real system, this would use NLP or pattern matching
    // Here we use a simple approach for demonstration
    const features = [];
    const featureRegex = /feature:?\s*([^\.]+)/gi;
    
    let match;
    while ((match = featureRegex.exec(text)) !== null) {
      const featureText = match[1].trim();
      const nameMatch = featureText.match(/^([^:]+):/);
      
      if (nameMatch) {
        features.push({
          name: nameMatch[1].trim(),
          description: featureText.slice(nameMatch[0].length).trim()
        });
      } else {
        features.push({
          name: `Feature-${features.length + 1}`,
          description: featureText
        });
      }
    }
    
    return features;
  }

  private identifyStakeholders(text: string): string[] {
    // Simple pattern matching to find stakeholders
    // In production, use more sophisticated NLP
    const stakeholders = [];
    
    for (const [stakeholder, keywords] of this.stakeholders.entries()) {
      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          stakeholders.push(stakeholder);
          break;
        }
      }
    }
    
    return stakeholders;
  }

  private identifyComplianceNeeds(text: string): string[] {
    const complianceNeeds = [];
    
    for (const [requirement] of this.complianceRequirements.entries()) {
      if (text.toLowerCase().includes(requirement.toLowerCase())) {
        complianceNeeds.push(requirement);
      }
    }
    
    return complianceNeeds;
  }

  private extractTimeline(text: string): {startDate?: Date, endDate?: Date, description: string} {
    // Simple regex to find timeline references
    // In production, use date entity extraction
    const timelineRegex = /by\s([^\.]+)/i;
    const match = text.match(timelineRegex);
    
    if (match) {
      return {
        description: match[1].trim()
      };
    }
    
    return {
      description: 'No specific timeline mentioned'
    };
  }

  private calculateFeasibility(
    features: Array<{name: string, description: string}>, 
    timeline: {startDate?: Date, endDate?: Date, description: string}
  ): number {
    // Simple heuristic: more features = lower feasibility
    const baseScore = 1.0;
    const featurePenalty = features.length * 0.1;
    
    // Timeline penalty
    let timelinePenalty = 0;
    if (timeline.description.includes('immediate') || 
        timeline.description.includes('urgent') ||
        timeline.description.includes('ASAP')) {
      timelinePenalty = 0.3;
    }
    
    let score = baseScore - featurePenalty - timelinePenalty;
    return Math.max(0, Math.min(1, score));
  }

  // Helper methods for compliance check
  private checkComplianceRequirement(featureSpec: any, requirement: string): boolean {
    // In a real system, this would have specific logic for each requirement
    // Here we just do simple text matching
    const specString = JSON.stringify(featureSpec).toLowerCase();
    return specString.includes(requirement.toLowerCase());
  }

  private generateRemediation(featureSpec: any, requirement: string): string {
    return `Feature must address ${requirement} compliance. Consider adding explicit handling for ${requirement}.`;
  }

  // Helper methods for priority assessment
  private calculatePriorityScore(feature: any, priority: string): number {
    // In a real system, this would have sophisticated scoring algorithms
    // Here we just do simple text matching
    const featureString = JSON.stringify(feature).toLowerCase();
    const priorityTerms = priority.toLowerCase().split(' ');
    
    let matches = 0;
    for (const term of priorityTerms) {
      if (featureString.includes(term)) {
        matches++;
      }
    }
    
    return matches / priorityTerms.length;
  }

  private generatePriorityRecommendations(
    priorityLevel: 'low' | 'medium' | 'high', 
    feature: any
  ): string[] {
    const recommendations = [];
    
    switch (priorityLevel) {
      case 'high':
        recommendations.push('Allocate resources immediately');
        recommendations.push('Consider fast-tracking development');
        recommendations.push('Engage key stakeholders early');
        break;
      case 'medium':
        recommendations.push('Plan for implementation in next sprint');
        recommendations.push('Validate with stakeholders before committing resources');
        break;
      case 'low':
        recommendations.push('Consider deferring to later release cycle');
        recommendations.push('Evaluate if the feature aligns with business goals');
        break;
    }
    
    return recommendations;
  }

  // Helper methods for feature specification
  private generateUserStories(featureName: string, description: string): string[] {
    // In a real system, this would use more sophisticated generation techniques
    const stakeholders = this.identifyStakeholders(description);
    
    return stakeholders.map(stakeholder => 
      `As a ${stakeholder}, I want to ${featureName.toLowerCase()} so that I can ${this.generateBenefit(stakeholder, description)}`
    );
  }

  private generateBenefit(stakeholder: string, description: string): string {
    // Simple benefit generation
    return `improve my workflow with ${description.split(' ').slice(0, 3).join(' ')}`;
  }

  private generateAcceptanceCriteria(featureName: string, description: string): string[] {
    // Simple acceptance criteria generation
    return [
      `Given a user has access to ${featureName}, when they interact with it, then it should perform as expected`,
      `The ${featureName} must comply with all relevant security requirements`,
      `The ${featureName} must be accessible on all supported platforms`
    ];
  }

  private identifyTechnicalConstraints(description: string): string[] {
    // Simple constraint identification
    const constraints = [];
    
    if (description.toLowerCase().includes('performance')) {
      constraints.push('Must meet performance benchmarks');
    }
    
    if (description.toLowerCase().includes('mobile')) {
      constraints.push('Must be responsive on mobile devices');
    }
    
    if (description.toLowerCase().includes('security') || 
        description.toLowerCase().includes('secure')) {
      constraints.push('Must pass security review');
    }
    
    return constraints;
  }

  private identifyDataRequirements(description: string): string[] {
    // Simple data requirement identification
    const requirements = [];
    
    if (description.toLowerCase().includes('user') || 
        description.toLowerCase().includes('customer')) {
      requirements.push('User profile data');
    }
    
    if (description.toLowerCase().includes('report') || 
        description.toLowerCase().includes('analytics')) {
      requirements.push('Historical transaction data');
    }
    
    if (description.toLowerCase().includes('restaurant') || 
        description.toLowerCase().includes('menu')) {
      requirements.push('Restaurant menu data');
      requirements.push('Inventory data');
    }
    
    return requirements;
  }

  private assessFeatureImpact(
    featureName: string, 
    existingKnowledge: any[]
  ): {impactAreas: string[], riskLevel: 'low' | 'medium' | 'high'} {
    // Simple impact assessment
    const impactAreas = [];
    
    if (featureName.toLowerCase().includes('user') || 
        featureName.toLowerCase().includes('login')) {
      impactAreas.push('User authentication system');
    }
    
    if (featureName.toLowerCase().includes('payment') || 
        featureName.toLowerCase().includes('billing')) {
      impactAreas.push('Payment processing system');
    }
    
    if (featureName.toLowerCase().includes('report') || 
        featureName.toLowerCase().includes('analytics')) {
      impactAreas.push('Reporting system');
    }
    
    // Determine risk level based on impact areas
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (impactAreas.includes('Payment processing system')) {
      riskLevel = 'high';
    } else if (impactAreas.includes('User authentication system')) {
      riskLevel = 'medium';
    }
    
    return {
      impactAreas,
      riskLevel
    };
  }
} 