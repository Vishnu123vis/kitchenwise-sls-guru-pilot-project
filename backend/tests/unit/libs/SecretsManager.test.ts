import { secretsManager } from '../../../src/libs/SecretsManager';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

// Mock the AWS SDK
jest.mock('@aws-sdk/client-secrets-manager');

const mockSecretsManagerClient = SecretsManagerClient as jest.MockedClass<typeof SecretsManagerClient>;
const mockSend = jest.fn();

describe('SecretsManager Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecretsManagerClient.prototype.send = mockSend;
    // Clear the cache before each test
    secretsManager.clearCache();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = secretsManager;
      const instance2 = secretsManager;
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('getAPIKeys', () => {
    it('should fetch API keys successfully', async () => {
      const mockResponse = {
        SecretString: JSON.stringify({ OPENAI_API_KEY: 'test-openai-key', PEXELS_API_KEY: 'test-pexels-key' })
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      const result = await secretsManager.getAPIKeys();
      
      expect(result).toEqual({ OPENAI_API_KEY: 'test-openai-key', PEXELS_API_KEY: 'test-pexels-key' });
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should use cached value on subsequent calls', async () => {
      const mockResponse = {
        SecretString: JSON.stringify({ OPENAI_API_KEY: 'test-openai-key', PEXELS_API_KEY: 'test-pexels-key' })
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      // First call
      const result1 = await secretsManager.getAPIKeys();
      expect(result1).toEqual({ OPENAI_API_KEY: 'test-openai-key', PEXELS_API_KEY: 'test-pexels-key' });
      
      // Second call should use cache
      const result2 = await secretsManager.getAPIKeys();
      expect(result2).toEqual({ OPENAI_API_KEY: 'test-openai-key', PEXELS_API_KEY: 'test-pexels-key' });
      
      // Should only call AWS once
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should handle missing secret', async () => {
      const mockResponse = {
        SecretString: undefined
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      await expect(secretsManager.getAPIKeys()).rejects.toThrow('Failed to fetch API keys from Secrets Manager');
    });

    it('should handle malformed secret', async () => {
      const mockResponse = {
        SecretString: 'invalid-json'
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      await expect(secretsManager.getAPIKeys()).rejects.toThrow('Failed to fetch API keys from Secrets Manager');
    });

    it('should handle AWS errors', async () => {
      const mockError = new Error('AWS Error');
      mockSend.mockRejectedValueOnce(mockError);
      
      await expect(secretsManager.getAPIKeys()).rejects.toThrow('Failed to fetch API keys from Secrets Manager');
    });
  });

  describe('getAPIKey', () => {
    it('should fetch specific API key successfully', async () => {
      const mockResponse = {
        SecretString: JSON.stringify({ OPENAI_API_KEY: 'test-openai-key', PEXELS_API_KEY: 'test-pexels-key' })
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      const result = await secretsManager.getAPIKey('OPENAI_API_KEY');
      expect(result).toBe('test-openai-key');
    });

    it('should fetch Pexels API key successfully', async () => {
      const mockResponse = {
        SecretString: JSON.stringify({ OPENAI_API_KEY: 'test-openai-key', PEXELS_API_KEY: 'test-pexels-key' })
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      const result = await secretsManager.getAPIKey('PEXELS_API_KEY');
      expect(result).toBe('test-pexels-key');
    });

    it('should handle missing secret', async () => {
      const mockResponse = {
        SecretString: undefined
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      await expect(secretsManager.getAPIKey('OPENAI_API_KEY')).rejects.toThrow('Failed to fetch API keys from Secrets Manager');
    });

    it('should handle malformed secret', async () => {
      const mockResponse = {
        SecretString: 'invalid-json'
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      await expect(secretsManager.getAPIKey('OPENAI_API_KEY')).rejects.toThrow('Failed to fetch API keys from Secrets Manager');
    });

    it('should handle AWS errors', async () => {
      const mockError = new Error('AWS Error');
      mockSend.mockRejectedValueOnce(mockError);
      
      await expect(secretsManager.getAPIKey('OPENAI_API_KEY')).rejects.toThrow('Failed to fetch API keys from Secrets Manager');
    });
  });

  describe('Cache Management', () => {
    it('should clear cache when clearCache is called', async () => {
      const mockResponse = {
        SecretString: JSON.stringify({ OPENAI_API_KEY: 'test-openai-key', PEXELS_API_KEY: 'test-pexels-key' })
      };
      
      mockSend.mockResolvedValue(mockResponse);
      
      // First call
      await secretsManager.getAPIKeys();
      expect(mockSend).toHaveBeenCalledTimes(1);
      
      // Clear cache
      secretsManager.clearCache();
      
      // Second call should fetch again
      await secretsManager.getAPIKeys();
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should handle cache expiration', async () => {
      const mockResponse = {
        SecretString: JSON.stringify({ OPENAI_API_KEY: 'test-openai-key', PEXELS_API_KEY: 'test-pexels-key' })
      };
      
      mockSend.mockResolvedValue(mockResponse);
      
      // First call
      await secretsManager.getAPIKeys();
      expect(mockSend).toHaveBeenCalledTimes(1);
      
      // Simulate cache expiration by manually clearing
      secretsManager.clearCache();
      
      // Second call should fetch again
      await secretsManager.getAPIKeys();
      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network error');
      mockSend.mockRejectedValueOnce(mockError);
      
      await expect(secretsManager.getAPIKeys()).rejects.toThrow('Failed to fetch API keys from Secrets Manager');
    });

    it('should handle timeout errors', async () => {
      const mockError = new Error('Timeout');
      mockSend.mockRejectedValueOnce(mockError);
      
      await expect(secretsManager.getAPIKeys()).rejects.toThrow('Failed to fetch API keys from Secrets Manager');
    });

    it('should handle permission errors', async () => {
      const mockError = new Error('Access Denied');
      mockSend.mockRejectedValueOnce(mockError);
      
      await expect(secretsManager.getAPIKeys()).rejects.toThrow('Failed to fetch API keys from Secrets Manager');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty secret string', async () => {
      const mockResponse = {
        SecretString: ''
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      await expect(secretsManager.getAPIKeys()).rejects.toThrow('Failed to fetch API keys from Secrets Manager');
    });

    it('should handle secret with only whitespace', async () => {
      const mockResponse = {
        SecretString: '   '
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      await expect(secretsManager.getAPIKeys()).rejects.toThrow('Failed to fetch API keys from Secrets Manager');
    });

    it('should handle secret with null values', async () => {
      const mockResponse = {
        SecretString: JSON.stringify({ OPENAI_API_KEY: null, PEXELS_API_KEY: 'test-pexels-key' })
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      const result = await secretsManager.getAPIKeys();
      expect(result.OPENAI_API_KEY).toBeNull();
      expect(result.PEXELS_API_KEY).toBe('test-pexels-key');
    });

    it('should handle secret with undefined values', async () => {
      const mockResponse = {
        SecretString: JSON.stringify({ OPENAI_API_KEY: undefined, PEXELS_API_KEY: 'test-pexels-key' })
      };
      
      mockSend.mockResolvedValueOnce(mockResponse);
      
      const result = await secretsManager.getAPIKeys();
      expect(result.OPENAI_API_KEY).toBeUndefined();
      expect(result.PEXELS_API_KEY).toBe('test-pexels-key');
    });
  });
});
