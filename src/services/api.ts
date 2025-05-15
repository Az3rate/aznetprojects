import { Command } from './commands';

interface ApiConfig {
  apiKey: string;
  apiUrl: string;
}

class ApiService {
  private config: ApiConfig;

  constructor() {
    // Get environment variables
    // aznetrule: debug env
    console.log('[API] process.env.VITE_API_KEY:', process.env.VITE_API_KEY);
    console.log('[API] process.env.VITE_API_URL:', process.env.VITE_API_URL);
    const apiKey = process.env.VITE_API_KEY;
    const apiUrl = process.env.VITE_API_URL;

    if (!apiKey) {
      throw new Error('API key is not configured. Please check your .env file.');
    }

    if (!apiUrl) {
      throw new Error('API URL is not configured. Please check your .env file.');
    }

    this.config = {
      apiKey,
      apiUrl
    };
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Add specific API methods here
  async getCommands(): Promise<Command[]> {
    return this.makeRequest<Command[]>('/commands');
  }

  async executeCommand(command: string, args: string[]): Promise<any> {
    return this.makeRequest('/execute', {
      method: 'POST',
      body: JSON.stringify({ command, args })
    });
  }
}

// Create a singleton instance
export const apiService = new ApiService(); 