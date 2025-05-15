import { apiService } from './api';

interface ChatResponse {
  message: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class AIService {
  private readonly endpoint = '/v1/chat/completions';
  private readonly model = 'gpt-4-turbo-preview';

  async chatCompanion(message: string, context: string): Promise<ChatResponse> {
    const prompt = `You are a friendly, supportive, and engaging AI chat companion. Respond to the user in a warm, conversational, and human-like way. Avoid technical or coding topics unless the user specifically asks. If the user just wants to chat, be a great listener and offer thoughtful, positive, and empathetic responses.\n\nUser: ${message}`;

    try {
      const response = await apiService.makeRequest<OpenAIResponse>(this.endpoint, {
        method: 'POST',
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a friendly AI chat companion.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 300
        })
      });

      return {
        message: response.choices[0].message.content
      };
    } catch (error) {
      console.error('Error getting chat response:', error);
      throw new Error('Failed to get chat response');
    }
  }
}

export const aiService = new AIService(); 