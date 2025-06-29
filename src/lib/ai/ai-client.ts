import { GoogleGenerativeAI } from '@google/generative-ai';
import { ValidationError } from '@/types';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] || '');

export class AIClient {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Generate suggestions for fixing validation errors
   */
  async generateErrorFix(error: ValidationError): Promise<string> {
    const prompt = `You are an expert data validation assistant. Given a validation error, provide a clear, actionable suggestion to fix it. Keep your response concise and practical.

Error Details:
- Type: ${error.type}
- Severity: ${error.severity}
- Entity: ${error.entityType}
- Field: ${error.field || 'N/A'}
- Message: ${error.message}

Provide a specific suggestion to fix this error. Focus on practical steps the user can take.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('AI error fix generation failed:', error);
      throw new Error('Failed to generate error fix suggestion');
    }
  }

  /**
   * Generate JavaScript filter code from natural language query
   */
  async generateFilterCode(query: string, entity: string): Promise<string> {
    const prompt = `You are an assistant for a scheduling app. Given a user query in plain English, generate a JavaScript filter function (as a string) that takes a row object for a ${entity} and returns true if it matches. Only output the function body, not the function keyword. Query: "${query}"`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('AI filter code generation failed:', error);
      throw new Error('Failed to generate filter code');
    }
  }

  /**
   * Generate JavaScript mutation code from natural language command
   */
  async generateMutationCode(command: string, entity: string): Promise<string> {
    const prompt = `You are an assistant for a scheduling app. Given a user command in plain English, generate a JavaScript function body (as a string) that takes an array of ${entity} rows and mutates them in-place according to the command. Only output the function body, not the function keyword. Command: "${command}"`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('AI mutation code generation failed:', error);
      throw new Error('Failed to generate mutation code');
    }
  }

  /**
   * Generate business rule recommendations based on data analysis
   */
  async generateRecommendations(insights: any): Promise<string> {
    const prompt = `You are an expert business rule consultant. Based on the following data insights, provide brief, actionable descriptions for business rules that would improve the system.

Data Insights:
- ${insights.clientCount} clients, ${insights.workerCount} workers, ${insights.taskCount} tasks
- ${insights.highPriorityClients} high priority clients
- ${insights.overloadedWorkers} potentially overloaded workers
- ${insights.longTasks} long-duration tasks
- Skill gaps: ${insights.skillGaps.join(', ') || 'None detected'}

Provide 2-3 brief, practical recommendations for business rules that would address these issues. Keep each description under 100 words.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('AI recommendations generation failed:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  /**
   * Convert natural language to business rule JSON
   */
  async convertToRule(prompt: string): Promise<any> {
    const systemInstruction = `
You are a rules converter. Based on the user's natural language input, return a strict JSON rule object that fits one of the following types:
1. { type: "coRun", tasks: [TaskID1, TaskID2, ...] }
2. { type: "slotRestriction", group: "...", minSlots: N }
3. { type: "loadLimit", group: "...", maxPerPhase: N }
4. { type: "phaseWindow", task: "...", phases: [N, N, ...] }

Only return the JSON object, no explanation or markdown formatting.`;

    try {
      const result = await this.model.generateContent([systemInstruction, prompt]);
      const text = result.response.text().trim();
      
      const clean = text
        .replace(/```(?:json)?/g, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(clean);
    } catch (error) {
      console.error('AI rule conversion failed:', error);
      throw new Error('Failed to convert natural language to rule');
    }
  }

  /**
   * Generate natural language filter for data
   */
  async generateNLFilter(prompt: string, entity: string): Promise<string> {
    const instruction = `Given a plain English query about ${entity} data, return a JavaScript expression string for filtering rows. Output ONLY the expression. Don't explain.`;

    try {
      const result = await this.model.generateContent([instruction, prompt]);
      const text = result.response.text().trim();

      return text
        .replace(/^[`]*javascript/g, '')
        .replace(/[`]+/g, '')
        .trim();
    } catch (error) {
      console.error('AI NL filter generation failed:', error);
      throw new Error('Failed to generate natural language filter');
    }
  }

  /**
   * Fix data errors with AI suggestions
   */
  async fixDataError(column: string, value: any, message: string, row: any, dataset: any[]): Promise<string> {
    const sampleValidValues = Array.from(
      new Set(
        dataset
          .map((entry: any) => entry[column])
          .filter((v: any) => v && v !== value)
      )
    ).slice(0, 5);

    const prompt = `
You are a data validation AI.

A column "${column}" has a value "${value}" which causes the error: "${message}".

Here is the full row context:
${JSON.stringify(row, null, 2)}

Here are some other valid values in the "${column}" column:
${sampleValidValues.join(', ')}

Suggest a corrected value for "${column}" that fits the context of this row. Respond with ONLY the corrected value. Do not include any explanation or formatting.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim().replace(/^"|"$/g, ''); // remove quotes if present
    } catch (error) {
      console.error('AI data error fix failed:', error);
      throw new Error('Failed to fix data error');
    }
  }
}

// Export singleton instance
export const aiClient = new AIClient(); 