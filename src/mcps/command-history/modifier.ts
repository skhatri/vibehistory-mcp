import { ModificationRule } from './config';

/**
 * Tracks modifications made to a command
 */
interface AppliedModification {
  type: string;
  pattern: string;
  replacement: string;
}

/**
 * Handles modifying commands based on configured rules
 */
export class CommandModifier {
  private rules: ModificationRule[];
  private appliedModifications: AppliedModification[];

  constructor(rules: ModificationRule[]) {
    this.rules = rules;
    this.appliedModifications = [];
  }

  /**
   * Apply all enabled modification rules to the request
   */
  process(request: any): any {
    // Clear previous modifications
    this.appliedModifications = [];
    
    if (!request) return request;
    
    // Create a deep copy of the original request
    const modifiedRequest = JSON.parse(JSON.stringify(request));
    
    // Process each enabled rule
    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      
      this.applyRule(modifiedRequest, rule);
    }
    
    return modifiedRequest;
  }

  /**
   * Get the list of modifications applied to the last processed request
   */
  getAppliedModifications(): AppliedModification[] {
    return [...this.appliedModifications];
  }

  /**
   * Apply a single rule to the request object
   */
  private applyRule(obj: any, rule: ModificationRule): any {
    // Skip if obj is null or undefined
    if (obj === null || obj === undefined) return obj;
    
    // Handle different types of objects
    if (typeof obj === 'string') {
      // For strings, apply regex replacement directly
      const originalValue = obj;
      const regex = new RegExp(rule.pattern, 'g');
      
      if (regex.test(originalValue)) {
        // Record the modification
        this.appliedModifications.push({
          type: rule.type,
          pattern: rule.pattern,
          replacement: rule.replacement
        });
        
        // Handle different modification types
        switch (rule.type) {
          case 'mask':
            return rule.replacement;
          case 'edit':
            return originalValue.replace(regex, rule.replacement);
          case 'enrich':
            return originalValue + ' ' + rule.replacement;
          default:
            return originalValue;
        }
      }
      
      return originalValue;
    } else if (Array.isArray(obj)) {
      // For arrays, apply to each element
      for (let i = 0; i < obj.length; i++) {
        obj[i] = this.applyRule(obj[i], rule);
      }
    } else if (typeof obj === 'object') {
      // For objects, apply to each property value
      for (const key in obj) {
        obj[key] = this.applyRule(obj[key], rule);
      }
    }
    
    return obj;
  }

  /**
   * Add a new rule
   */
  addRule(rule: ModificationRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove a rule by name
   */
  removeRule(ruleName: string): void {
    this.rules = this.rules.filter(rule => rule.name !== ruleName);
  }

  /**
   * Enable or disable a rule by name
   */
  setRuleEnabled(ruleName: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.name === ruleName);
    if (rule) {
      rule.enabled = enabled;
    }
  }
} 