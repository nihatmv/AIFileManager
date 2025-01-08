import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export class OpenAIClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set.');
    }
  }

  async sendMessage(prompt: string): Promise<string> {
    const url = 'https://api.openai.com/v1/completions';
    const payload = {
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.7,
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.choices[0].text.trim();
  }
}
