import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { APIKeys } from '../types/types';

const client = new SecretsManagerClient({ 
  region: 'us-east-2'
});


class SecretsManager {
  private static instance: SecretsManager;
  private cachedSecrets: APIKeys | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  /**
   * Get API keys with caching
   */
  public async getAPIKeys(): Promise<APIKeys> {
    const now = Date.now();
    
    // Return cached secrets if they're still valid
    if (this.cachedSecrets && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cachedSecrets;
    }

    try {
      const command = new GetSecretValueCommand({
        SecretId: 'kitchenwise-api-keys',
      });
      
      const response = await client.send(command);
      
      if (response.SecretString) {
        const secrets = JSON.parse(response.SecretString);
        this.cachedSecrets = secrets;
        this.lastFetchTime = now;
        return secrets;
      }
      
      throw new Error('No secret string found in response');
    } catch (error) {
      console.error('Error fetching API keys from Secrets Manager:', error);
      
      // If we have cached secrets, return them as fallback
      if (this.cachedSecrets) {
        console.warn('Using cached API keys due to fetch error');
        return this.cachedSecrets;
      }
      
      throw new Error('Failed to fetch API keys from Secrets Manager');
    }
  }

  /**
   * Get a specific API key
   */
  public async getAPIKey(keyName: keyof APIKeys): Promise<string> {
    const secrets = await this.getAPIKeys();
    return secrets[keyName];
  }

}

export const secretsManager = SecretsManager.getInstance();
export const getAPIKeys = () => secretsManager.getAPIKeys();
export const getAPIKey = (keyName: keyof APIKeys) => secretsManager.getAPIKey(keyName);
