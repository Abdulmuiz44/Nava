export interface Workflow {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isPublic?: boolean;
}

export class WorkflowManager {
  private static STORAGE_KEY = 'nava_workflows';

  static saveWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Workflow {
    const workflows = this.getWorkflows();
    const newWorkflow: Workflow = {
      ...workflow,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    workflows.push(newWorkflow);
    this.saveToStorage(workflows);
    return newWorkflow;
  }

  static updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | null {
    const workflows = this.getWorkflows();
    const index = workflows.findIndex(w => w.id === id);
    
    if (index === -1) return null;

    workflows[index] = {
      ...workflows[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage(workflows);
    return workflows[index];
  }

  static deleteWorkflow(id: string): boolean {
    const workflows = this.getWorkflows();
    const filtered = workflows.filter(w => w.id !== id);
    
    if (filtered.length === workflows.length) return false;

    this.saveToStorage(filtered);
    return true;
  }

  static getWorkflow(id: string): Workflow | null {
    const workflows = this.getWorkflows();
    return workflows.find(w => w.id === id) || null;
  }

  static getWorkflows(): Workflow[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static searchWorkflows(query: string): Workflow[] {
    const workflows = this.getWorkflows();
    const lowerQuery = query.toLowerCase();

    return workflows.filter(w => 
      w.name.toLowerCase().includes(lowerQuery) ||
      w.description.toLowerCase().includes(lowerQuery) ||
      w.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  static exportWorkflows(): string {
    const workflows = this.getWorkflows();
    return JSON.stringify(workflows, null, 2);
  }

  static importWorkflows(jsonString: string): { success: boolean; imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;

    try {
      const workflows = JSON.parse(jsonString) as Workflow[];
      const existing = this.getWorkflows();

      workflows.forEach((workflow, index) => {
        try {
          // Validate workflow structure
          if (!workflow.name || !workflow.tasks || !Array.isArray(workflow.tasks)) {
            errors.push(`Workflow ${index + 1}: Invalid structure`);
            return;
          }

          // Generate new ID to avoid conflicts
          const newWorkflow: Workflow = {
            ...workflow,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          existing.push(newWorkflow);
          imported++;
        } catch (error) {
          errors.push(`Workflow ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      this.saveToStorage(existing);

      return { success: errors.length === 0, imported, errors };
    } catch (error) {
      return { 
        success: false, 
        imported: 0, 
        errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }

  private static saveToStorage(workflows: Workflow[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows));
  }

  private static generateId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
