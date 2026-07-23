import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private client: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY') ?? '';
    const baseURL = this.configService.get<string>('OPENAI_BASE_URL') 
      ?? 'https://openrouter.ai/api/v1';

    if (!apiKey) {
      this.logger.warn('[AI] OPENAI_API_KEY not configured');
    }

    this.client = new OpenAI({
      apiKey,
      baseURL,
      defaultHeaders: {
        'HTTP-Referer': 'https://juxtravel.com',
        'X-Title': 'JuxTravel',
      },
    });

    this.logger.log(`[AI] OpenAI client initialized (baseURL: ${baseURL})`);
  }

  getClient(): OpenAI {
    return this.client;
  }

  async createEmbedding(text: string): Promise<number[]> {
    const model = this.configService.get<string>('OPENAI_EMBEDDING_MODEL') 
      ?? 'openai/text-embedding-3-small';
    
    try {
      const response = await this.client.embeddings.create({
        model,
        input: text,
      });
      return response.data[0].embedding;
    } catch (error: any) {
      this.logger.error(`[AI] Embedding failed: ${error?.message}`);
      throw error;
    }
  }

  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    temperature: number = 0.3,
  ): Promise<string> {
    const model = this.configService.get<string>('OPENAI_LLM_MODEL') 
      ?? 'google/gemini-2.0-flash-exp:free';
    
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: 1000,
      });
      return response.choices[0]?.message?.content ?? '';
    } catch (error: any) {
      this.logger.error(`[AI] Completion failed: ${error?.message}`);
      throw error;
    }
  }
}
