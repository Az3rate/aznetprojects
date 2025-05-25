import type { RuntimeProcessNode } from '../components/playground/runtime-playground/types';

interface AIAnalysisRequest {
  code: string;
  executionData: {
    functions: Array<{
      name: string;
      executionTime: number;
      callCount: number;
      depth: number;
    }>;
    errors: string[];
    debugLogs: string[];
    patterns: {
      nestingDepth: number;
      asyncOperations: number;
      totalFunctions: number;
      cyclomaticComplexity: number;
      executionTime: number;
    };
  };
}

export interface AIInsight {
  type: 'performance' | 'security' | 'maintainability' | 'optimization' | 'error' | 'pattern';
  title: string;
  message: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestions: string[];
  codeReferences?: string[];
  codeRecommendation?: {
    description: string;
    improvedCode: string;
    explanation: string;
  };
}

export interface AIAnalysisResponse {
  insights: AIInsight[];
  overallScore: number;
  summary: string;
  recommendations: string[];
  fullCodeRecommendation?: {
    title: string;
    description: string;
    improvedCode: string;
    keyChanges: string[];
  };
}

interface OpenAIConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  maxRetries?: number;
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  error?: {
    message: string;
    type: string;
    code: string;
  };
}

export class AIAnalysisService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openai.com/v1';
  private readonly config: Required<OpenAIConfig>;
  private readonly isDevelopment: boolean;

  constructor(apiKey: string, config: OpenAIConfig = {}) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Valid API key is required for AI analysis service');
    }
    
    this.apiKey = apiKey;
    this.config = {
      model: config.model || 'gpt-4o',
      maxTokens: config.maxTokens || 8000,
      temperature: config.temperature || 0.7,
      timeout: config.timeout || 45000,
      maxRetries: config.maxRetries || 3
    };
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  async analyzeCodeExecution(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (!this.validateRequest(request)) {
      throw new Error('Invalid analysis request: missing required fields');
    }

    try {
      this.log('Starting AI analysis...');
      
      const prompt = this.buildAnalysisPrompt(request);
      const analysis = await this.callOpenAIWithRetry(prompt);
      
      this.log('AI analysis completed successfully');
      return analysis;

    } catch (error) {
      this.logError('AI analysis failed, using fallback:', error);
      return this.getFallbackAnalysis(request);
    }
  }

  private async callOpenAIWithRetry(prompt: string): Promise<AIAnalysisResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await this.callOpenAI(prompt);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logError(`Attempt ${attempt} failed:`, lastError);
        
        if (attempt < this.config.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await this.delay(delay);
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  private async callOpenAI(prompt: string): Promise<AIAnalysisResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const requestBody = {
        model: this.config.model,
        messages: [
          {
            role: 'system' as const,
            content: this.getSystemPrompt()
          },
          {
            role: 'user' as const,
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      return this.parseAndValidateResponse(content);

    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseAndValidateResponse(content: string): AIAnalysisResponse {
    const cleanContent = this.cleanResponseContent(content);
    
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanContent);
    } catch (error) {
      throw new Error(`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return this.validateAndNormalizeResponse(parsed);
  }

  private cleanResponseContent(content: string): string {
    return content
      .trim()
      .replace(/^```(?:json)?\s*/, '')
      .replace(/\s*```$/, '')
      .trim();
  }

  private validateAndNormalizeResponse(parsed: unknown): AIAnalysisResponse {
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI response is not a valid object');
    }
    
    const response = parsed as Record<string, unknown>;
    
    // Validate required fields
    if (!Array.isArray(response.insights)) {
      throw new Error('AI response missing valid insights array');
    }
    
    if (typeof response.overallScore !== 'number' || response.overallScore < 0 || response.overallScore > 100) {
      throw new Error('AI response missing valid overallScore (0-100)');
    }
    
    if (typeof response.summary !== 'string') {
      throw new Error('AI response missing valid summary string');
    }
    
    if (!Array.isArray(response.recommendations)) {
      throw new Error('AI response missing valid recommendations array');
    }

    // FIXED: Add validation for placeholder syntax in code
    const validateCodeForPlaceholders = (code: string, fieldName: string): void => {
      const placeholderPatterns = [
        /\{\s*\.\.\.\s*\}/,  // {...}
        /\/\/\s*\.\.\./,     // // ...
        /\/\*\s*\.\.\.\s*\*\//, // /* ... */
        /\[\s*content\s*\]/,  // [content]
        /<\s*content\s*>/,    // <content>
        /\.\.\./,             // any ellipsis
        /\/\*\s*implementation\s*\*\//, // /* implementation */
        /\/\/\s*implementation/, // // implementation
        /function\s+\w+\s*\([^)]*\)\s*\{\s*\}/, // empty function bodies
        /=>\s*\{\s*\}/, // empty arrow function bodies
      ];
      
      for (const pattern of placeholderPatterns) {
        if (pattern.test(code)) {
          throw new Error(`AI response contains placeholder syntax in ${fieldName}: ${pattern.source}`);
        }
      }
      
      // Additional check for suspiciously short function bodies
      const functionMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*\{([^}]*)\}/g);
      if (functionMatches) {
        for (const match of functionMatches) {
          const body = match.replace(/function\s+\w+\s*\([^)]*\)\s*\{/, '').replace(/\}$/, '').trim();
          if (body.length < 10 && !body.includes('return') && !body.includes('console')) {
            throw new Error(`AI response contains suspiciously empty function in ${fieldName}: ${match}`);
          }
        }
      }
    };

    // Validate insights structure
    const validatedInsights: AIInsight[] = response.insights.map((insight: unknown, index: number) => {
      if (!insight || typeof insight !== 'object') {
        throw new Error(`Invalid insight at index ${index}: not an object`);
      }
      
      const ins = insight as Record<string, unknown>;
      const validTypes = ['performance', 'security', 'maintainability', 'optimization', 'error', 'pattern'];
      const validPriorities = ['low', 'medium', 'high', 'critical'];
      
      if (!validTypes.includes(ins.type as string)) {
        throw new Error(`Invalid insight type at index ${index}: ${ins.type}`);
      }
      
      if (!validPriorities.includes(ins.priority as string)) {
        throw new Error(`Invalid insight priority at index ${index}: ${ins.priority}`);
      }
      
      if (typeof ins.confidence !== 'number' || ins.confidence < 0 || ins.confidence > 100) {
        throw new Error(`Invalid insight confidence at index ${index}: must be 0-100`);
      }
      
      if (typeof ins.title !== 'string' || typeof ins.message !== 'string') {
        throw new Error(`Invalid insight title or message at index ${index}: must be strings`);
      }
      
      if (!Array.isArray(ins.suggestions)) {
        throw new Error(`Invalid insight suggestions at index ${index}: must be array`);
      }
      
      // FIXED: Validate code recommendations for placeholders
      if (ins.codeRecommendation && typeof ins.codeRecommendation === 'object') {
        const codeRec = ins.codeRecommendation as Record<string, unknown>;
        if (typeof codeRec.improvedCode === 'string') {
          validateCodeForPlaceholders(codeRec.improvedCode, `insight[${index}].codeRecommendation.improvedCode`);
        }
      }
      
      return ins as unknown as AIInsight;
    });

    // FIXED: Validate fullCodeRecommendation for placeholders
    if (response.fullCodeRecommendation && typeof response.fullCodeRecommendation === 'object') {
      const fullCodeRec = response.fullCodeRecommendation as Record<string, unknown>;
      if (typeof fullCodeRec.improvedCode === 'string') {
        validateCodeForPlaceholders(fullCodeRec.improvedCode, 'fullCodeRecommendation.improvedCode');
      }
    }

    return {
      insights: validatedInsights,
      overallScore: response.overallScore as number,
      summary: response.summary as string,
      recommendations: response.recommendations as string[],
      fullCodeRecommendation: response.fullCodeRecommendation as AIAnalysisResponse['fullCodeRecommendation']
    };
  }

  private getSystemPrompt(): string {
    return `You are an expert JavaScript performance analyst and code reviewer. Analyze the provided code execution data and provide detailed insights about performance, security, maintainability, and optimization opportunities.

CRITICAL: You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON. Do not use markdown formatting.

TOKEN BUDGET: You have 8,000 tokens available for your response - use them to provide complete, detailed implementations.

CRITICAL CODE REQUIREMENTS - READ CAREFULLY:
- NEVER EVER use placeholder syntax like {...} or // ... or /* ... */ or [content] or <content>
- NEVER use ellipsis (...) or any abbreviated syntax
- ALWAYS provide COMPLETE, SYNTACTICALLY VALID JavaScript code that can run immediately
- All functions must have complete implementations with actual code inside
- Code must be immediately executable without ANY modification
- If you see async/await in original code, provide complete async/await implementations
- If you see Promise.all, provide complete Promise.all implementations
- Every function body must be fully written out
- Write out EVERY SINGLE LINE of code - don't abbreviate anything

EXAMPLE OF WHAT NOT TO DO:
❌ async function firstOperation() {...}
❌ function example() { /* implementation */ }
❌ // ... rest of code

EXAMPLE OF WHAT TO DO:
✅ async function firstOperation() {
  console.log('First operation starting');
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log('First operation completed');
  return 'first done';
}

RESPONSE FORMAT: Return ONLY this exact JSON structure with no additional text:

{
  "insights": [
    {
      "type": "performance",
      "title": "Brief insight title",
      "message": "Detailed explanation",
      "confidence": 95,
      "priority": "critical",
      "suggestions": ["Specific suggestion"],
      "codeRecommendation": {
        "description": "What this improves",
        "improvedCode": "async function artificialDelay(ms = 150) {\\n  return new Promise(resolve => setTimeout(resolve, ms));\\n}\\n\\nasync function example() {\\n  console.log('Complete working function');\\n  await artificialDelay(100);\\n  console.log('Function completed');\\n  return 'result';\\n}",
        "explanation": "Why this is better"
      }
    }
  ],
  "overallScore": 75,
  "summary": "Brief assessment",
  "recommendations": ["Top recommendations"],
  "fullCodeRecommendation": {
    "title": "Complete Refactor",
    "description": "Overall improvements",
    "improvedCode": "async function artificialDelay(ms = 150) {\\n  return new Promise(resolve => setTimeout(resolve, ms));\\n}\\n\\nasync function firstOperation() {\\n  console.log('First operation starting');\\n  await artificialDelay(1500);\\n  console.log('First operation completed');\\n  return 'first done';\\n}\\n\\nasync function secondOperation() {\\n  console.log('Second operation starting');\\n  await artificialDelay(2000);\\n  console.log('Second operation completed');\\n  return 'second done';\\n}\\n\\nasync function main() {\\n  console.log('Main function starting');\\n  await Promise.all([firstOperation(), secondOperation()]);\\n  console.log('Main function completed');\\n}\\n\\nmain();",
    "keyChanges": ["Replaced blocking delays with Promise-based delays", "Used Promise.all for parallel execution", "Improved async/await patterns"]
  }
}

ABSOLUTE RULES:
- Respond with ONLY the JSON object above, nothing else
- No markdown, no code blocks, no explanations outside JSON
- Provide COMPLETE, EXECUTABLE code in all improvedCode fields
- NEVER use {...} or similar placeholders - write the actual code
- Keep the same functionality but make it secure and performant
- All function bodies must be complete and syntactically valid
- Test that your code would run without syntax errors
- If original code has async operations, your improved code must have complete async implementations
- Every single function must be fully implemented, not abbreviated
- Use available tokens efficiently to provide comprehensive, complete code
- Write out every line within the 8,000 token budget!`;
  }

  private buildAnalysisPrompt(request: AIAnalysisRequest): string {
    const { code, executionData } = request;
    
    return `
Analyze this JavaScript code and return ONLY JSON:

CODE:
\`\`\`javascript
${code}
\`\`\`

EXECUTION DATA:
- Functions: ${executionData.patterns.totalFunctions}
- Nesting Depth: ${executionData.patterns.nestingDepth}
- Execution Time: ${executionData.patterns.executionTime}ms
- Errors: ${executionData.errors.length}
- Async Operations: ${executionData.patterns.asyncOperations}
- Cyclomatic Complexity: ${executionData.patterns.cyclomaticComplexity}

FUNCTION DETAILS:
${executionData.functions.map(f => 
  `- ${f.name}: ${f.executionTime}ms (called ${f.callCount}x, depth ${f.depth})`
).join('\n')}

${executionData.errors.length > 0 ? `
ERRORS:
${executionData.errors.map(e => `- ${e}`).join('\n')}
` : ''}

Focus on: security issues, performance problems, maintainability concerns.

Return ONLY valid JSON matching the exact structure specified in the system message. No other text.`.trim();
  }

  private getFallbackAnalysis(request: AIAnalysisRequest): AIAnalysisResponse {
    // Removed all hardcoded insights - only real GPT analysis should provide insights
    const insights: AIInsight[] = [];
    const { executionData } = request;

    // Simple scoring without fake insights
    const errorPenalty = executionData.errors.length * 20;
    const performancePenalty = executionData.patterns.executionTime > 1000 ? 15 : 0;
    const complexityPenalty = Math.max(0, (executionData.patterns.nestingDepth - 3) * 5);
    
    const overallScore = Math.max(0, 100 - errorPenalty - performancePenalty - complexityPenalty);

    return {
      insights: [], // No fake insights - only real GPT analysis will provide insights
      overallScore,
      summary: 'Basic analysis completed. For detailed insights, please use GPT analysis.',
      recommendations: ['Use GPT analysis for detailed recommendations and insights']
    };
  }

  private validateRequest(request: AIAnalysisRequest): boolean {
    return !!(
      request?.code && 
      typeof request.code === 'string' &&
      request.executionData &&
      typeof request.executionData === 'object' &&
      Array.isArray(request.executionData.functions) &&
      Array.isArray(request.executionData.errors) &&
      request.executionData.patterns &&
      typeof request.executionData.patterns.executionTime === 'number'
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private log(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.log(`[AI Service] ${message}`, data || '');
    }
  }

  private logError(message: string, error: unknown): void {
    if (this.isDevelopment) {
      console.error(`[AI Service] ${message}`, error);
    }
  }
}

// Factory function to create the service with better error handling
export const createAIAnalysisService = (apiKey: string, config?: OpenAIConfig) => {
  try {
    return new AIAnalysisService(apiKey, config);
  } catch (error) {
    throw new Error(`Failed to create AI analysis service: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
