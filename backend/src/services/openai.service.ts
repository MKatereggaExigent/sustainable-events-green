import axios from 'axios';
import logger from '../utils/logger';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenAIService {
  private apiKey: string;
  private endpoint: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.endpoint = process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '4000');
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');

    if (!this.apiKey) {
      logger.warn('OpenAI API key not configured. AI features will be disabled.');
    }
  }

  /**
   * Check if OpenAI is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Send a chat completion request to OpenAI
   */
  async chat(messages: OpenAIMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API is not configured');
    }

    try {
      const response = await axios.post<OpenAIResponse>(
        this.endpoint,
        {
          model: options?.model || this.model,
          messages,
          temperature: options?.temperature ?? this.temperature,
          max_tokens: options?.maxTokens || this.maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 second timeout
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      logger.info('OpenAI request successful', {
        model: response.data.model,
        tokens: response.data.usage.total_tokens,
      });

      return content;
    } catch (error: any) {
      logger.error('OpenAI request failed', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(`OpenAI request failed: ${error.message}`);
    }
  }

  /**
   * Generate a simple completion with a single prompt
   */
  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: OpenAIMessage[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });
    
    return this.chat(messages);
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
    const fullSystemPrompt = systemPrompt 
      ? `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.`
      : 'Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.';
    
    const response = await this.complete(prompt, fullSystemPrompt);
    
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;
      
      return JSON.parse(jsonString.trim());
    } catch (error) {
      logger.error('Failed to parse OpenAI JSON response', { response });
      throw new Error('Invalid JSON response from OpenAI');
    }
  }
}

export default new OpenAIService();

