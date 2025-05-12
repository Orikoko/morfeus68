import { NextApiRequest } from 'next';

class SecretsManager {
  private static instance: SecretsManager;
  private readonly secrets: Map<string, string>;

  private constructor() {
    this.secrets = new Map();
    this.loadSecrets();
  }

  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  private loadSecrets(): void {
    // Load secrets from environment variables
    const requiredSecrets = [
      'OPENAI_API_KEY',
      'TELEGRAM_BOT_TOKEN',
      'FX_API_KEY'
    ];

    requiredSecrets.forEach(key => {
      const value = process.env[key];
      if (!value) {
        console.warn(`Warning: ${key} is not set in environment variables`);
      }
      this.secrets.set(key, value || '');
    });
  }

  public getSecret(key: string): string {
    const value = this.secrets.get(key);
    if (!value) {
      throw new Error(`Secret ${key} not found`);
    }
    return value;
  }

  public validateApiKey(req: NextApiRequest): boolean {
    const apiKey = req.headers['x-api-key'];
    return apiKey === this.getSecret('FX_API_KEY');
  }
}

// Export utility functions
export function getOpenAIKey(): string {
  return SecretsManager.getInstance().getSecret('OPENAI_API_KEY');
}

export function getTelegramToken(): string {
  return SecretsManager.getInstance().getSecret('TELEGRAM_BOT_TOKEN');
}

export function getFXApiKey(): string {
  return SecretsManager.getInstance().getSecret('FX_API_KEY');
}

export function validateApiKey(req: NextApiRequest): boolean {
  return SecretsManager.getInstance().validateApiKey(req);
}