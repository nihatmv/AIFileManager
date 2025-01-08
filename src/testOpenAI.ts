import axios, { AxiosError } from 'axios';

const YOUR_API_KEY = process.env.OPENAI_API_KEY || '';

interface Message {
  role: string;
  content: string;
}

interface Choice {
  message: Message;
}

interface ApiResponse {
  choices: Choice[];
}

// Define the OpenAI API client
export class OpenAIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(prompt: string): Promise<ApiResponse> {
    const url = 'https://api.openai.com/v1/chat/completions';
    const message = [
      {
        role: 'developer',
        content: `${prompt}`,
      },
    ];

    const payload = {
      model: 'gpt-4o-mini', // Adjust the model if needed
      messages: message,
      max_tokens: 5000,
      temperature: 0,
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios Error:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error; // Re-throwing the error for higher-level handling
    }
  }
}
