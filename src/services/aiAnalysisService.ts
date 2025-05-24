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

export class AIAnalysisService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openai.com/v1';
  private readonly model = 'gpt-4';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeCodeExecution(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      console.log('[AI Service] Starting OpenAI API call...');
      console.log('[AI Service] Request data:', {
        codeLength: request.code.length,
        functionsCount: request.executionData.functions.length,
        errorsCount: request.executionData.errors.length
      });
      
      const prompt = this.buildAnalysisPrompt(request);
      console.log('[AI Service] Prompt length:', prompt.length);
      
      const requestBody = JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert JavaScript performance analyst and code reviewer. Analyze the provided code execution data and provide detailed insights about performance, security, maintainability, and optimization opportunities. 

CRITICAL: You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON. Do not use markdown formatting.

CRITICAL CODE REQUIREMENTS:
- NEVER use placeholder syntax like {...} or // ... or /* ... */
- ALWAYS provide COMPLETE, SYNTACTICALLY VALID JavaScript code
- All functions must have complete implementations
- Code must be immediately executable without modification

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
        "improvedCode": "function artificialDelay(ms = 150) {\\n  return new Promise(resolve => setTimeout(resolve, ms));\\n}\\n\\nfunction example() {\\n  console.log('Complete working function');\\n  return 'result';\\n}",
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
    "improvedCode": "function artificialDelay(ms = 150) {\\n  return new Promise(resolve => setTimeout(resolve, ms));\\n}\\n\\nfunction inner() {\\n  console.log('Inner function starting');\\n  return 'inner result';\\n}\\n\\nfunction outer() {\\n  console.log('Outer function starting');\\n  inner();\\n  console.log('Outer function completed');\\n}\\n\\nconsole.log('Starting execution');\\nouter();\\nconsole.log('Execution complete');",
    "keyChanges": ["Major improvements"]
  }
}

RULES:
- Respond with ONLY the JSON object above, nothing else
- No markdown, no code blocks, no explanations outside JSON
- Provide COMPLETE, EXECUTABLE code in all improvedCode fields
- NEVER use {...} or similar placeholders - write the actual code
- Keep the same functionality but make it secure and performant
- All function bodies must be complete and syntactically valid
- Test that your code would run without syntax errors`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      });
      
      console.log('[AI Service] Making API request to OpenAI...');
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: requestBody
      });

      console.log('[AI Service] OpenAI response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AI Service] OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[AI Service] OpenAI response received:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        usage: data.usage
      });
      
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.error('[AI Service] No content in OpenAI response:', data);
        throw new Error('No content received from OpenAI API');
      }

      console.log('[AI Service] GPT content length:', content.length);
      
      // Strip markdown code block wrappers if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        console.log('[AI Service] Stripped markdown code block wrapper');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        console.log('[AI Service] Stripped generic code block wrapper');
      }
      
      console.log('[AI Service] Clean content length:', cleanContent.length);
      
      // Parse the JSON response from GPT
      let analysis: AIAnalysisResponse;
      try {
        analysis = JSON.parse(cleanContent) as AIAnalysisResponse;
        console.log('[AI Service] Successfully parsed GPT response:', {
          insightsCount: analysis.insights?.length || 0,
          overallScore: analysis.overallScore,
          hasFullCodeRecommendation: !!analysis.fullCodeRecommendation
        });
      } catch (parseError) {
        console.error('[AI Service] Failed to parse GPT response as JSON:', parseError);
        console.error('[AI Service] Raw content length:', cleanContent.length);
        
        // Try to fix incomplete JSON by adding missing closing braces
        let fixedContent = cleanContent;
        
        // Count open and close braces to detect truncation
        const openBraces = (cleanContent.match(/{/g) || []).length;
        const closeBraces = (cleanContent.match(/}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        
        if (missingBraces > 0) {
          console.log(`[AI Service] Detected ${missingBraces} missing closing braces, attempting to fix...`);
          
          // Remove any incomplete last string and add missing braces
          fixedContent = cleanContent.replace(/[^"}]*$/, '') + '}'.repeat(missingBraces);
          
          try {
            analysis = JSON.parse(fixedContent) as AIAnalysisResponse;
            console.log('[AI Service] Successfully repaired and parsed truncated JSON response');
          } catch (repairError) {
            console.error('[AI Service] Failed to repair JSON, falling back to rule-based analysis');
            throw new Error(`GPT response was truncated and could not be repaired: ${parseError}`);
          }
        } else {
          console.error('[AI Service] JSON parsing failed for unknown reason');
          console.error('[AI Service] First 200 chars of content:', cleanContent.substring(0, 200));
          throw new Error(`Failed to parse OpenAI response as JSON: ${parseError}`);
        }
      }
      
      return analysis;

    } catch (error) {
      console.error('[AI Service] Error in analyzeCodeExecution:', error);
      
      // Fallback to enhanced rule-based analysis if API fails
      console.log('[AI Service] Falling back to rule-based analysis...');
      return this.getFallbackAnalysis(request);
    }
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

Focus on: security issues, performance problems, maintainability concerns.

Return ONLY valid JSON matching the exact structure specified in the system message. No other text.
    `.trim();
  }

  private getFallbackAnalysis(request: AIAnalysisRequest): AIAnalysisResponse {
    const insights: AIInsight[] = [];
    const { executionData } = request;

    // Enhanced fallback analysis
    if (executionData.patterns.nestingDepth > 5) {
      insights.push({
        type: 'maintainability',
        title: 'Deep Function Nesting Detected',
        message: `Your code has ${executionData.patterns.nestingDepth} levels of nesting, which can hurt readability and maintainability.`,
        confidence: 90,
        priority: 'medium',
        suggestions: [
          'Consider extracting nested functions into separate, named functions',
          'Use early returns to reduce nesting levels',
          'Consider implementing the Strategy pattern for complex conditional logic'
        ]
      });
    }

    if (executionData.patterns.executionTime > 1000) {
      insights.push({
        type: 'performance',
        title: 'Long Execution Time',
        message: `Total execution time of ${executionData.patterns.executionTime}ms is quite high and may impact user experience.`,
        confidence: 85,
        priority: 'high',
        suggestions: [
          'Consider breaking long-running operations into smaller chunks',
          'Implement lazy loading for non-critical operations',
          'Use Web Workers for CPU-intensive tasks'
        ]
      });
    }

    if (executionData.errors.length > 0) {
      insights.push({
        type: 'error',
        title: 'Runtime Errors Detected',
        message: `Found ${executionData.errors.length} error(s) that need attention.`,
        confidence: 100,
        priority: 'critical',
        suggestions: [
          'Implement proper error handling with try-catch blocks',
          'Add input validation to prevent runtime errors',
          'Consider using TypeScript for better type safety'
        ]
      });
    }

    const overallScore = Math.max(0, 100 - (executionData.patterns.nestingDepth * 5) - (executionData.errors.length * 20) - (executionData.patterns.executionTime > 1000 ? 15 : 0));

    return {
      insights,
      overallScore,
      summary: insights.length === 0 ? 
        'Code execution appears clean with no major issues detected.' :
        `Detected ${insights.length} area(s) for improvement focusing on ${insights[0].type}.`,
      recommendations: insights.flatMap(i => i.suggestions).slice(0, 5)
    };
  }
}

// Factory function to create the service
export const createAIAnalysisService = (apiKey: string) => {
  return new AIAnalysisService(apiKey);
};
